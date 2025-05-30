# AI Chat Interface

A web application that uses the Gemini API to generate AI responses.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Deepak23462323/project-rtrp.git
cd project-rtrp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Features

- Web interface for interacting with AI
- Example prompts dropdown
- Conversation history panel
- Real-time AI responses using Gemini API

## API Endpoints

- `GET /ping` - Health check endpoint
- `POST /api/gemini` - Send prompts to Gemini API

## Technologies Used

- Node.js with Express
- Tailwind CSS
- Google's Gemini API
- Axios for HTTP requests 