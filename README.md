# LIT - Lifeline Inside Telephone

LIT (Lifeline Inside Telephone) is an AI-powered emergency response system that processes 911 calls in real-time, providing transcription, location detection, emotion analysis, and emergency triage.

## System Architecture

The LIT system consists of two main components:

1. **Backend**: Python-based FastAPI server that handles:
   - Twilio call integration
   - Speech-to-text transcription
   - Fine-tuned LLM for emergency triage
   - Emotion analysis
   - WebSocket communication

2. **Frontend**: Next.js dashboard that displays:
   - Live call transcript
   - Caller location on a map
   - Emotional state analysis
   - Emergency category, severity, and recommended actions

## Prerequisites

- Python 3.8+ (backend)
- Node.js 16+ (frontend)
- Twilio account for call handling
- Optional: Hugging Face account for model access
- Optional: Hume API key for emotion analysis
- Optional: Retell API key for text-to-speech

## Environment Setup

Create a `.env` file in the project root with the following variables:

```
# Required
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
MODEL_PATH=models/lit-emergency-triage

# Optional
HF_API_TOKEN=your_huggingface_token
HUME_API_KEY=your_hume_api_key
RETELL_API_KEY=your_retell_api_key
WHISPER_MODEL=small
```

## Installation

### Quick Start (Recommended)

The fastest way to get started with LIT is to use our unified startup script:

```bash
# Start both backend and frontend with a single command
python start.py
```

This will:
1. Validate environment variables and dependencies
2. Spin up the FastAPI backend
3. Spin up the Next.js frontend
4. Open the dashboard in your browser

### Manual Setup

If you prefer to set up the components individually:

#### Backend Setup

```bash
# Install required packages
pip install -r requirements.txt

# Prepare the dataset and fine-tune the model
python data_preparation.py
python finetune_model.py

# Run the backend server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at http://localhost:3000.

## Docker Deployment

For a complete deployment using Docker:

```bash
# Build and start all services
docker-compose -f docker-compose-full.yml up -d
```

## Testing with Twilio

1. Start the backend server
2. Expose the server using ngrok:
   ```bash
   ngrok http 8000
   ```
3. Configure your Twilio phone number webhook to point to:
   `https://your-ngrok-url.ngrok.io/twilio/call`
4. Place a test call to your Twilio number

## Smoke Testing

Run the smoke test script to verify all components are working:

```bash
python run_smoke_tests.py
```

## System Components

### Backend

- `app.py`: FastAPI application with all endpoints
- `data_preparation.py`: Processes 911 call dataset
- `finetune_model.py`: Fine-tunes LLM for emergency triage
- `run_smoke_tests.py`: Validates system functionality

### Frontend

- React components for the dashboard interface
- WebSocket integration for real-time updates
- Leaflet map for location visualization
- Emotion meter for caller sentiment analysis

## Fallback Mechanisms

The system includes robust fallback mechanisms:
- Mock implementations for missing ML dependencies
- Graceful degradation when APIs are unavailable
- Clear error reporting and status monitoring

## License

MIT License
