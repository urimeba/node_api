const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async function ({ userInput }, req) {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({
                message: 'Email is invalid'
            });
        }

        if (validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, { min: 5 })) {
            errors.push({
                message: 'Password too short'
            });
        };

        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.code = 422;
            error.data = errors;
            throw error;
        }

        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
            const error = new Error('User exists already');
            throw error;
        }

        const hasedPw = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hasedPw
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() };

    },

    login: async function ({ email, password }, req) {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Incorrect password');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, 'somesupersecretsecret',
            { expiresIn: '1h' }
        );

        return {
            token: token,
            userId: user._id.toString()
        }


    }
};