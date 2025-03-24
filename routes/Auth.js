const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { isAuthenticated } = require('../middlewares/auth');
const { Doctor, DoctorCertification, Hospital, DoctorHospital, Village, City, Country } = require('../models');

router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/login', { title: 'Login' });
});

router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    res.redirect('/login');
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    res.redirect('/');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/login');
});

module.exports = router