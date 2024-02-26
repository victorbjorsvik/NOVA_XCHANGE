import os
import requests
import urllib.parse

from flask import redirect, render_template, request, session
from functools import wraps


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
        return quote["id"], float(quote["priceUsd"]), quote["symbol"]
    except (KeyError, TypeError, ValueError):
        return None

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

print(list_coins())