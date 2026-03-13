import sys
import os

# Add the backend app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app

# Vercel expects the app to be named 'app' or 'handler'
handler = app
