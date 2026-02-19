from sqlalchemy import Column, Integer, String, ForeignKey, Time, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    users = relationship("User", back_populates="role")

class Faculty(Base):
    __tablename__ = "faculties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    subjects = relationship("Subject", back_populates="faculty")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role", back_populates="users")
    teacher = relationship("Teacher", back_populates="user", uselist=False)

class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    rut = Column(String, unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    specialization = Column(String)
    user = relationship("User", back_populates="teacher")
    availability = relationship("TeacherAvailability", back_populates="teacher")
    schedules = relationship("Schedule", back_populates="teacher")

class TimeBlock(Base):
    __tablename__ = "time_blocks"
    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(String, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    teacher_availabilities = relationship("TeacherAvailability", back_populates="time_block")
    schedules = relationship("Schedule", back_populates="time_block")

class TeacherAvailability(Base):
    __tablename__ = "teacher_availability"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    time_block_id = Column(Integer, ForeignKey("time_blocks.id"))
    teacher = relationship("Teacher", back_populates="availability")
    time_block = relationship("TimeBlock", back_populates="teacher_availabilities")
    __table_args__ = (UniqueConstraint('teacher_id', 'time_block_id', name='_teacher_block_uc'),)

class RoomType(Base):
    __tablename__ = "room_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    rooms = relationship("Room", back_populates="room_type")
    subjects = relationship("Subject", back_populates="required_room_type")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    room_type_id = Column(Integer, ForeignKey("room_types.id"), nullable=True)
    room_type = relationship("RoomType", back_populates="rooms")
    schedules = relationship("Schedule", back_populates="room")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=True) # CODRAMO
    plan_year = Column(String, nullable=True) # AÑO_PLAN
    career_code = Column(String, nullable=True) # CODCARR
    level = Column(String, nullable=True) # NIVEL
    name = Column(String, nullable=False) # ASIGNATURA
    equivalent = Column(String, nullable=True) # EQUIVALENTE
    section = Column(String, nullable=True) # SECCION
    enrolled_students = Column(Integer, default=0) # CUPO
    required_room_type_id = Column(Integer, ForeignKey("room_types.id"))
    faculty_id = Column(Integer, ForeignKey("faculties.id"))
    
    required_room_type = relationship("RoomType", back_populates="subjects")
    faculty = relationship("Faculty", back_populates="subjects")
    schedules = relationship("Schedule", back_populates="subject")

class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    time_block_id = Column(Integer, ForeignKey("time_blocks.id"))
    
    teacher = relationship("Teacher", back_populates="schedules")
    room = relationship("Room", back_populates="schedules")
    subject = relationship("Subject", back_populates="schedules")
    time_block = relationship("TimeBlock", back_populates="schedules")

    __table_args__ = (
        UniqueConstraint('room_id', 'time_block_id', name='_room_block_uc'),
        UniqueConstraint('teacher_id', 'time_block_id', name='_teacher_block_schedule_uc'),
    )

class Day(Base):
    __tablename__ = "days"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False) # DIA
    name = Column(String, nullable=False) # DIA_U
class TimeModule(Base):
    __tablename__ = "time_modules"
    id = Column(Integer, primary_key=True, index=True)
    mod_hor = Column(String, nullable=False)
    hora_inicio = Column(String, nullable=False)
    hora_final = Column(String, nullable=False)
    rango = Column(String, nullable=False)
    modulo = Column(String, nullable=False)

class AcademicSchedule(Base):
    __tablename__ = "academic_schedules"
    id = Column(Integer, primary_key=True, index=True)
    carrera = Column(String, nullable=True)
    nivel = Column(String, nullable=True)
    codramo = Column(String, nullable=True) # CODRAMO
    modulo_horario = Column(String, nullable=True) # MODULO Y HORARIO
    seccion = Column(String, nullable=True)
    asignatura = Column(String, nullable=True)
    docente = Column(String, nullable=True)

