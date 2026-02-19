
import sys
import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import google_sheets
import gspread

def debug_sync():
    db = SessionLocal()
    try:
        print("Starting debug sync for academic schedules...")
        # Use gspread like the original service
        gc = gspread.service_account(filename="service_account.json")
        sh = gc.open_by_key('1rlitBQJ_0-0GwYqq3J6VTT6bQYcWJvO7uAuhTMPrSTM')
        ws = sh.worksheet("PRESENCIAL")
        rows = ws.get_all_records()
        
        print(f"Found {len(rows)} rows from PRESENCIAL.")
        if rows:
            print(f"Sample row keys: {list(rows[0].keys())}")
            print(f"Sample row CODRAMO: {rows[0].get('CODRAMO', 'MISSING')}")

        service = google_sheets.GoogleSheetsService()
        service._sync_academic_schedules(db, rows)
        print("Sync method finished.")
        
        # Verify count
        count = db.query(models.AcademicSchedule).count()
        print(f"Total academic schedules in DB: {count}")
        
    except Exception as e:
        print(f"Error during debug sync: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_sync()
