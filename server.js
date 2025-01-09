const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const passport = require('passport');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/User');
const Video = require('./models/Video');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static('uploads')); // Serve video files

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// Multer setup for video upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage: storage });

// User Authentication (login, register)
const passportLocalStrategy = require('passport-local').Strategy;
passport.use(new passportLocalStrategy(
    async (username, password, done) => {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: 'User not found' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password' });
        return done(null, user);
    }
));

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User created');
});

// User Login
app.post('/api/login', passport.authenticate('local', { session: false }), (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Video Upload
app.post('/api/upload', upload.single('video'), async (req, res) => {
    const { title, description } = req.body;
    const newVideo = new Video({
        title,
        description,
        videoUrl: `/uploads/${req.file.filename}`,
        uploadDate: Date.now()
    });
    await newVideo.save();
    res.status(201).json(newVideo);
});

// Get All Videos
app.get('/api/videos', async (req, res) => {
    const videos = await Video.find();
    res.json(videos);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
