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

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// Gemini API endpoint
app.post('/api/gemini', async (req, res, next) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract the generated text from the response
        const generatedText = response.data.candidates[0].content.parts[0].text;
        res.json({ response: generatedText });

    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        if (error.response?.data) {
            res.status(error.response.status).json({ error: error.response.data });
        } else {
            next(error);
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