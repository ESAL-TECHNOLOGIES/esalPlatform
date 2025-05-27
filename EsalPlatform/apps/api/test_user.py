import sqlite3

conn = sqlite3.connect('esal_dev.db')
cursor = conn.cursor()

cursor.execute('SELECT email, password_hash FROM users WHERE email = ?', ('admin@esal.com',))
result = cursor.fetchone()
print(f"User data: {result}")

conn.close()
