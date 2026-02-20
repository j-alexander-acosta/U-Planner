from pydantic import BaseModel
from typing import List, Optional
from datetime import time

class RoleBase(BaseModel):
    name: str

class Role(RoleBase):
    id: int
    class Config:
        from_attributes = True

class FacultyBase(BaseModel):
    name: str

class Faculty(FacultyBase):
    id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    role_id: int

class User(UserBase):
    id: int
    role_id: int
    class Config:
        from_attributes = True

class TeacherBase(BaseModel):
    full_name: str
    rut: str

class Teacher(TeacherBase):
    id: int
    class Config:
        from_attributes = True

class RoomTypeBase(BaseModel):
    name: str

class RoomType(RoomTypeBase):
    id: int
    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    code: str
    name: str
    capacity: int
    room_type_id: Optional[int] = None

class Room(RoomBase):
    id: int
    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    code: Optional[str] = None
    plan_year: Optional[str] = None
    career_code: Optional[str] = None
    level: Optional[str] = None
    equivalent: Optional[str] = None
    section: Optional[str] = None
    name: str
    enrolled_students: int
    required_room_type_id: int
    faculty_id: Optional[int] = None

class Subject(SubjectBase):
    id: int
    faculty: Optional[Faculty] = None
    class Config:
        from_attributes = True

class TimeBlockBase(BaseModel):
    day_of_week: str
    start_time: time
    end_time: time

class TimeBlock(TimeBlockBase):
    id: int
    class Config:
        from_attributes = True

class ScheduleBase(BaseModel):
    teacher_id: int
    room_id: int
    subject_id: int
    time_block_id: int

class Schedule(ScheduleBase):
    id: int
    class Config:
        from_attributes = True

class DayBase(BaseModel):
    code: str
    name: str

class Day(DayBase):
    id: int
    class Config:
        from_attributes = True

class TimeModuleBase(BaseModel):
    mod_hor: str
    hora_inicio: str
    hora_final: str
    rango: str
    modulo: str

class TimeModule(TimeModuleBase):
    id: int
    class Config:
        from_attributes = True

class AcademicScheduleBase(BaseModel):
    carrera: Optional[str] = None
    nivel: Optional[str] = None
    dia: Optional[str] = None
    codramo: Optional[str] = None
    modulo_horario: Optional[str] = None
    sala: Optional[str] = None
    seccion: Optional[str] = None
    asignatura: Optional[str] = None
    docente: Optional[str] = None


class AcademicSchedule(AcademicScheduleBase):
    id: int
    class Config:
        from_attributes = True
