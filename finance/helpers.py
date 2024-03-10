import os
import requests
import urllib.parse

from flask import redirect, render_template, request, session
from functools import wraps


def apology_login(message, code=400):
    """Render message as an apology to user."""

    return render_template("apology_login.html", code=code, message=message), code


def apology_home(message, code=400):
    """Render message as an apology to user."""

    return render_template("apology_home.html", code=code, message=message), code


def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


def lookup(name):
    """Look up quote for symbol."""

    # Contact API
    try:
        url = f"https://api.coincap.io/v2/assets/{name}"
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException:
        return None

    # Parse response
    try:
        quote = response.json()
        quote = quote["data"]
        return {
            "name": quote["id"],
            "price": float(quote["priceUsd"]),
            "symbol": quote["symbol"]
        }
    except (KeyError, TypeError, ValueError):
        return None


def usd(value):
    """Format value as USD."""
    return f"${value:,.2f}"

def list_coins():
    # Contact API
    try:
        url = f"https://api.coincap.io/v2/assets"
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException:
        return None

    # Parse response
    try:
        quote = response.json()
        quote = quote["data"]
        li = []
        for coin in quote:
            copy = {}
            copy["id"] = coin["id"]
            copy["priceUsd"] = float(coin["priceUsd"])
            copy["symbol"] = coin["symbol"]
            li.append(copy)

        return li
    except (KeyError, TypeError, ValueError):
        return None
