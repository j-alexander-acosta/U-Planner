import sys
import os
from sqlalchemy.orm import Session
from datetime import time

# Add the current directory to sys.path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend import models, schemas, crud, database
from backend.database import engine, SessionLocal

# Clear and Recreate database for testing
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

def run_test():
    db = SessionLocal()
    try:
        print("--- Setting up Test Data ---")
        role_reg = models.Role(name="Registro Académico")
        db.add(role_reg)
        db.commit()

        user = models.User(username="teacher1", email="t1@ua.cl", password_hash="hash", role_id=role_reg.id)
        db.add(user)
        db.commit()
        teacher = models.Teacher(user_id=user.id, specialization="Math")
        db.add(teacher)
        db.commit()

        rt_theo = models.RoomType(name="Teórica")
        rt_comp = models.RoomType(name="Computación")
        db.add_all([rt_theo, rt_comp])
        db.commit()

        room_theo = models.Room(name="Aula 101", capacity=30, room_type_id=rt_theo.id)
        room_comp = models.Room(name="Lab 1", capacity=15, room_type_id=rt_comp.id) # Small capacity
        db.add_all([room_theo, room_comp])
        db.commit()

        sub_math = models.Subject(name="Cálculo", enrolled_students=25, required_room_type_id=rt_theo.id)
        sub_it = models.Subject(name="Programación", enrolled_students=20, required_room_type_id=rt_comp.id)
        db.add_all([sub_math, sub_it])
        db.commit()

        tb1 = models.TimeBlock(day_of_week="Lunes", start_time=time(8, 0), end_time=time(9, 30))
        db.add(tb1)
        db.commit()

        avail = models.TeacherAvailability(teacher_id=teacher.id, time_block_id=tb1.id)
        db.add(avail)
        db.commit()

        print("\n--- Running Validation Tests ---")

        # Test A: Success
        print("Test A: Valid Schedule -> Expected: Success")
        try:
            crud.create_schedule(db, schemas.ScheduleBase(
                teacher_id=teacher.id, room_id=room_theo.id, subject_id=sub_math.id, time_block_id=tb1.id
            ))
            print("  Result: Success ✅")
        except Exception as e:
            print(f"  Result: Failed ❌ ({e.detail if hasattr(e, 'detail') else e})")

        # Test B: Capacity
        print("\nTest B: Room Capacity Constraint -> Expected: Failure (400)")
        try:
            crud.create_schedule(db, schemas.ScheduleBase(
                teacher_id=teacher.id, room_id=room_comp.id, subject_id=sub_it.id, time_block_id=tb1.id
            ))
            print("  Result: Success ❌")
        except Exception as e:
            print(f"  Result: Expected Failure ✅ ({e.detail if hasattr(e, 'detail') else e})")

        # Test C: Room Type Mismatch (ensuring capacity fits)
        print("\nTest C: Room Type Mismatch -> Expected: Failure (400)")
        try:
            room_comp.capacity = 100 # Bypass capacity
            db.commit()
            crud.create_schedule(db, schemas.ScheduleBase(
                teacher_id=teacher.id, room_id=room_comp.id, subject_id=sub_math.id, time_block_id=tb1.id
            ))
            print("  Result: Success ❌")
        except Exception as e:
            print(f"  Result: Expected Failure ✅ ({e.detail if hasattr(e, 'detail') else e})")

        # Test D: Room Clash
        print("\nTest D: Room Clash -> Expected: Failure (409)")
        try:
            crud.create_schedule(db, schemas.ScheduleBase(
                teacher_id=teacher.id, room_id=room_theo.id, subject_id=sub_math.id, time_block_id=tb1.id
            ))
            print("  Result: Success ❌")
        except Exception as e:
            print(f"  Result: Expected Failure ✅ ({e.detail if hasattr(e, 'detail') else e})")

    finally:
        db.close()

if __name__ == "__main__":
    run_test()
