require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Debug logging
console.log('Current working directory:', process.cwd());
console.log('Environment variables loaded:', {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Present' : 'Missing',
    NODE_ENV: process.env.NODE_ENV
});

// Initialize express app
const app = express();

// Check for required environment variables
if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is required. Please create a .env file with your API key.');
    process.exit(1);
}

// Constants
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from current directory
const path = require('path');
app.use(express.static(path.join(__dirname)));

// Serve index.html at root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// Gemini API endpoint
app.post('/api/gemini', async (req, res, next) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ 
                error: 'Missing prompt',
                message: 'Please provide a prompt for the AI to respond to.'
            });
        }

        if (typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Invalid prompt',
                message: 'The prompt must be a non-empty text string.'
            });
        }

        // Make request to Gemini API
        const response = await axios({
            method: 'post',
            url: `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            },
            timeout: 10000 // 10 second timeout
        });

        // Extract only the generated text from the response
        if (response.data.candidates && response.data.candidates[0]?.content?.parts?.[0]?.text) {
            const generatedText = response.data.candidates[0].content.parts[0].text;
            res.json({ response: generatedText });
        } else {
            throw new Error('Invalid response format from Gemini API');
        }

    } catch (error) {
        // Log the full error for debugging
        console.error('Gemini API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            timestamp: new Date().toISOString()
        });
        
        // Handle different types of errors with user-friendly messages
        if (error.code === 'ECONNABORTED') {
            // Timeout error
            res.status(504).json({
                error: 'Request timeout',
                message: 'The AI is taking too long to respond. Please try again.'
            });
        } else if (error.response) {
            // API responded with an error
            const status = error.response.status;
            let errorMessage = 'Something went wrong. Please try again.';

            switch (status) {
                case 400:
                    errorMessage = 'Invalid request format. Please check your input and try again.';
                    break;
                case 401:
                case 403:
                    errorMessage = 'Authentication error. Please contact support.';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please wait a moment and try again.';
                    break;
                case 500:
                case 502:
                case 503:
                    errorMessage = 'AI service is temporarily unavailable. Please try again in a few minutes.';
                    break;
            }

            res.status(status).json({
                error: 'AI Response Error',
                message: errorMessage
            });
        } else if (error.request) {
            // No response received
            res.status(503).json({
                error: 'Service Unavailable',
                message: 'Unable to reach the AI service. Please try again in a few moments.'
            });
        } else {
            // Something else went wrong
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Something went wrong. Please try again.'
            });
        }
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Make sure to create a .env file with your GEMINI_API_KEY');
}); 