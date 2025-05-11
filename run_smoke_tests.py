#!/usr/bin/env python
"""
Smoke tests for the LIT (Lifeline Inside Telephone) backend.
This script tests the data preparation, fine-tuning, and API components.
"""

import os
import sys
import subprocess
import time

def print_header(title):
    """Print a section header."""
    print("\n" + "=" * 80)
    print(f"{title:^80}")
    print("=" * 80 + "\n")

def run_command(command):
    """Run a command and return the output."""
    try:
        process = subprocess.run(
            command,
            shell=True,
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        print(f"Running: {command}")
        print(f"Exit code: {process.returncode}")
        
        if process.stdout:
            print(f"Output:\n{process.stdout}")
        
        if process.returncode != 0 and process.stderr:
            print(f"Error:\n{process.stderr}")
            
        return process.returncode == 0, process.stdout, process.stderr
    except Exception as e:
        print(f"Error running command: {e}")
        return False, "", str(e)

def check_file_exists(file_path):
    """Check if a file exists and print its size."""
    exists = os.path.exists(file_path)
    print(f"Checking if {file_path} exists: {exists}")
    
    if exists:
        size = os.path.getsize(file_path)
        print(f"File size: {size} bytes")
    
    return exists

def test_data_preparation():
    """Test the data preparation script."""
    print_header("Testing Data Preparation")
    
    # Check if pandas is installed
    success, output, error = run_command("pip list | findstr pandas")
    if not success:
        print("Pandas not installed. Please install it using:")
        print("pip install pandas")
        return False
    
    # Run the data preparation script
    success, output, error = run_command("python data_preparation.py")
    if not success:
        print("Data preparation failed.")
        return False
    
    # Check if output files exist
    train_exists = check_file_exists("data/processed/train.jsonl")
    valid_exists = check_file_exists("data/processed/valid.jsonl")
    
    if train_exists and valid_exists:
        print("Data preparation test: PASSED")
        return True
    else:
        print("Data preparation test: FAILED")
        return False

def test_fine_tuning():
    """Test the fine-tuning script."""
    print_header("Testing Fine-Tuning")
    
    # Run the fine-tuning script with mock implementation
    print("Running fine-tuning with mock implementation...")
    success, output, error = run_command("python finetune_model.py")
    
    # Check if mock files were created
    adapter_exists = check_file_exists("models/lit-emergency-triage/adapter_model.bin")
    config_exists = check_file_exists("models/lit-emergency-triage/adapter_config.json")
    
    if success and adapter_exists and config_exists:
        print("Fine-tuning test: PASSED")
        return True
    else:
        print("Fine-tuning test: FAILED")
        return False

def test_api_endpoints():
    """Test the API endpoints."""
    print_header("Testing API Endpoints")
    
    # Check if FastAPI is installed
    success, output, error = run_command("pip list | findstr fastapi")
    if not success:
        print("FastAPI not installed. Please install it using:")
        print("pip install fastapi uvicorn")
        print("API endpoints test: FAILED")
        return False
    
    # Create a simple test script to check the API
    test_script = """
import sys
import os
import time

try:
    import requests
    print("Testing API health endpoint...")
    response = requests.get("http://localhost:8000/health")
    if response.status_code == 200:
        print(f"Health endpoint response: {response.json()}")
        print("API test: PASSED")
        sys.exit(0)
    else:
        print(f"Health endpoint returned status code: {response.status_code}")
        print("API test: FAILED")
        sys.exit(1)
except Exception as e:
    print(f"Error testing API: {e}")
    print("API test: FAILED")
    sys.exit(1)
"""
    
    # Write the test script to a temporary file
    with open("api_test.py", "w") as f:
        f.write(test_script)
    
    # Check if the API is already running
    print("Checking if API is already running...")
    try:
        import requests
        response = requests.get("http://localhost:8000/health", timeout=2)
        if response.status_code == 200:
            print("API is already running.")
            print("Testing API...")
            success, output, error = run_command("python api_test.py")
            os.remove("api_test.py")
            if success:
                print("API endpoints test: PASSED")
                return True
            else:
                print("API endpoints test: FAILED")
                return False
    except:
        print("API is not running.")
    
    # Try to start the API in the background
    print("Starting API in the background...")
    try:
        api_process = subprocess.Popen(
            ["python", "app.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for the API to start
        print("Waiting for API to start...")
        time.sleep(5)
        
        # Test the API
        print("Testing API...")
        success, output, error = run_command("python api_test.py")
        
        # Clean up
        api_process.terminate()
        os.remove("api_test.py")
        
        if success:
            print("API endpoints test: PASSED")
            return True
        else:
            print("API endpoints test: FAILED")
            return False
    except Exception as e:
        print(f"Error starting API: {e}")
        try:
            os.remove("api_test.py")
        except:
            pass
        print("API endpoints test: FAILED")
        return False

def main():
    """Run all smoke tests."""
    print_header("LIT Smoke Tests")
    
    # Test data preparation
    data_prep_success = test_data_preparation()
    
    # Test fine-tuning
    fine_tuning_success = test_fine_tuning()
    
    # Test API endpoints
    api_success = test_api_endpoints()
    
    # Print summary
    print_header("Smoke Test Results")
    if data_prep_success and fine_tuning_success and api_success:
        print("All smoke tests PASSED!")
        print("Your LIT backend is ready for the hackathon!")
    else:
        print("Some smoke tests FAILED.")
        print("Check the logs above for details.")

if __name__ == "__main__":
    main()
