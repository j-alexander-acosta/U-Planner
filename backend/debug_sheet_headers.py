
import gspread
import os

SPREADSHEET_ID = '1rlitBQJ_0-0GwYqq3J6VTT6bQYcWJvO7uAuhTMPrSTM'

def check_headers():
    try:
        gc = gspread.service_account(filename="service_account.json")
        sh = gc.open_by_key(SPREADSHEET_ID)
        try:
            ws = sh.worksheet("PRESENCIAL")
        except gspread.WorksheetNotFound:
            print("Worksheet 'PRESENCIAL' not found. Available:", [w.title for w in sh.worksheets()])
            return

        headers = ws.row_values(1)
        print("Headers found in PRESENCIAL:", headers)
        
        records = ws.get_all_records()
        if records:
            print("First record sample:", records[0])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_headers()
