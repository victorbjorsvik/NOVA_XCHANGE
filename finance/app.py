import os
from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import apology_login, apology_home, login_required, lookup, usd, list_coins

# Configure application
app = Flask(__name__)

# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    """Render Welcome Page"""
    portfolio = db.execute("SELECT * FROM holdings WHERE user_id = ?", session.get("user_id"))

    # Add current price and name of stock to portfolio
    for i in range(len(portfolio)):
        add = lookup(portfolio[i]["symbol"])
        portfolio[i]["coin"] = add["name"]
        portfolio[i]["price_current"] = add["price"]
        portfolio[i]["total_current"] = portfolio[i]["amount"] * portfolio[i]["price_current"]
    # Fetch current cash and Username from DB
            # Insert purchase into history table
    sum_holdings = sum(portfolio[i]["total_current"] for i in range(len(portfolio)))


    db.execute("INSERT INTO balanceTime (user_id, balance, date) VALUES(?, ?, datetime('now'))",
                   session["user_id"], sum_holdings)


    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology_login("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology_login("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology_login("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology_login("must provide username", 400)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology_login("must provide password", 400)

        if request.form.get("confirmation") != request.form.get("password"):
            return apology_login("Passwords must match", 400)

        # Query database for usernames
        usernames = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # username already exsists
        if len(usernames) != 0:
            return apology_login("Username already taken", 400)

        # Insert new user into database
        username = request.form.get("username")
        password = request.form.get("password")
        special = ['$', '@', '#', '!', '?', '*', '^', '=', '.', ',']

        # Password validation##https://stackoverflow.com/questions/41117733/validation-of-a-password-python
        if len(password) < 8:
            return apology_login("password must be at least 8 characters", 403)
        if len(password) > 20:
            return apology_login("password must be less than 20 character", 403)
        if not any(char.isdigit() for char in password):
            return apology_login("password must contain at least one digit", 403)
        if not any(char.isupper() for char in password):
            return apology_login("password must contain at least one uppercase letter", 403)
        if not any(char.islower() for char in password):
            return apology_login("password must contain at least one lowercase letter", 403)
        if not any(char in special for char in password):
            return apology_login("password must contain at least one special symbol", 403)

        # Hash password and insert into DB
        hash = generate_password_hash(password)
        db.execute("INSERT INTO users (username, hash) VALUES (?, ?)", username, hash)

        return redirect("/login")

    # When requested via GET -> display registration form
    else:
        return render_template("register.html")


@app.route("/sell", methods=["POST"])
@login_required
def sell():
    # Get the form data from the request
    form_data = request.get_json()
    coin = form_data["coin"]
    amount = float(form_data["amount"])
    index = form_data["index"]

    # Perform data validation
    portfolio = db.execute("SELECT * FROM holdings WHERE user_id = ?", session["user_id"])
    holdings = [holding["symbol"] for holding in portfolio]

    if not coin:
        return jsonify({"error": "Select a coin"}), 400
    elif coin not in holdings:
        return jsonify({"error": "Coin not found"}), 400

    # Get the current holding for the selected coin
    holding = db.execute("SELECT * FROM holdings WHERE user_id = ? AND symbol = ?", session["user_id"], coin)
    if not holding:
        return jsonify({"error": "Coin not found in holdings"}), 400

    # Ensure enough coins
    if amount > holding[0]["amount"]:
        return jsonify({"error": "Not enough amount"}), 400
    elif amount <= 0:
        return jsonify({"error": "Enter amount larger than 0"}), 400

    # Update the database
    coin_data = lookup(coin)
    price = float(coin_data["price"])
    total = amount * price

    db.execute("UPDATE users SET cash = cash + ? WHERE id = ?", total, session["user_id"])
    db.execute("INSERT INTO history (user_id, symbol, price, amount, total, date) VALUES (?, ?, ?, ?, ?, datetime('now'))",
               session["user_id"], coin, price, amount * -1, total)
    db.execute("UPDATE holdings SET amount = amount - ? WHERE symbol = ? AND user_id = ?", amount, coin, session["user_id"])
    db.execute("DELETE FROM holdings WHERE amount = 0")

    return jsonify({"success": True})
    

@app.route("/API_portfolio")
@login_required
def API_portfolio():
    # Establish portfolio
    portfolio = db.execute("SELECT * FROM holdings WHERE user_id = ?", session.get("user_id"))

    # Add current price and name of stock to portfolio
    for i in range(len(portfolio)):
        add = lookup(portfolio[i]["symbol"])
        portfolio[i]["coin"] = add["name"]
        portfolio[i]["price_current"] = add["price"]
        portfolio[i]["total_current"] = portfolio[i]["amount"] * portfolio[i]["price_current"]
    # Fetch current cash and Username from DB
    cash = db.execute("SELECT cash, username FROM users WHERE id = ?", session.get("user_id"))

       # Calculate total balance
    sum_holdings = sum(portfolio[i]["total_current"] for i in range(len(portfolio)))
    total = sum_holdings + cash[0]["cash"]
    
    # Prepare JSON response
    response_data = {
        "portfolio": portfolio,
        "cash": cash[0],
        "total": total,
        "sum_holdings": sum_holdings,
    }

    return jsonify(response_data)


@app.route("/API_history")
@login_required
def API_history():
    """Show history of transactions"""
    transactions = db.execute("SELECT * FROM history WHERE user_id = ?", session["user_id"])

    # Convert transactions to a list of dictionaries
    transactions_list = [dict(transaction) for transaction in transactions]

    # Prepare JSON response
    response_data = {
        "transactions": transactions_list
    }

    return jsonify(response_data)


@app.route("/history")
@login_required
def test():
    return render_template("transactionhistory.html")


@app.route("/searchcoins", methods=["GET", "POST"])
@login_required
def searchcoins():
    """Render the searchcoins template and deal with buying coins."""

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure valid ticker
        if not request.form.get("symbol") or lookup(request.form.get("symbol")) == None:
            return apology_home("Please insert valid coin", 400)

        # Ensure valid amount
        try:
            if float(request.form.get("amount")) < 0:
                return apology_home("Please insert a positive value", 400)
        except ValueError:
            return apology_home("please insert a valid float", 400)

        # Establish variables
        symbol = request.form.get("symbol")
        amount = float(request.form.get("amount"))
        coin = lookup(symbol)
        price = float(coin["price"])
        total = amount * price
        rows = db.execute("SELECT * FROM users WHERE id = ?", session["user_id"])

        # Ensure proper coverage
        if total > rows[0]["cash"]:
            return apology_home("Not enough cash", 400)

        # Insert purchase into history table
        db.execute("INSERT INTO history (user_id, symbol, price, amount, total, date) VALUES(?, ?, ?, ?, ?, datetime('now'))",
                   session["user_id"], symbol, price, amount, total * -1)

        # Update holdings
        portfolio = db.execute("SELECT * FROM holdings WHERE user_id = ?", session["user_id"])
        holdings = []
        for i in range(len(portfolio)):
            holdings.append(portfolio[i]["symbol"])

        if symbol in holdings:
            db.execute("UPDATE holdings SET amount = amount + ? WHERE symbol = ? AND user_id = ?",
                       amount, symbol, session["user_id"])
        else:
            db.execute("INSERT INTO holdings (user_id, symbol, amount) VALUES (?, ?, ?)", session["user_id"], symbol, amount)

        # Update remaining cash
        db.execute("UPDATE users SET cash = cash - ? WHERE id = ?", total, session["user_id"])

        return redirect("/")

    else:
        return render_template("searchcoins.html")


@app.route("/analytics", methods=["GET", "POST"])
@login_required
def analytics():
    """Get coin quote."""

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure valid ticker
        if not request.form.get("symbol") or lookup(request.form.get("symbol")) == None:
            return apology("Please insert valid ticker", 400)

        # call the lookupfunction
        coin = lookup(request.form.get("symbol"))
        coin["price"] = usd(coin["price"])

        return render_template("analytics.html", coin=coin)

    else:
        return render_template("analytics.html")

@app.route("/API_balance")
@login_required
def API_balanceTime():
    """Show history of transactions"""
    transactions = db.execute("SELECT * FROM balanceTime WHERE user_id = ?", session["user_id"])

    # Convert transactions to a list of dictionaries
    transactions_list = [dict(transaction) for transaction in transactions]

    # Prepare JSON response
    response_data = {
        "transactions": transactions_list
    }

    return jsonify(response_data)