import requests
import json
import time

# Test data that simulates an emergency call
test_data = {
    "callId": "test-call-123",
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
    "transcript": "Hello, this is an emergency. There's been a car accident at MG Road and 5th Cross. Two people are injured and need immediate medical attention.",
    "location": "MG Road and 5th Cross, Bangalore",
    "coordinates": [12.9716, 77.5946],  # Bangalore coordinates
    "category": "Traffic Accident",
    "severity": "high",
    "action": "Dispatch ambulance and police to the location immediately. Notify nearest hospital for emergency admission.",
    "emotion": {
        "joy": 0.05,
        "fear": 0.65,
        "sadness": 0.15,
        "anger": 0.10,
        "surprise": 0.05
    }
}

# Send the test data to the backend
try:
    response = requests.post(
        "http://localhost:8000/twilio/response",
        json=test_data
    )
    print(f"Response status: {response.status_code}")
    print(f"Response content: {response.text}")
    
    if response.status_code == 200:
        print("\nTest message sent successfully!")
        print("Check your frontend dashboard to see if the data appears.")
    else:
        print("\nFailed to send test message.")
        print("Make sure the backend server is running and the endpoint is correctly implemented.")
except Exception as e:
    print(f"Error: {e}")
    print("Make sure the backend server is running at http://localhost:8000")
