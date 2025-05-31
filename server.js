// require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Set API key directly
const GEMINI_API_KEY = 'AIzaSyCnHWhK3K5Vm6ppFrXOQadLEfeWvkC5QwY';

// Debug logging
console.log('Current working directory:', process.cwd());
console.log('API Key Status:', GEMINI_API_KEY ? 'Present' : 'Missing');

// Initialize express app
const app = express();

// Constants
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
        const { prompt, temperature = 0.7, responseLength = 'medium' } = req.body;

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

        // Set max tokens based on response length
        let maxTokens;
        switch (responseLength) {
            case 'short':
                maxTokens = 30;
                break;
            case 'long':
                maxTokens = 500;
                break;
            case 'medium':
            default:
                maxTokens = 250;
        }

        // Prepare request payload for Gemini API
        const requestData = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: maxTokens,
                topP: 0.5,
                topK: 20
            }
        };

        console.log('Sending request to Gemini API with config:', {
            temperature,
            maxTokens,
            responseLength
        });

        // Make request to Gemini API using direct API key
        const makeRequest = async (retryCount = 0) => {
            try {
                const response = await axios({
                    method: 'post',
                    url: `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: requestData,
                    timeout: 10000 // 10 second timeout
                });
                return response;
            } catch (error) {
                if (error.response?.status === 503 && retryCount < 3) {
                    // Wait for 2 seconds before retrying
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return makeRequest(retryCount + 1);
                }
                throw error;
            }
        };

        const response = await makeRequest();

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
            res.status(504).json({
                error: 'Request timeout',
                message: 'The AI is taking too long to respond. Please try again.'
            });
        } else if (error.response) {
            const status = error.response.status;
            let errorMessage = 'Something went wrong. Please try again.';

            switch (status) {
                case 400:
                    if (error.response.data?.error?.message?.includes('API key not valid')) {
                        errorMessage = 'API key configuration error. Please contact support.';
                    } else {
                        errorMessage = 'Invalid request format. Please check your input and try again.';
                    }
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
            res.status(503).json({
                error: 'Service Unavailable',
                message: 'Unable to reach the AI service. Please try again in a few moments.'
            });
        } else {
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