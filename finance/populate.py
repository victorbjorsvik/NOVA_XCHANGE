import sqlite3
from datetime import datetime, timedelta
import random

# Connect to SQLite database
conn = sqlite3.connect('finance.db')
cursor = conn.cursor()

# Generate and insert fictional data with consecutive dates and volatile balance
start_date = datetime(2024, 3, 1)
end_date = datetime.now()
delta = timedelta(seconds=1)

balance = 3000  # Starting balance
rows_generated = 0

while start_date < end_date and rows_generated < 200:
    # Introduce volatility by adding a random value to the balance within a range
    balance_change = random.uniform(-50, 50)
    balance += balance_change
    
    # Ensure balance stays within the specified range
    balance = max(3000, min(balance, 8500))
    
    cursor.execute('''INSERT INTO balanceTime (balance, date, user_id) VALUES (?, ?, ?)''', (balance, start_date, 1))
    start_date += delta
    rows_generated += 1

# Commit changes and close connection
conn.commit()
conn.close()

print("Database populated successfully with approximately 200 rows.")
