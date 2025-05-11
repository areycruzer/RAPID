#!/usr/bin/env python
"""
LIT System Starter Script
Starts both the backend and frontend components of the LIT system.
"""

import os
import sys
import subprocess
import webbrowser
import time
import signal
import logging
import platform
import requests
from pathlib import Path
from threading import Thread
from queue import Queue

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("LIT")

# Define paths
ROOT_DIR = Path(__file__).parent.absolute()
FRONTEND_DIR = ROOT_DIR / "frontend"

# Platform-specific settings
IS_WINDOWS = platform.system() == "Windows"
NPM_CMD = "npm.cmd" if IS_WINDOWS else "npm"
PYTHON_CMD = sys.executable

# Define commands - use explicit paths and avoid shell=True for cross-platform compatibility
BACKEND_CMD = [PYTHON_CMD, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
FRONTEND_CMD = [NPM_CMD, "run", "dev"]

# Log prefixes for clarity
BACKEND_PREFIX = "\033[94m[BACKEND]\033[0m "
FRONTEND_PREFIX = "\033[92m[FRONTEND]\033[0m "
ERROR_PREFIX = "\033[91m[ERROR]\033[0m "

def check_prerequisites():
    """Check if all prerequisites are installed"""
    logger.info("Checking prerequisites...")
    
    # Check Python packages
    missing_packages = []
    for package in ["fastapi", "uvicorn", "requests"]:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"{ERROR_PREFIX}Missing required Python packages: {', '.join(missing_packages)}")
        logger.error(f"{ERROR_PREFIX}Please run: pip install -r requirements.txt")
        return False
    
    # Check if Node.js is installed
    try:
        subprocess.run(
            [NPM_CMD, "--version"], 
            check=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE
        )
    except (subprocess.SubprocessError, FileNotFoundError):
        logger.error(f"{ERROR_PREFIX}Node.js is not installed. Please install Node.js to run the frontend.")
        return False
    
    # Check if frontend dependencies are installed
    if not (FRONTEND_DIR / "node_modules").exists():
        logger.warning("Frontend dependencies not found. Installing now...")
        try:
            subprocess.run(
                [NPM_CMD, "install"], 
                cwd=FRONTEND_DIR, 
                check=True
            )
        except subprocess.SubprocessError:
            logger.error(f"{ERROR_PREFIX}Failed to install frontend dependencies.")
            return False
    
    # Check if .env file exists
    env_file = ROOT_DIR / ".env"
    if not env_file.exists():
        logger.warning("No .env file found. Creating a sample .env file...")
        with open(env_file, "w") as f:
            f.write("""# Required
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
MODEL_PATH=models/lit-emergency-triage

# Optional
HF_API_TOKEN=
HUME_API_KEY=
RETELL_API_KEY=
WHISPER_MODEL=small
""")
        logger.info("Sample .env file created. Please update with your actual credentials.")
    
    return True

def log_reader(process, prefix, queue):
    """Read logs from a process and add them to the queue with a prefix"""
    for line in iter(process.stdout.readline, b''):
        queue.put(f"{prefix}{line.decode('utf-8').rstrip()}")
    process.stdout.close()

def error_reader(process, prefix, queue):
    """Read error logs from a process and add them to the queue with a prefix"""
    for line in iter(process.stderr.readline, b''):
        queue.put(f"{prefix}\033[91m{line.decode('utf-8').rstrip()}\033[0m")
    process.stderr.close()

def log_printer(queue):
    """Print logs from the queue"""
    while True:
        message = queue.get()
        if message == "STOP":
            break
        print(message)
        queue.task_done()

def start_backend():
    """Start the backend server and wait for it to be ready"""
    logger.info("Starting backend server...")
    
    backend_process = subprocess.Popen(
        BACKEND_CMD,
        cwd=ROOT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=1,
        universal_newlines=False
    )
    
    # Wait for backend to be ready by checking health endpoint
    max_retries = 30
    retry_interval = 1
    backend_ready = False
    
    logger.info("Waiting for backend to be ready...")
    for i in range(max_retries):
        try:
            response = requests.get("http://localhost:8000/health")
            if response.status_code == 200:
                logger.info("Backend server is ready!")
                backend_ready = True
                break
        except requests.exceptions.ConnectionError:
            pass
        
        time.sleep(retry_interval)
    
    if not backend_ready:
        logger.warning("Backend health check timed out, but proceeding anyway...")
    
    return backend_process

def start_frontend():
    """Start the frontend development server"""
    logger.info("Starting frontend server...")
    
    frontend_process = subprocess.Popen(
        FRONTEND_CMD,
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=1,
        universal_newlines=False
    )
    
    return frontend_process

def open_browser():
    """Open browser to the frontend application"""
    time.sleep(5)  # Wait a bit longer for frontend to be fully ready
    logger.info("Opening browser...")
    
    # Try port 3000 first, then 3001 (Next.js may use 3001 if 3000 is taken)
    urls = ["http://localhost:3000", "http://localhost:3001"]
    
    for url in urls:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                webbrowser.open(url)
                logger.info(f"Opened browser to {url}")
                return
        except requests.exceptions.ConnectionError:
            continue
    
    logger.warning("Could not open browser automatically. Please navigate to http://localhost:3000 or http://localhost:3001 manually.")

def handle_shutdown(backend_process, frontend_process, log_queue):
    """Handle graceful shutdown of processes"""
    def signal_handler(sig, frame):
        logger.info("Shutting down LIT system...")
        backend_process.terminate()
        frontend_process.terminate()
        log_queue.put("STOP")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

def main():
    """Main function to start the LIT system"""
    logger.info("Starting LIT - Lifeline Inside Telephone system...")
    
    if not check_prerequisites():
        sys.exit(1)
    
    # Create a queue for log messages
    log_queue = Queue()
    
    # Start a thread to print logs
    printer_thread = Thread(target=log_printer, args=(log_queue,))
    printer_thread.daemon = True
    printer_thread.start()
    
    # Start backend and wait for it to be ready
    backend_process = start_backend()
    
    # Start log readers for backend
    backend_log_thread = Thread(target=log_reader, args=(backend_process, BACKEND_PREFIX, log_queue))
    backend_log_thread.daemon = True
    backend_log_thread.start()
    
    backend_error_thread = Thread(target=error_reader, args=(backend_process, BACKEND_PREFIX, log_queue))
    backend_error_thread.daemon = True
    backend_error_thread.start()
    
    # Start frontend
    frontend_process = start_frontend()
    
    # Start log readers for frontend
    frontend_log_thread = Thread(target=log_reader, args=(frontend_process, FRONTEND_PREFIX, log_queue))
    frontend_log_thread.daemon = True
    frontend_log_thread.start()
    
    frontend_error_thread = Thread(target=error_reader, args=(frontend_process, FRONTEND_PREFIX, log_queue))
    frontend_error_thread.daemon = True
    frontend_error_thread.start()
    
    # Set up signal handlers for graceful shutdown
    handle_shutdown(backend_process, frontend_process, log_queue)
    
    # Open browser
    open_browser()
    
    logger.info("LIT system is running. Press Ctrl+C to stop.")
    
    # Keep the script running
    try:
        while True:
            # Check if processes are still running
            if backend_process.poll() is not None:
                logger.error(f"{ERROR_PREFIX}Backend process exited with code {backend_process.returncode}")
                frontend_process.terminate()
                break
            
            if frontend_process.poll() is not None:
                logger.error(f"{ERROR_PREFIX}Frontend process exited with code {frontend_process.returncode}")
                backend_process.terminate()
                break
            
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down LIT system...")
        backend_process.terminate()
        frontend_process.terminate()
        log_queue.put("STOP")

if __name__ == "__main__":
    main()
