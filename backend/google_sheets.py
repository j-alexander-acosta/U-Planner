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
            ws = sh.worksheet("PRESENCIAL") 
            rows = ws.get_all_records() # Returns list of dicts with headers as keys
        except Exception as e:
            raise Exception(f"Error accessing Google Sheet: {e}")

        # 1. Sync Faculties (CARRERA)
        self._sync_faculties(db, rows)

        # 2. Sync Teachers (DOCENTE)
        self._sync_teachers(db, rows)

        # 3. Sync Subjects (ASIGNATURA)
        self._sync_subjects(db, rows)

        # 4. Sync Rooms (SALAS)
        try:
            ws_rooms = sh.worksheet("SALAS")
            rows_rooms = ws_rooms.get_all_records()
            self._sync_rooms(db, rows_rooms)
        except Exception as e:
            print(f"Warning: Could not sync rooms from SALAS sheet: {e}")


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
        Extracts 'CODIGO DOCENTE' and 'DOCENTE'. 
        Upserts teachers based on 'CODIGO DOCENTE' (mapped to rut).
        """
        # Dictionary to dedup teachers by RUT. Last seen name wins.
        teachers_map = {}
        
        for row in rows:
            rut_raw = row.get('CODIGO DOCENTE')
            name_raw = row.get('DOCENTE')
            
            # Basic validation
            if not rut_raw or str(rut_raw).strip() == "0" or not name_raw:
                continue
                
            rut = str(rut_raw).strip()
            name = str(name_raw).strip()
            
            teachers_map[rut] = name
            
        for rut, name in teachers_map.items():
            # Try to find by RUT
            existing = db.query(models.Teacher).filter(models.Teacher.rut == rut).first()
            
            if existing:
                # Update name if changed
                if existing.full_name != name:
                    existing.full_name = name
            else:
                # Create new
                new_teacher = models.Teacher(full_name=name, rut=rut)
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
            subject_code = row.get('CODRAMO')
            faculty_name = row.get('CARRERA')
            cupo = row.get('CUPO')
            
            # New columns
            plan_year = str(row.get('AÑO_PLAN')) if row.get('AÑO_PLAN') else None
            career_code = str(row.get('CODCARR')) if row.get('CODCARR') else None
            level = str(row.get('NIVEL')) if row.get('NIVEL') else None
            equivalent = str(row.get('EQUIVALENTE')) if row.get('EQUIVALENTE') else None
            section = str(row.get('SECCION')) if row.get('SECCION') else None

            if not subject_name: continue

            # Resolve Faculty ID
            faculty = None
            if faculty_name:
                faculty = db.query(models.Faculty).filter(models.Faculty.name == faculty_name.strip()).first()
            
            # Find subject logic:
            # 1. Try to find by Code AND Section (Best match)
            # 2. If not found, Try to find by Code AND Section IS NULL (Claim legacy record)
            # 3. If not found, Create New.

            subject = None
            if subject_code:
                # Search by Code + Section
                if section:
                    subject = db.query(models.Subject).filter(
                        models.Subject.code == str(subject_code).strip(), 
                        models.Subject.section == str(section).strip()
                    ).first()
                
                # If not found, try to claim a record with NULL section (only if current row has a section)
                if not subject and section:
                    subject = db.query(models.Subject).filter(
                        models.Subject.code == str(subject_code).strip(), 
                        models.Subject.section == None
                    ).first()
            
            # Fallback for legacy name-only match (if code is missing, unlikely)
            if not subject and not subject_code:
                 subject = db.query(models.Subject).filter(models.Subject.name == subject_name.strip()).first()

            # Parse enrolled_students (CUPO)
            try:
                enrolled = int(cupo) if cupo else 0
            except ValueError:
                enrolled = 0

            # Parse code
            code = str(subject_code).strip() if subject_code else None

            if subject:
                # Update existing (or claimed)
                subject.enrolled_students = enrolled
                if code: subject.code = code.strip()
                if plan_year: subject.plan_year = str(plan_year).strip()
                if career_code: subject.career_code = str(career_code).strip()
                if level: subject.level = str(level).strip()
                if equivalent: subject.equivalent = str(equivalent).strip()
                if section: subject.section = str(section).strip()
                if subject_name: subject.name = subject_name.strip()
                
                if faculty:
                    subject.faculty_id = faculty.id
            else:
                # Create new
                new_subject = models.Subject(
                    name=subject_name.strip(),
                    code=code,
                    plan_year=str(plan_year).strip() if plan_year else None,
                    career_code=str(career_code).strip() if career_code else None,
                    level=str(level).strip() if level else None,
                    equivalent=str(equivalent).strip() if equivalent else None,
                    section=str(section).strip() if section else None,
                    enrolled_students=enrolled,
                    required_room_type_id=default_room_type.id,
                    faculty_id=faculty.id if faculty else None
                )
                db.add(new_subject)
                db.flush() # Ensure it's visible for next iteration match
            
            processed_subjects += 1
            
            # Commit in batches or all at once? All at once for now is fine for size.
        
        db.commit()
        db.commit()

    def _sync_rooms(self, db: Session, rows: list):
        """
        Syncs Rooms based on 'CODSALA'.
        Maps:
        - CODSALA -> code
        - NOMBRE -> name
        - CAPACIDAD -> capacity
        """
        rooms_map = {}
        
        for row in rows:
            code_raw = row.get('CODSALA')
            name_raw = row.get('NOMBRE')
            capacity_raw = row.get('CAPACIDAD')
            
            if not code_raw or not name_raw:
                continue
                
            code = str(code_raw).strip()
            name = str(name_raw).strip()
            try:
                capacity = int(capacity_raw) if capacity_raw else 0
            except ValueError:
                capacity = 0
            
            rooms_map[code] = {'name': name, 'capacity': capacity}
            
        for code, data in rooms_map.items():
            existing = db.query(models.Room).filter(models.Room.code == code).first()
            
            if existing:
                existing.name = data['name']
                existing.capacity = data['capacity']
            else:
                new_room = models.Room(
                    code=code,
                    name=data['name'],
                    capacity=data['capacity']
                )
                db.add(new_room)
        
        db.commit()
