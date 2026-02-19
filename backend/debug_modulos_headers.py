import gspread

SPREADSHEET_ID = '1rlitBQJ_0-0GwYqq3J6VTT6bQYcWJvO7uAuhTMPrSTM'

def debug_headers():
    gc = gspread.service_account(filename="service_account.json")
    sh = gc.open_by_key(SPREADSHEET_ID)
    
    try:
        ws = sh.worksheet("MODULOS")
        headers = ws.row_values(1)
        print(f"Headers in MODULOS: {headers}")
        first_row = ws.row_values(2)
        print(f"First row in MODULOS: {first_row}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_headers()
