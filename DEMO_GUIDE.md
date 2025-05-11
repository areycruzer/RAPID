# LIT System Demo Guide

This guide provides step-by-step instructions for setting up and demonstrating the LIT (Lifeline Inside Telephone) emergency response system.

## 1. Environment Setup

First, ensure all environment variables are properly configured:

```bash
# Create or verify .env file in project root
cat > .env << EOL
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
MODEL_PATH=models/lit-emergency-triage
# Optional: Add these if you have them
# HF_API_TOKEN=your_huggingface_token
# HUME_API_KEY=your_hume_api_key
# RETELL_API_KEY=your_retell_api_key
# WHISPER_MODEL=small
EOL
```

## 2. Backend Preparation

```bash
# Prepare the dataset
python data_preparation.py

# Fine-tune the model (uses facebook/opt-125m by default)
python finetune_model.py

# Verify everything is working with smoke tests
python run_smoke_tests.py
```

## 3. Start the Backend Server

```bash
# Start the FastAPI server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Expected output:
```
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Verify the API is working by opening http://localhost:8000/ or http://localhost:8000/docs in your browser.

## 4. Start the Frontend

In a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Open http://localhost:3000 in your browser to see the dashboard.

## 5. Expose Webhook for Twilio

In a new terminal:

```bash
# Install ngrok if you haven't already
# npm install -g ngrok

# Expose the backend server
ngrok http 8000
```

Note the HTTPS URL provided by ngrok (e.g., https://a1b2c3d4.ngrok.io).

## 6. Configure Twilio

1. Log in to your [Twilio Console](https://www.twilio.com/console)
2. Navigate to Phone Numbers > Manage > Active Numbers
3. Select your Twilio phone number
4. Under "Voice & Fax" configuration:
   - Set the webhook for "A Call Comes In" to: `https://your-ngrok-url.ngrok.io/twilio/call`
   - Method: HTTP POST
5. Save your changes

## 7. Test the Complete System

1. Place a test call to your Twilio number
2. Speak a simulated emergency scenario (e.g., "There's been a car accident at Main Street and 5th Avenue. Two people are injured.")
3. Watch the dashboard update in real-time:
   - Transcript will appear in the Transcript Panel
   - Location will be displayed on the map
   - Emotion analysis will show the caller's emotional state
   - Emergency category, severity, and recommended actions will appear
4. Click "Approve Dispatch" to test the response workflow

## 8. Verification Points

- **Transcript**: Verify that speech is being transcribed correctly
- **Location**: Check that the map shows a location (may be mocked in demo)
- **Emotion Analysis**: Confirm emotional indicators are displayed
- **Triage**: Verify that the system categorizes the emergency and suggests actions
- **WebSocket**: Ensure real-time updates are flowing to the dashboard
- **Voice Response**: Caller should receive an AI-generated response

## 9. Troubleshooting

- **Backend Issues**: Check the terminal running the backend for error messages
- **Frontend Issues**: Check the browser console for JavaScript errors
- **WebSocket Connection**: Verify the WebSocket URL in the frontend matches the backend
- **Twilio Webhook**: Ensure the ngrok URL is correctly configured in Twilio
- **Missing Dependencies**: Run `python run_smoke_tests.py` to identify missing components

## 10. Docker Deployment (Alternative)

If you prefer to use Docker for the entire stack:

```bash
# Build and start all services
docker-compose -f docker-compose-full.yml up -d

# Check logs
docker-compose -f docker-compose-full.yml logs -f
```

Access the system at http://localhost:3000

## 11. Troubleshooting

### Common Issues and Solutions

#### Backend Issues

| Issue | Solution |
|-------|----------|
| **Missing dependencies** | Run `pip install -r requirements.txt` to install all required packages |
| **Port 8000 already in use** | Kill the process using the port: `netstat -ano \| findstr :8000` and then `taskkill /PID [PID] /F` |
| **Model not found** | Ensure you've run `python finetune_model.py` or set `MODEL_PATH` in `.env` to a valid path |
| **Environment variables missing** | Check that `.env` file exists and contains all required variables |
| **Twilio credentials invalid** | Verify your Twilio credentials in the Twilio console and update `.env` file |

#### Frontend Issues

| Issue | Solution |
|-------|----------|
| **npm modules missing** | Run `cd frontend && npm install` to install dependencies |
| **Port 3000 already in use** | Next.js will automatically try port 3001, but you can kill the process: `netstat -ano \| findstr :3000` |
| **WebSocket connection failing** | Ensure backend is running and check that `NEXT_PUBLIC_WS_URL` is set correctly |
| **Blank or error page** | Check browser console for JavaScript errors and backend logs for API issues |

#### ngrok Issues

| Issue | Solution |
|-------|----------|
| **ngrok not found** | Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com/download) |
| **ngrok session expired** | Log in to ngrok: `ngrok authtoken YOUR_AUTH_TOKEN` |
| **Webhook URL not working** | Ensure you're using the HTTPS URL from ngrok and have set the correct path (`/twilio/call`) |
| **Rate limiting** | Free ngrok accounts have connection limits. Consider upgrading or restarting ngrok |

#### Twilio Issues

| Issue | Solution |
|-------|----------|
| **Call not connecting** | Verify webhook URL in Twilio console matches your ngrok URL |
| **No audio processing** | Check that your ngrok tunnel is active and backend server is running |
| **TwiML errors** | Check backend logs for response format issues |
| **Call drops immediately** | Ensure your Twilio account has sufficient credit |

### Checking System Status

To verify all components are working correctly:

1. **Backend Health**: Visit `http://localhost:8000/health` - should return status information for all services
2. **WebSocket**: Open browser console on frontend and check for WebSocket connection messages
3. **Database Files**: Ensure `data/processed/train.jsonl` and `models/lit-emergency-triage/adapter_model.bin` exist

### Logs and Debugging

- **Backend Logs**: Available in the terminal running the backend server
- **Frontend Logs**: Available in the terminal running the frontend server and browser console
- **Combined Logs**: When using `python start.py`, logs from both services are displayed with color-coded prefixes

If you encounter persistent issues, please check the GitHub repository issues or create a new one with detailed error information.
