from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import models, database, schemas
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="U-Planner API")

@app.get("/")
def read_root():
    return {"message": "Welcome to U-Planner API"}

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
