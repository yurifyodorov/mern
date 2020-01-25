const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
    '/',
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more cheracters'
        ).isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // See if user exist
            let user = await User.findOne({ email });

            if (user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exist' }] });
            }

            // Get users gravatar (011 User Registration, 07:07)
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                avatar,
                password // need to encrypt
            });

            // Encrypt password (011 User Registration, 09:04)
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            // Return jsonwebtoken
            res.send('User registred');
        } catch (err) {
            console.error(err.massage);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;
