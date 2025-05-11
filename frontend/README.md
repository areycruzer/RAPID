# LIT Frontend - Lifeline Inside Telephone

This is the frontend dashboard for the LIT emergency response system. It provides a real-time interface for monitoring and responding to emergency calls.

## Features

- **Live Transcript Display**: Auto-scrolling panel showing the emergency call transcript in real-time
- **Location Mapping**: Interactive map showing the caller's location
- **Emotion Analysis**: Visual representation of the caller's emotional state
- **Emergency Response**: Action card with dispatch approval functionality

## Tech Stack

- Next.js with TypeScript
- Tailwind CSS for styling
- shadcn/ui for UI components
- Framer Motion for animations
- Leaflet for mapping
- WebSocket for real-time communication

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend server running (see main project README)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

Adjust the WebSocket URL as needed to match your backend deployment.

## Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Deployment to Vercel

This project is configured for easy deployment to Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy.

Make sure to set the environment variables in the Vercel dashboard.
