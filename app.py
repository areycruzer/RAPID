import sys
import os
import logging
import json
from typing import Dict, List, Optional, Union
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Check for required packages
required_packages = ['fastapi', 'uvicorn']
optional_packages = [
    'python-dotenv', 'twilio', 'broadcaster', 'pydantic',
    'torch', 'transformers', 'peft', 'openai-whisper', 'hume', 'retell'
]

missing_required = []
missing_optional = []

for package in required_packages:
    try:
        __import__(package)
    except ImportError:
        missing_required.append(package)

for package in optional_packages:
    try:
        __import__(package)
    except ImportError:
        missing_optional.append(package)

if missing_required:
    logger.error(f"Missing required packages: {', '.join(missing_required)}")
    print(f"\nERROR: Missing required packages: {', '.join(missing_required)}")
    print("Please install them using:")
    print(f"pip install {' '.join(missing_required)}")
    sys.exit(1)

if missing_optional:
    logger.warning(f"Missing optional packages: {', '.join(missing_optional)}")
    print(f"\nWARNING: Missing optional packages: {', '.join(missing_optional)}")
    print("Some features may not work. Install them using:")
    print(f"pip install {' '.join(missing_optional)}")
    print("Continuing with mock implementations for testing purposes...\n")

# Import FastAPI and other required packages
from fastapi import FastAPI, Request, WebSocket, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Mock implementations for missing packages
if 'python-dotenv' in missing_optional:
    class MockDotEnv:
        @staticmethod
        def load_dotenv():
            logger.info("Mock: Loading environment variables")
    load_dotenv = MockDotEnv.load_dotenv
else:
    from dotenv import load_dotenv

if 'pydantic' in missing_optional:
    class BaseModel:
        def __init__(self, **kwargs):
            for key, value in kwargs.items():
                setattr(self, key, value)
else:
    from pydantic import BaseModel

if 'broadcaster' in missing_optional:
    class MockBroadcaster:
        """Mock implementation of broadcaster for testing"""
        def __init__(self):
            self.subscribers = set()
            
        async def publish(self, channel, message):
            """Publish a message to all subscribers"""
            if isinstance(message, dict):
                message_str = json.dumps(message)
            else:
                message_str = message
                
            for queue in self.subscribers:
                await queue.put(message_str)
        
        async def subscribe(self, channel):
            """Subscribe to a channel"""
            queue = asyncio.Queue()
            self.subscribers.add(queue)
            try:
                while True:
                    yield await queue.get()
            finally:
                self.subscribers.remove(queue)
    
    class Broadcast:
        def __init__(self, url):
            self.url = url
            self.broadcaster = MockBroadcaster()
            
        async def connect(self):
            await self.broadcaster.connect()
            
        async def disconnect(self):
            await self.broadcaster.disconnect()
            
        async def publish(self, channel, message):
            await self.broadcaster.publish(channel, message)
            
        async def subscribe(self, channel):
            return await self.broadcaster.subscribe(channel)
else:
    from broadcaster import Broadcast

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="LIT Emergency Response API",
    description="""
    AI-powered emergency call triage and operator dashboard for India's 112 service.
    
    This API provides endpoints for:
    - Processing emergency calls via Twilio
    - Real-time transcription and analysis
    - LLM-based triage with emotion analysis
    - WebSocket for dashboard updates
    
    For testing purposes, mock implementations are used when dependencies are missing.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize broadcaster for WebSocket
broadcast = Broadcast("memory://")

# Mock implementations for testing
class MockASR:
    def transcribe(self, audio_file):
        return "This is a mock transcription for testing purposes."

class MockLLM:
    def generate(self, transcript):
        return {
            "emergency_type": "Medical",
            "priority": "High",
            "location": "123 Main St",
            "caller_name": "John Doe",
            "summary": "Mock emergency call for testing purposes",
            "recommended_actions": ["Dispatch ambulance", "Notify hospital"]
        }

class MockEmotionAnalysis:
    def analyze(self, transcript):
        return {
            "emotions": {
                "fear": 0.7,
                "distress": 0.8,
                "anxiety": 0.6,
                "calm": 0.2
            },
            "sentiment": "negative",
            "urgency": "high"
        }

# Initialize mock services if real ones aren't available
asr_service = MockASR() if 'openai-whisper' in missing_optional else None
llm_service = MockLLM() if 'transformers' in missing_optional or 'torch' in missing_optional else None
emotion_service = MockEmotionAnalysis() if 'hume' in missing_optional else None

# API models
class CallResponse(BaseModel):
    call_sid: str
    status: str
    message: str

class RecordingResponse(BaseModel):
    recording_sid: str
    call_sid: str
    status: str
    transcript: str
    analysis: Dict

class TriageResponse(BaseModel):
    call_sid: str
    emergency_type: str
    priority: str
    location: Optional[str] = None
    caller_name: Optional[str] = None
    summary: str
    recommended_actions: List[str]
    emotions: Optional[Dict] = None

# Twilio webhook endpoints
@app.post("/twilio/call")
async def handle_call(request: Request):
    try:
        form_data = await request.form()
    except:
        form_data = {}
    call_sid = form_data.get("CallSid", "test-call-sid")
    
    logger.info(f"Received call: {call_sid}")
    try:
        await broadcast.publish(
            channel="calls",
            message=json.dumps({
                "event": "call_started",
                "call_sid": call_sid,
                "status": "in-progress"
            })
        )
    except Exception as e:
        logger.warning(f"Error publishing to broadcast: {e}")
    
    return {
        "call_sid": call_sid,
        "status": "in-progress",
        "message": "Call received and being processed"
    }

@app.post("/twilio/recording")
async def handle_recording(request: Request):
    try:
        form_data = await request.form()
    except:
        form_data = {}
    recording_sid = form_data.get("RecordingSid", "test-recording-sid")
    call_sid = form_data.get("CallSid", "test-call-sid")
    recording_url = form_data.get("RecordingUrl", "https://example.com/recording.mp3")
    
    logger.info(f"Received recording: {recording_sid} for call: {call_sid}")
    
    # Mock transcription and analysis
    transcript = "This is a mock transcript for testing purposes."
    if asr_service:
        transcript = asr_service.transcribe(recording_url)
    
    emotions = {"fear": 0.7, "distress": 0.8}
    if emotion_service:
        emotions = emotion_service.analyze(transcript)
    
    analysis = {
        "emotions": emotions,
        "call_sid": call_sid
    }
    
    try:
        await broadcast.publish(
            channel="transcripts",
            message=json.dumps({
                "event": "new_transcript",
                "call_sid": call_sid,
                "transcript": transcript,
                "analysis": analysis
            })
        )
    except Exception as e:
        logger.warning(f"Error publishing to broadcast: {e}")
    
    return {
        "recording_sid": recording_sid,
        "call_sid": call_sid,
        "status": "processed",
        "transcript": transcript,
        "analysis": analysis
    }

@app.post("/twilio/response")
async def handle_response(request: Request):
    try:
        form_data = await request.form()
    except:
        form_data = {}
    call_sid = form_data.get("CallSid", "test-call-sid")
    transcript = form_data.get("Transcript", "Mock transcript")
    
    logger.info(f"Generating response for call: {call_sid}")
    
    # Mock LLM response
    triage_result = {
        "emergency_type": "Medical",
        "priority": "High",
        "location": "123 Main St",
        "caller_name": "John Doe",
        "summary": "Mock emergency call for testing purposes",
        "recommended_actions": ["Dispatch ambulance", "Notify hospital"]
    }
    
    if llm_service:
        triage_result = llm_service.generate(transcript)
    
    # Mock emotion analysis
    emotions = {"fear": 0.7, "distress": 0.8}
    if emotion_service:
        emotions = emotion_service.analyze(transcript)
    
    response = {
        "call_sid": call_sid,
        **triage_result,
        "emotions": emotions
    }
    
    try:
        await broadcast.publish(
            channel="responses",
            message=json.dumps({
                "event": "new_response",
                "call_sid": call_sid,
                **triage_result,
                "emotions": emotions
            })
        )
    except Exception as e:
        logger.warning(f"Error publishing to broadcast: {e}")
    
    return response

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Subscribe to all channels
    try:
        async with broadcast.subscribe(channel="calls") as subscriber:
            async for event in subscriber:
                await websocket.send_text(event)
        
        async with broadcast.subscribe(channel="transcripts") as subscriber:
            async for event in subscriber:
                await websocket.send_text(event)
        
        async with broadcast.subscribe(channel="responses") as subscriber:
            async for event in subscriber:
                await websocket.send_text(event)
    except Exception as e:
        logger.warning(f"Error in WebSocket: {e}")

# Health check endpoint
@app.get("/health")
async def health_check():
    status = {
        "status": "ok",
        "services": {
            "asr": "mock" if 'openai-whisper' in missing_optional else "ready",
            "llm": "mock" if 'transformers' in missing_optional or 'torch' in missing_optional else "ready",
            "emotion": "mock" if 'hume' in missing_optional else "ready",
            "api": "ready"
        },
        "environment": {
            "twilio": "configured" if os.getenv("TWILIO_ACCOUNT_SID") and os.getenv("TWILIO_AUTH_TOKEN") else "missing",
            "model_path": os.getenv("MODEL_PATH", "not set")
        },
        "missing_packages": missing_optional
    }
    return status

# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "LIT Emergency Response API",
        "description": "AI-powered emergency call triage and operator dashboard",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "websocket": "/ws",
            "twilio_webhooks": {
                "call": "/twilio/call",
                "recording": "/twilio/recording",
                "response": "/twilio/response"
            }
        },
        "documentation": "/docs"
    }

# Lifecycle events
@app.on_event("startup")
async def startup():
    try:
        await broadcast.connect()
    except Exception as e:
        logger.warning(f"Error connecting broadcaster: {e}")
    logger.info("LIT Emergency Response API started")
    logger.info(f"Optional packages missing: {', '.join(missing_optional) if missing_optional else 'None'}")
    logger.info("Using mock implementations for missing services")

@app.on_event("shutdown")
async def shutdown():
    try:
        await broadcast.disconnect()
    except Exception as e:
        logger.warning(f"Error disconnecting broadcaster: {e}")
    logger.info("LIT Emergency Response API shutdown")

# Run the app if executed directly
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
