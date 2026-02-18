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
    name: str
    capacity: int
    room_type_id: int

class Room(RoomBase):
    id: int
    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    name: str
    enrolled_students: int
    required_room_type_id: int
    faculty_id: Optional[int] = None

class Subject(SubjectBase):
    id: int
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
