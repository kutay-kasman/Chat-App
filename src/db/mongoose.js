const mongoose = require('mongoose');

const dbURL = process.env.MONGO_URL
if (!dbURL) {
    throw new Error('MongoDB URL is not defined in environment variables!');
}

mongoose.connect(dbURL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
