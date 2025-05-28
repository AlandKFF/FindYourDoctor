const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Hospital, Doctor, ContactReports } = require('../models/');
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth.js');

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
        console.log('POST /register - Starting registration process');
        
        const { first_name, last_name, email, password, phone_number, bio } = req.body;
        let { privacy_policy_agreement, terms_of_service_agreement } = req.body;
        
        if (privacy_policy_agreement == 'on') {
            privacy_policy_agreement = true;
        } else {
            privacy_policy_agreement = false;
        }
        if (terms_of_service_agreement == 'on') {
            terms_of_service_agreement = true;
        }
        // Validate agreements
        if (!privacy_policy_agreement || !terms_of_service_agreement) {
            return res.render('auth/register', {
                error: 'You must accept both the Privacy Policy and Terms of Service to register',
                title: 'Register'
            });
        }
        console.log('POST /register - Received data:', { first_name, last_name, email, phone_number, bio, privacy_policy_agreement, terms_of_service_agreement });
        
        const role = "hospital_manager";
        console.log('POST /register - Role set to:', role);

        // Check if user already exists
        console.log('POST /register - Checking for existing user with email:', email);
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('POST /register - User already exists with email:', email);
            return res.render('auth/register', {
                error: 'Email already registered',
                title: 'Register'
            });
        }
        console.log('POST /register - No existing user found, proceeding with registration');

        // Hash password
        console.log('POST /register - Hashing password');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('POST /register - Password hashed successfully');

        // Create user
        console.log('POST /register - Creating new user');
        await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role,
            status: 'pending',
            phone_number,
            bio,
            privacy_policy_agreement,
            terms_of_service_agreement
        });
        console.log('POST /register - User created in database');

        // set session
        console.log('POST /register - Fetching newly created user');
        const newUser = await User.findOne({ where: { email } });
        console.log('POST /register - Setting up user session');
        req.session.user = {
            id: newUser.user_id,
            email,
            role,
            name: `${first_name} ${last_name}`,
            status: 'pending'
        };
        console.log('POST /register - User session created:', req.session.user);
        console.log('POST /register - User created:', email);
        console.log('POST /register - Redirecting to profile page');
        res.redirect('/users/getprofile');
    } catch (error) {
        console.log('Error in POST /register:', error.message);
        console.log('Full error stack:', error.stack);
        console.log('POST /register - Registration failed, rendering error page');
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

router.get('/dashboard', ensureAdmin, async (req, res) => {
    try {
        console.log('GET /dashboard - Attempting to render dashboard');
        
        // Verify admin role again as extra security check
        if (req.session.user.role !== 'admin') {
            console.log('GET /dashboard - Unauthorized access attempt by non-admin user');
            return res.status(403).render('error', {
                error: 'You do not have permission to access this page',
                title: 'Access Denied'
            });
        }
        
        // Fetch statistics for dashboard
        const [userCount, pendingUserCount, hospitalCount, pendingHospitalCount, doctorCount, contactReportCount] = await Promise.all([
            User.count(),
            User.count({ where: { status: 'pending' } }),
            Hospital.count(),
            Hospital.count({ where: { status: 'pending' } }),
            Doctor.count(),
            ContactReports.count()
        ]);
        
        // Get recent contact reports
        const recentReports = await ContactReports.findAll({
            limit: 5,
            order: [['created_at', 'DESC']]
        });
        
        // Get pending user registrations
        const pendingUsers = await User.findAll({
            where: { status: 'pending' },
            limit: 5,
            order: [['user_id', 'DESC']]
        });
        
        // Pass user data and statistics to dashboard view
        const userData = {
            title: 'Admin Dashboard',
            user: req.session.user,
            stats: {
                userCount,
                pendingUserCount,
                hospitalCount,
                pendingHospitalCount,
                doctorCount,
                contactReportCount
            },
            recentReports,
            pendingUsers
        };

        res.render('auth/Dashboard', userData);
        console.log('GET /dashboard - Dashboard rendered successfully');
    } catch (error) {
        console.error('Error in GET /dashboard:', error.message);
        console.error('Full error stack:', error.stack);
        
        // Return a more specific error message
        res.status(500).render('error', {
            error: 'An error occurred while loading the dashboard. Please try again later.',
            title: 'Dashboard Error'
        });
    }
});

module.exports = router;