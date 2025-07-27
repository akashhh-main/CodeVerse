const axios = require('axios');
require('dotenv').config();

// Language ID mapping
const getLanguageId = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63,
        "python": 71,
        "c": 50,
        "c#": 52,
        "ruby": 74,
        "swift": 76,
        "go": 55,
        "typescript": 77
    }
    return language[lang.toLowerCase()];
}

// Improved submitBatch with retry logic
const submitBatch = async (submissions, retries = 3) => {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'false'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        if (error.response?.status === 429 && retries > 0) {
            // Exponential backoff
            const delay = Math.pow(2, 4 - retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return submitBatch(submissions, retries - 1);
        }
        throw error;
    }
}

// Improved waiting function
const waiting = (timer) => {
    return new Promise(resolve => setTimeout(resolve, timer));
}

// Improved submitToken with better polling
const submitToken = async (resultToken, maxAttempts = 30) => {
    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resultToken.join(','),
            base64_encoded: 'false',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const response = await axios.request(options);
            const result = response.data;
            
            const allCompleted = result.submissions.every(r => r.status.id > 2);
            if (allCompleted) {
                return result.submissions;
            }
            
            // Increase delay with each attempt (exponential backoff)
            await waiting(1000 * Math.min(attempt + 1, 5));
        } catch (error) {
            if (error.response?.status === 429) {
                // If rate limited, wait longer
                await waiting(5000);
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max polling attempts reached without getting all results');
}

module.exports = { getLanguageId, submitBatch, submitToken };