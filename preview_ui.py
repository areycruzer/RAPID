#!/usr/bin/env python
"""
LIT UI Preview Script
Launches the backend with mock data and opens the frontend for UI testing.
"""

import os
import sys
import subprocess
import webbrowser
import time
import signal
import logging
import platform
import threading
import json
import random
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("LIT-Preview")

# Define paths
ROOT_DIR = Path(__file__).parent.absolute()
FRONTEND_DIR = ROOT_DIR / "frontend"

# Platform-specific settings
IS_WINDOWS = platform.system() == "Windows"
NPM_CMD = "npm.cmd" if IS_WINDOWS else "npm"
PYTHON_CMD = sys.executable

# Define commands
BACKEND_CMD = [PYTHON_CMD, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
FRONTEND_CMD = [NPM_CMD, "run", "dev"]

# Log prefixes for clarity
BACKEND_PREFIX = "\033[94m[BACKEND]\033[0m "
FRONTEND_PREFIX = "\033[92m[FRONTEND]\033[0m "
ERROR_PREFIX = "\033[91m[ERROR]\033[0m "
MOCK_PREFIX = "\033[95m[MOCK]\033[0m "

# Sample emergency data
EMERGENCY_DATA = [
    {
        "call_sid": f"call-{int(time.time())}",
        "timestamp": datetime.now().isoformat(),
        "transcript": "Caller: Help! There's been a car accident on Highway 101.\nAI: I understand there's been a car accident. Are there any injuries?\nCaller: Yes, I think someone is hurt. There's a person who can't get out of their car.\nAI: I'm dispatching emergency services right away. Can you tell me exactly where on Highway 101?\nCaller: It's near the exit for Main Street, heading north.\nAI: Thank you. Emergency services are on their way. Please stay on the line.",
        "location": "Highway 101 near Main Street exit",
        "coordinates": [37.7749, -122.4194],  # San Francisco coordinates
        "emergency_type": "Traffic Accident",
        "priority": "high",
        "recommended_actions": [
            "Dispatch ambulance to Highway 101 near Main Street exit",
            "Alert traffic control to divert traffic",
            "Notify nearest hospital of potential incoming trauma patient"
        ],
        "emotions": {
            "emotions": {
                "calm": 0.1,
                "fear": 0.6,
                "distress": 0.5,
                "anxiety": 0.7
            }
        }
    },
    {
        "call_sid": f"call-{int(time.time()) + 100}",
        "timestamp": datetime.now().isoformat(),
        "transcript": "Caller: I need help! There's smoke coming from my neighbor's apartment.\nAI: I understand there's smoke. Is there visible fire?\nCaller: I don't see flames, just a lot of smoke coming from under the door.\nAI: I'm sending firefighters immediately. What's the address?\nCaller: 123 Oak Street, Apartment 4B.\nAI: Thank you. Fire department is on the way. Is the building being evacuated?\nCaller: Yes, people are leaving now.",
        "location": "123 Oak Street, Apartment 4B",
        "coordinates": [37.7694, -122.4862],  # Different SF coordinates
        "emergency_type": "Fire",
        "priority": "critical",
        "recommended_actions": [
            "Dispatch fire department to 123 Oak Street",
            "Ensure building evacuation",
            "Alert nearby residents"
        ],
        "emotions": {
            "emotions": {
                "calm": 0.05,
                "fear": 0.8,
                "distress": 0.7,
                "anxiety": 0.6
            }
        }
    }
]

def send_mock_data():
    """Send mock emergency data to the backend WebSocket endpoint"""
    import asyncio
    import websockets
    
    async def send_data():
        try:
            # Wait for backend to be ready
            await asyncio.sleep(5)
            
            logger.info(f"{MOCK_PREFIX} Connecting to WebSocket server...")
            async with websockets.connect("ws://localhost:8000/ws") as websocket:
                logger.info(f"{MOCK_PREFIX} Connected to WebSocket server")
                
                # Send initial emergency data
                for i, emergency in enumerate(EMERGENCY_DATA):
                    await asyncio.sleep(3)  # Space out the emergencies
                    message = json.dumps(emergency)
                    await websocket.send(message)
                    logger.info(f"{MOCK_PREFIX} Sent emergency data {i+1}: {emergency['emergency_type']} ({emergency['priority']})")
                
                # Keep the connection alive and periodically update data
                while True:
                    await asyncio.sleep(15)
                    
                    # Update a random emergency with new transcript or emotion data
                    emergency = random.choice(EMERGENCY_DATA)
                    emergency["timestamp"] = datetime.now().isoformat()
                    
                    # Randomly choose what to update
                    update_type = random.choice(["transcript", "emotion", "location"])
                    
                    if update_type == "transcript":
                        emergency["transcript"] += f"\nAI: How is the situation now?\nCaller: {random.choice(['It seems to be getting worse.', 'Help is arriving now.', 'The situation is stable.'])}"
                    elif update_type == "emotion":
                        emergency["emotions"]["emotions"] = {
                            "calm": random.random() * 0.3,
                            "fear": random.random() * 0.7,
                            "distress": random.random() * 0.8,
                            "anxiety": random.random() * 0.6
                        }
                    else:  # location
                        lat, lng = emergency["coordinates"]
                        emergency["coordinates"] = [
                            lat + (random.random() - 0.5) * 0.01,
                            lng + (random.random() - 0.5) * 0.01
                        ]
                    
                    message = json.dumps(emergency)
                    await websocket.send(message)
                    logger.info(f"{MOCK_PREFIX} Sent updated {update_type} data for {emergency['emergency_type']}")
        
        except Exception as e:
            logger.error(f"{MOCK_PREFIX} Error in mock data sender: {e}")
            await asyncio.sleep(5)  # Wait and retry
            return await send_data()
    
    asyncio.run(send_data())

def start_backend():
    """Start the backend server"""
    logger.info(f"{BACKEND_PREFIX} Starting backend server...")
    
    try:
        process = subprocess.Popen(
            BACKEND_CMD,
            cwd=ROOT_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        # Start log readers in separate threads
        threading.Thread(target=log_reader, args=(process.stdout, BACKEND_PREFIX), daemon=True).start()
        threading.Thread(target=log_reader, args=(process.stderr, ERROR_PREFIX), daemon=True).start()
        
        return process
    except Exception as e:
        logger.error(f"{ERROR_PREFIX} Failed to start backend: {e}")
        sys.exit(1)

def start_frontend():
    """Start the frontend development server"""
    logger.info(f"{FRONTEND_PREFIX} Starting frontend server...")
    
    try:
        process = subprocess.Popen(
            FRONTEND_CMD,
            cwd=FRONTEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        # Start log readers in separate threads
        threading.Thread(target=log_reader, args=(process.stdout, FRONTEND_PREFIX), daemon=True).start()
        threading.Thread(target=log_reader, args=(process.stderr, ERROR_PREFIX), daemon=True).start()
        
        return process
    except Exception as e:
        logger.error(f"{ERROR_PREFIX} Failed to start frontend: {e}")
        sys.exit(1)

def log_reader(pipe, prefix):
    """Read logs from a process pipe and print them with a prefix"""
    for line in pipe:
        print(f"{prefix}{line.strip()}")

def open_browser():
    """Open browser to the frontend application"""
    # Wait for frontend to be ready (adjust time as needed)
    time.sleep(8)
    
    url = "http://localhost:3001"
    logger.info(f"Opening browser to {url}")
    
    try:
        webbrowser.open(url)
    except Exception as e:
        logger.error(f"{ERROR_PREFIX} Failed to open browser: {e}")
        logger.info(f"Please manually open {url} in your browser")

def main():
    """Main function to start the preview"""
    logger.info("Starting LIT UI Preview...")
    
    # Start backend
    backend_process = start_backend()
    
    # Start frontend
    frontend_process = start_frontend()
    
    # Start mock data sender in a separate thread
    threading.Thread(target=send_mock_data, daemon=True).start()
    
    # Open browser
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Handle graceful shutdown
    def signal_handler(sig, frame):
        logger.info("Shutting down...")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        backend_process.terminate()
        frontend_process.terminate()

if __name__ == "__main__":
    # Check if websockets is installed
    try:
        import websockets
    except ImportError:
        logger.error(f"{ERROR_PREFIX} websockets package is not installed.")
        logger.error(f"{ERROR_PREFIX} Please install it with: pip install websockets")
        sys.exit(1)
        
    main()
