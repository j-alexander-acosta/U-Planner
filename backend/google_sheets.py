import gspread
from sqlalchemy.orm import Session
import models
import uuid

# ID of the Google Sheet
SPREADSHEET_ID = '1rlitBQJ_0-0GwYqq3J6VTT6bQYcWJvO7uAuhTMPrSTM'

class GoogleSheetsService:
    def __init__(self, credentials_file: str = "service_account.json"):
        self.gc = gspread.service_account(filename=credentials_file)

    def sync_full_data(self, db: Session):
        """
        Orchestrates the synchronization of Faculties, Teachers, and Subjects from the Google Sheet.
        """
        try:
            sh = self.gc.open_by_key(SPREADSHEET_ID)
            # Assuming data is in the first worksheet or a specific named one. 
            # Based on inspection, worksheet name was "CARGA" but index 0 works too.
            ws = sh.get_worksheet(0) 
            rows = ws.get_all_records() # Returns list of dicts with headers as keys
        except Exception as e:
            raise Exception(f"Error accessing Google Sheet: {e}")

        # 1. Sync Faculties (CARRERA)
        self._sync_faculties(db, rows)

        # 2. Sync Teachers (DOCENTE)
        self._sync_teachers(db, rows)

        # 3. Sync Subjects (ASIGNATURA)
        self._sync_subjects(db, rows)

        return {"message": "Sincronización completada exitosamente", "rows_processed": len(rows)}

    def _sync_faculties(self, db: Session, rows: list):
        """
        Extracts unique 'CARRERA' values and ensures they exist as Faculties.
        """
        unique_faculties = {row.get('CARRERA').strip() for row in rows if row.get('CARRERA')}
        
        for faculty_name in unique_faculties:
            if not faculty_name: continue
            
            existing = db.query(models.Faculty).filter(models.Faculty.name == faculty_name).first()
            if not existing:
                new_faculty = models.Faculty(name=faculty_name)
                db.add(new_faculty)
        db.commit()

    def _sync_teachers(self, db: Session, rows: list):
        """
        Extracts unique 'DOCENTE' values. Creates new teachers with generated RUTs if they don't exist.
        """
        unique_teachers = {row.get('DOCENTE').strip() for row in rows if row.get('DOCENTE')}

        for teacher_name in unique_teachers:
            if not teacher_name or teacher_name == "0": continue # Skip invalid names

            # Try to find by name (approximate match since we don't have RUT in sheet)
            # In a real scenario, we might want to be more careful here.
            existing = db.query(models.Teacher).filter(models.Teacher.full_name == teacher_name).first()
            
            if not existing:
                # Generate a placeholder RUT
                fake_rut = f"TEMP-{uuid.uuid4().hex[:8].upper()}"
                new_teacher = models.Teacher(full_name=teacher_name, rut=fake_rut)
                db.add(new_teacher)
        db.commit()

    def _sync_subjects(self, db: Session, rows: list):
        """
        Syncs Subjects based on 'ASIGNATURA'. 
        Updates 'enrolled_students' from 'CUPO'.
        Links to Faculty based on 'CARRERA'.
        """
        # Ensure a default RoomType exists for new subjects (required field)
        default_room_type = db.query(models.RoomType).first()
        if not default_room_type:
            default_room_type = models.RoomType(name="General")
            db.add(default_room_type)
            db.commit()
            db.refresh(default_room_type)

        processed_subjects = 0
        
        for row in rows:
            subject_name = row.get('ASIGNATURA')
            faculty_name = row.get('CARRERA')
            cupo = row.get('CUPO')

            if not subject_name: continue

            # Resolve Faculty ID
            faculty = None
            if faculty_name:
                faculty = db.query(models.Faculty).filter(models.Faculty.name == faculty_name.strip()).first()
            
            # Find subject by name
            subject = db.query(models.Subject).filter(models.Subject.name == subject_name.strip()).first()

            # Parse enrolled_students (CUPO)
            try:
                enrolled = int(cupo) if cupo else 0
            except ValueError:
                enrolled = 0

            if subject:
                # Update existing
                subject.enrolled_students = enrolled
                if faculty:
                    subject.faculty_id = faculty.id
            else:
                # Create new
                new_subject = models.Subject(
                    name=subject_name.strip(),
                    enrolled_students=enrolled,
                    required_room_type_id=default_room_type.id,
                    faculty_id=faculty.id if faculty else None
                )
                db.add(new_subject)
            
            processed_subjects += 1
            
            # Commit in batches or all at once? All at once for now is fine for size.
        
        db.commit()
