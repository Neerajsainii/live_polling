// Vercel serverless function entry point
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:3000",
      "https://live-polling-gules.vercel.app",
      "https://*.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:3000",
    "https://live-polling-gules.vercel.app",
    "https://*.vercel.app"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// In-memory data storage (in production, use a database)
let polls = new Map();
let pollHistory = [];
let activeParticipants = new Map();
let chatMessages = [];
let kickedOutStudents = new Set();
let currentPoll = null;

// Utility function to create safe poll response
function createPollResponse(poll) {
  if (!poll) return null;
  
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options,
    duration: poll.duration,
    correctAnswer: poll.correctAnswer,
    isActive: poll.isActive,
    startTime: poll.startTime,
    endTime: poll.endTime,
    timeLeft: poll.timeLeft,
    teacherId: poll.teacherId,
    teacherName: poll.teacherName,
    createdAt: poll.createdAt,
    results: poll.results || {},
    finalResults: poll.finalResults || {},
    summary: poll.summary || null,
    responses: poll.responses || {}
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get current poll status
app.get('/api/poll/current', (req, res) => {
  try {
    if (!currentPoll) {
      return res.json({ poll: null, message: 'No active poll' });
    }

    res.json({
      poll: createPollResponse(currentPoll),
      participants: Array.from(activeParticipants.values()),
      chatMessages
    });

  } catch (error) {
    console.error('Error fetching current poll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new poll (Teacher only)
app.post('/api/poll/create', (req, res) => {
  try {
    const { question, options, duration = 60, teacherId, teacherName, correctAnswer = 0 } = req.body;

    // Validation
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        error: 'Question and at least 2 options are required' 
      });
    }

    if (!teacherId || !teacherName) {
      return res.status(400).json({ 
        error: 'Teacher ID and name are required' 
      });
    }

    // Check if there's already an active poll
    if (currentPoll && currentPoll.isActive) {
      return res.status(409).json({ 
        error: 'There is already an active poll. Please end it before creating a new one.' 
      });
    }

    const pollId = uuidv4();
    const poll = {
      id: pollId,
      question: question.trim(),
      options: options.map(opt => opt.trim()).filter(opt => opt.length > 0),
      duration: Math.min(Math.max(duration, 10), 300), // Between 10-300 seconds
      correctAnswer: Math.max(0, Math.min(correctAnswer, options.length - 1)), // Validate correct answer index
      isActive: false,
      responses: {},
      results: {},
      startTime: null,
      endTime: null,
      timeLeft: duration,
      teacherId,
      teacherName,
      createdAt: new Date().toISOString()
    };

    polls.set(pollId, poll);
    currentPoll = poll;

    res.status(201).json({ 
      poll: createPollResponse(poll),
      message: 'Poll created successfully'
    });

  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the app for Vercel
module.exports = app;
