const User = require('../models/User');

const registerUser = async (req, res) => {
    const { uid, email, name } = req.body;
    
    if (!uid || !email || !name) {
        return res.status(400).json({ message: 'UID, Name, and Email are required' });
    }

    try {
        const newUser = new User({
            uid,
            email,
            name
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    } catch (error) {
        console.error('MongoDB save error:', error);
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { registerUser };

