# AI Chat Interface

A modern, responsive chat interface powered by Google's Gemini AI API. Features include voice input/output, temperature control, response length settings, and a beautiful dark/light theme.

## Features

- 🤖 AI-powered chat using Google's Gemini API
- 🎤 Voice input with automatic silence detection
- 🔊 Text-to-speech for AI responses
- 🌓 Dark/Light theme support
- 📱 Responsive design for all devices
- 📝 Markdown support in messages
- 📋 Copy and edit message functionality
- ⚡ Real-time typing indicators
- 💾 Chat history management
- 🎛️ Temperature control for response creativity
- 📏 Adjustable response length (short/medium/long)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-chat-interface.git
cd ai-chat-interface
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

4. Start the server:
```bash
node server.js
```

5. Open `http://localhost:3000` in your browser

## Technologies Used

- Node.js
- Express.js
- Google Gemini AI API
- Web Speech API
- Tailwind CSS
- Marked.js (for Markdown)
- DOMPurify (for security)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## API Endpoints

- `GET /ping` - Health check endpoint
- `POST /api/gemini` - Send prompts to Gemini API

## Technologies Used

- Node.js with Express
- Tailwind CSS
- Google's Gemini API
- Axios for HTTP requests 