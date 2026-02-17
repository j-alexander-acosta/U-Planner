from . import models, database, schemas, crud
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="U-Planner API")

@app.get("/")
def read_root():
    return {"message": "Welcome to U-Planner API"}

# --- Schedules ---
@app.post("/schedules/", response_model=schemas.Schedule)
def create_schedule(schedule: schemas.ScheduleBase, db: Session = Depends(get_db)):
    # validation happens inside crud.create_schedule
    return crud.create_schedule(db=db, schedule=schedule)

@app.get("/schedules/", response_model=List[schemas.Schedule])
def read_schedules(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_schedules(db=db, skip=skip, limit=limit)

# --- Subjects ---
@app.post("/subjects/", response_model=schemas.Subject)
def create_subject(subject: schemas.SubjectBase, db: Session = Depends(get_db)):
    db_subject = models.Subject(**subject.model_dump())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@app.get("/subjects/", response_model=List[schemas.Subject])
def read_subjects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Subject).offset(skip).limit(limit).all()

# --- Rooms ---
@app.post("/rooms/", response_model=schemas.Room)
def create_room(room: schemas.RoomBase, db: Session = Depends(get_db)):
    db_room = models.Room(**room.model_dump())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@app.get("/rooms/", response_model=List[schemas.Room])
def read_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Room).offset(skip).limit(limit).all()

# --- Room Types ---
@app.get("/room-types/", response_model=List[schemas.RoomType])
def read_room_types(db: Session = Depends(get_db)):
    return db.query(models.RoomType).all()

# --- Faculties & Reports ---
@app.get("/faculties/", response_model=List[schemas.Faculty])
def read_faculties(db: Session = Depends(get_db)):
    return crud.get_faculties(db)

@app.get("/reports/schedules/faculty/{faculty_id}", response_model=List[schemas.Schedule])
def get_faculty_report(faculty_id: int, db: Session = Depends(get_db)):
    return crud.get_schedules_by_faculty(db, faculty_id)

@app.get("/reports/export/faculty/{faculty_id}")
def export_faculty_report(faculty_id: int, db: Session = Depends(get_db)):
    import csv
    import io
    from fastapi.responses import StreamingResponse
    
    schedules = crud.get_schedules_by_faculty(db, faculty_id)
    faculty = db.query(models.Faculty).filter(models.Faculty.id == faculty_id).first()
    faculty_name = faculty.name if faculty else "report"
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Asignatura", "Docente", "Sala", "Bloque"])
    
    for s in schedules:
        writer.writerow([
            s.id,
            s.subject.name,
            s.teacher.user.username,
            s.room.name,
            f"{s.time_block.day_of_week} ({s.time_block.start_time}-{s.time_block.end_time})"
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=horario_{faculty_name}.csv"}
    )
