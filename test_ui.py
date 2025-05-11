import json
import asyncio
import websockets
import random
import time
import sys
import os
from datetime import datetime

# Sample emergency data to simulate a call
EMERGENCY_DATA = {
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
}

async def send_emergency_data():
    """Connect to the WebSocket server and send emergency data."""
    # Default WebSocket URL
    ws_url = "ws://localhost:8000/ws"
    
    # Check if URL is provided as command-line argument
    if len(sys.argv) > 1:
        ws_url = sys.argv[1]
    
    print(f"Connecting to WebSocket server at {ws_url}...")
    
    try:
        async with websockets.connect(ws_url) as websocket:
            print("Connected to WebSocket server")
            
            # Send initial emergency data
            await send_data(websocket, EMERGENCY_DATA)
            
            # Wait for user input to continue or quit
            while True:
                print("\nOptions:")
                print("1. Send updated transcript")
                print("2. Send emotion update")
                print("3. Send location update")
                print("4. Send new emergency")
                print("5. Exit")
                
                choice = input("Choose an option (1-5): ")
                
                if choice == "1":
                    # Update transcript
                    updated_data = EMERGENCY_DATA.copy()
                    updated_data["transcript"] += f"\nAI: Is the person conscious?\nCaller: Yes, but they seem to be in pain. I think their leg might be trapped.\nAI: Thank you for that information. I've updated the emergency responders. They should be there in about {random.randint(2, 8)} minutes."
                    updated_data["timestamp"] = datetime.now().isoformat()
                    await send_data(websocket, updated_data)
                
                elif choice == "2":
                    # Update emotions
                    updated_data = EMERGENCY_DATA.copy()
                    updated_data["emotions"]["emotions"] = {
                        "calm": random.random() * 0.3,
                        "fear": random.random() * 0.7,
                        "distress": random.random() * 0.8,
                        "anxiety": random.random() * 0.6
                    }
                    updated_data["timestamp"] = datetime.now().isoformat()
                    await send_data(websocket, updated_data)
                
                elif choice == "3":
                    # Update location
                    updated_data = EMERGENCY_DATA.copy()
                    # Slightly modify coordinates to simulate movement
                    lat, lng = updated_data["coordinates"]
                    updated_data["coordinates"] = [
                        lat + (random.random() - 0.5) * 0.01,
                        lng + (random.random() - 0.5) * 0.01
                    ]
                    updated_data["timestamp"] = datetime.now().isoformat()
                    await send_data(websocket, updated_data)
                
                elif choice == "4":
                    # Send a new emergency
                    new_emergency = EMERGENCY_DATA.copy()
                    new_emergency["call_sid"] = f"call-{int(time.time())}"
                    new_emergency["timestamp"] = datetime.now().isoformat()
                    new_emergency["emergency_type"] = random.choice(["Medical", "Fire", "Police", "Traffic Accident"])
                    new_emergency["priority"] = random.choice(["low", "medium", "high", "critical"])
                    new_emergency["location"] = random.choice([
                        "Market Street and 5th Avenue",
                        "Golden Gate Park",
                        "Fisherman's Wharf",
                        "Mission District"
                    ])
                    await send_data(websocket, new_emergency)
                
                elif choice == "5":
                    print("Exiting...")
                    break
                
                else:
                    print("Invalid choice. Please try again.")
    
    except Exception as e:
        print(f"Error: {e}")
        print("\nMake sure the backend server is running at the specified URL.")
        print("You can start it with: python -m uvicorn app:app --reload")

async def send_data(websocket, data):
    """Send data to the WebSocket server and print confirmation."""
    message = json.dumps(data)
    await websocket.send(message)
    print(f"Sent emergency data: {data['emergency_type']} ({data['priority']}) at {data['location']}")

if __name__ == "__main__":
    # Check if websockets is installed
    try:
        import websockets
    except ImportError:
        print("Error: websockets package is not installed.")
        print("Please install it with: pip install websockets")
        sys.exit(1)
        
    # Run the async function
    asyncio.run(send_emergency_data())
