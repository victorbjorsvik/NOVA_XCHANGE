import sqlite3
from datetime import datetime, timedelta
import random

# Option 1: Using Levy Stable Distribution (requires compatible SciPy version)
try:
  from scipy.stats import levy_stable
except ImportError:
  print("SciPy not found or incompatible version. Using alternative method.")
  levy_stable = None  # Placeholder for alternative approach

# Connect to SQLite database
conn = sqlite3.connect('finance.db')
cursor = conn.cursor()

# Generate and insert fictional data with consecutive dates and volatile balance
start_date = datetime(2024, 3, 1)
end_date = datetime.now()
delta = timedelta(hours=12)

balance = 6500  # Starting balance
rows_generated = 0

while start_date < end_date and rows_generated < 20:
  # Option 1a: Levy Stable Distribution (if available)
  if levy_stable:
    volatility_factor = 0.1  # Adjust for desired volatility
    scale = balance * volatility_factor
    levy_param = 1.5  # Levy distribution parameter (adjust for skewness)
    # Include alpha (stability parameter) and beta (skewness parameter)
    balance_change = random.choices(range(-100, 101), weights=levy_stable.pdf(range(-100, 101), scale=scale, loc=0, alpha=1, beta=0))

  # Option 1b: Alternative method (if SciPy incompatible)
    # Introduce volatility with a combination of uniform and normal distributions
    volatility_factor = 0.1  # Adjust for desired volatility
    uniform_change = random.uniform(-volatility_factor * balance, volatility_factor * balance)
    normal_change = random.gauss(0, volatility_factor * balance)
    balance_change = uniform_change + normal_change

  # Update balance with scaling and capping
  balance += balance_change
  balance = max(3000, min(balance, 8500))

  cursor.execute('''INSERT INTO balanceTime (balance, date, user_id) VALUES (?, ?, ?)''', (balance, start_date, 1))
  start_date += delta
  rows_generated += 1

# Commit changes and close connection
conn.commit()
conn.close()

print("Database populated successfully with approximately 20 rows.")
