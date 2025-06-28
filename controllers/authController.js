const User = require('../models/User');

const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
};

const registerUser = async (req, res) => {
    const { email, firstName, lastName = '', uid = null } = req.body;

    if (!email || !firstName) {
        return res.status(400).json({ message: 'All fields are required' });
    }


    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const newUser = new User({
            uid: uid || null,
            email,
            firstName,
            lastName: lastName || ''
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { registerUser };

