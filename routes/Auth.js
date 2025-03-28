const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models/');
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth.js');

router.get('/', async (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
        await User.create({
            first_name: 'Admin',
            last_name: 'Admin',
            role: 'admin',
            status: 'accept',
            email: adminEmail,
            password: bcrypt.hashSync('123123', 10),
        });
    }
    res.render('auth/index', { title: 'Authentication' });
});

router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, role, phone_number, bio } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('auth/register', {
                error: 'Email already registered',
                title: 'Register'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role,
            status: 'pending',
            phone_number,
            bio
        });
        // set session
        const newUser = await User.findOne({ where: { email } });
        req.session.user = {
            id: newUser.user_id,
            email,
            role,
            name: `${first_name} ${last_name}`,
            status: 'pending'
        };
        console.log('POST /register - User created:', email);
        res.redirect('/users/getprofile');
    } catch (error) {
        console.log('Error in POST /register:', error.message);
        console.log(error.stack);
        res.render('auth/register', {
            error: 'Registration failed',
            title: 'Register'
        });
    }
});

router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
    try {
        console.log('POST /login - Request received');
        const { email, password } = req.body;
        console.log('POST /login - Received email:', email);

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('POST /login - User not found');
            return res.render('auth/login', {
                error: 'Invalid credentials',
                title: 'Login'
            });
        }
        console.log('POST /login - User found:', user.email);

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('POST /login - Invalid password');
            return res.render('auth/login', {
                error: 'Invalid credentials',
                title: 'Login'
            });
        }
        console.log('POST /login - Password validated');

        // Set session
        req.session.user = {
            id: user.user_id,
            email: user.email,
            role: user.role,
            name: `${user.first_name} ${user.last_name}`,
            status: user.status
        };
        console.log('POST /login - Session set for user:', req.session.user);

        res.redirect('/users/getprofile');
    } catch (error) {
        console.log('Error in POST /login:', error.message);
        console.log(error.stack);
        res.render('auth/login', {
            error: 'Login failed',
            title: 'Login'
        });
    }
});

router.get('/logout', ensureAuthenticated, (req, res) => {
    if (req.session.user) {
        console.log('GET /logout - Logging out user:', req.session.user.email);
    } else {
        console.log('GET /logout - No user session found');
    }
    req.session.destroy((err) => {
        if (err) {
            console.log('Error in GET /logout:', err.message);
            console.log('Error stack:', err.stack); // Added console.log to detect the error stack
            return res.status(500).send('Failed to log out');
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.redirect('/');
    });
});

module.exports = router;