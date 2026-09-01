import os
import sys

# Ensure data-pipeline root is on sys.path regardless of where pytest is executed from
SERVICE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)
