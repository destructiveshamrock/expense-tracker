# main.py
from flask import Flask, redirect, url_for, render_template, request
import sqlite3
from flask import jsonify
import requests

app = Flask(__name__)

def get_db():
    return sqlite3.connect('expenses.db')

errors=['You should have chosen a payment method...',
        'Amount spent should be more than 0']
def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                amount REAL NOT NULL DEFAULT 0.00,
                category TEXT NOT NULL,
                date TEXT NOT NULL
                   )
                   ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM expenses')
    all_expenses = cursor.fetchall()
    cursor.execute('SELECT SUM(amount) FROM expenses')
    total = round(cursor.fetchone()[0], 2) or 0  # 'or 0' handles the case when table is empty
    conn.close()
    return render_template('index.html', expenses=all_expenses, total=total)

@app.route('/add-expense', methods=['POST'])
def add_expense():
    name = request.form['name']
    amount = request.form['amount']
    category = request.form['category']
    if category == '':
        return redirect('/warning/0')
    elif float(amount) <= 0:
        return redirect('/warning/1')
    else:
        date = request.form['date']
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO expenses (name, amount, category, date) VALUES (?, ?, ?, ?)', 
                       (name, amount, category, date,))
        conn.commit()
        cursor.execute('SELECT sum(amount) FROM expenses')
        new_total = round(cursor.fetchone()[0], 2) or 0
        conn.close()
        return jsonify({'status': 'success', 
                        'total_spent': new_total,
                        'expense': {
                            'id': cursor.lastrowid, # the id sql assigned to the last row
                            'name': name,
                            'amount': amount,
                            'category': category,
                            'date': date
                }
            })

@app.route('/warning/<int:error_id>')
def warning(error_id):
    return render_template('warning.html', 
                           error=['YOU HAVE FAILED THIS WEBSITE',
                                  errors[error_id]])

@app.route('/delete-expense/<int:expense_id>', methods=['POST'])
def delete_expense(expense_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
    conn.commit()
    cursor.execute('SELECT sum(amount) FROM expenses')
    new_total = round(cursor.fetchone()[0], 2) or 0
    conn.close()
    return jsonify({"status": "success", 'total_spent': new_total})
 
@app.route('/crypto')
def crypto():
    coins = ['BTC', 'ETH', 'SOL']
    prices = []
    for coin in coins:
        response = requests.get(f'https://api.coinbase.com/v2/prices/{coin}-USD/spot')
        data = response.json()
        price = data['data']['amount']
        prices.append({'coin': coin, 'price': price})
    return render_template('crypto.html', prices=prices)



if __name__ == '__main__':
    init_db()
    app.run(debug=True)
