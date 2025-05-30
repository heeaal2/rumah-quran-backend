const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'https://hilmipasha.github.io'  // Replace with your GitHub Pages URL
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Successfully connected to MongoDB.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

// Call the connection function
connectToDatabase();

// Registration Schema
const registrationSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    phone_number: { type: String, required: true },
    attendance_date: { type: String, required: true },
    registration_date: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', registrationSchema);

// Registration endpoint
app.post('/register', async (req, res) => {
    try {
        console.log('Received registration request:', req.body);

        // Validate required fields
        const requiredFields = ['full_name', 'phone_number', 'attendance_date'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate field types and formats
        if (typeof req.body.full_name !== 'string' || req.body.full_name.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Full name must be at least 2 characters long'
            });
        }

        if (typeof req.body.phone_number !== 'string' || !/^\d{10,13}$/.test(req.body.phone_number)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be 10-13 digits'
            });
        }

        if (typeof req.body.attendance_date !== 'string' || !req.body.attendance_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance date format'
            });
        }

        const registration = new Registration({
            full_name: req.body.full_name,
            phone_number: req.body.phone_number,
            attendance_date: req.body.attendance_date,
            registration_date: new Date()
        });

        const savedRegistration = await registration.save();
        console.log('Successfully saved registration:', savedRegistration);
        
        res.json({ 
            success: true, 
            message: 'Registration successful',
            data: savedRegistration
        });
    } catch (error) {
        console.error('Error saving registration:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed',
            error: error.message 
        });
    }
});

// Get all registrations endpoint
app.get('/registrations', async (req, res) => {
    try {
        console.log('Fetching all registrations...');
        const registrations = await Registration.find().sort({ created_at: -1 });
        console.log('Found registrations:', registrations);
        res.json({ success: true, data: registrations });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch registrations',
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 