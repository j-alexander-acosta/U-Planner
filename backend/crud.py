from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import models, schemas

def validate_schedule(db: Session, schedule: schemas.ScheduleBase):
    # 1. Fetch related entities
    subject = db.query(models.Subject).filter(models.Subject.id == schedule.subject_id).first()
    room = db.query(models.Room).filter(models.Room.id == schedule.room_id).first()
    teacher = db.query(models.Teacher).filter(models.Teacher.id == schedule.teacher_id).first()
    
    if not subject or not room or not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="One or more related entities (Subject, Room, Teacher) not found"
        )

    # 2. Check Room Capacity
    if room.capacity < subject.enrolled_students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room capacity ({room.capacity}) is less than enrolled students ({subject.enrolled_students})"
        )

    # 3. Check Room Equipment (Room Type)
    if room.room_type_id != subject.required_room_type_id:
        room_type = db.query(models.RoomType).filter(models.RoomType.id == room.room_type_id).first()
        req_type = db.query(models.RoomType).filter(models.RoomType.id == subject.required_room_type_id).first()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room type mismatch. Room is '{room_type.name}', but Subject requires '{req_type.name}'"
        )

    # 4. Check Teacher Availability
    availability = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.teacher_id == schedule.teacher_id,
        models.TeacherAvailability.time_block_id == schedule.time_block_id
    ).first()
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher is not available during this time block"
        )

    # 5. Check Room Clash (Hard Constraint)
    room_clash = db.query(models.Schedule).filter(
        models.Schedule.room_id == schedule.room_id,
        models.Schedule.time_block_id == schedule.time_block_id
    ).first()
    
    if room_clash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room is already occupied during this time block"
        )

    # 6. Check Teacher Clash (Hard Constraint)
    teacher_clash = db.query(models.Schedule).filter(
        models.Schedule.teacher_id == schedule.teacher_id,
        models.Schedule.time_block_id == schedule.time_block_id
    ).first()
    
    if teacher_clash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Teacher is already scheduled for another subject during this time block"
        )

    return True

def create_schedule(db: Session, schedule: schemas.ScheduleBase):
    validate_schedule(db, schedule)
    db_schedule = models.Schedule(**schedule.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def get_schedules(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Schedule).offset(skip).limit(limit).all()
