const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureRole, ensureStatusAccepted, ensureStatus } = require('../middlewares/auth.js');
const { User } = require('../models/');

router.get('/', ensureAuthenticated, ensureRole('admin'), ensureStatus('accept'), async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('users', { 
            title: 'Users', 
            users,
            currentUser: req.session.user
        });
    } catch (error) {
        console.log('Error in GET /users:', error.message);
        console.log(error.stack);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/getprofile', ensureAuthenticated, async (req, res) => {
    try {
        console.log('GET /users/getprofile - User ID:', req.session.user);
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const user = await User.findByPk(req.session.user.id);
        console.log('GET /users/getprofile - User:', user.dataValues.user_id);
        console.log(`going to route /users/${user.dataValues.user_id}`);
        // res.redirect(`/users/${user.dataValues.user_id}`);
        res.render('users/profile', {
            title: 'User Profile',
            user,
            currentUser: req.session.user
        });
    } catch (error) {
        console.log('Error in GET /users/getprofile:', error.message);
        console.log(error.stack);
        res.send(error.message);
    }
});

router.get('/:id', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
    try {
        console.log('GET /users/:id - Params ID:', req.params.id);
        const user = await User.findByPk(req.params.id);
        if (!user) {
            console.log('GET /users/:id - User not found for ID:', req.params.id);
            return res.status(404).send('User not found');
        }
        console.log('GET /users/:id - User found:', user.dataValues);
        res.render('users/profile', {
            title: 'User Profile',
            user,
            currentUser: req.session.user
        });
    } catch (error) {
        console.log('Error in GET /users/:id:', error.message);
        console.log(error.stack);
        res.send(error.message);
    }
});

router.post('/:id/status', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
    console.log('POST /users/:id/status - Start');
    try {
        console.log('POST /users/:id/status - Params ID:', req.params.id);
        console.log('POST /users/:id/status - Request Body:', req.body);
        const { status } = req.body;
        console.log('POST /users/:id/status - Status to update:', status);
        const updateResult = await User.update(
            { status },
            { where: { user_id: req.params.id } }
        );
        console.log('POST /users/:id/status - Update Result:', updateResult);
        res.redirect('/users');
        console.log('POST /users/:id/status - Redirected to /users');
    } catch (error) {
        console.log('Error in POST /users/:id/status:', error.message);
        console.log(error.stack);
        res.status(500).send('Internal Server Error');
    }
    console.log('POST /users/:id/status - End');
});


module.exports = router;