const express = require('express');
const router = express.Router();
const { ContactReports } = require('../models'); 
const { ensureAuthenticated, ensureStatus, ensureRole } = require('../middlewares/auth.js');

router.get('/', (req, res) => {
    res.render('contact', { title: 'Contact' });
});

// Route to handle contact form submission
router.post('/', (req, res) => {
    const { name, contact_info, message } = req.body;
    console.log(req.body);
    
    // Validate the input
    if (!name || !message || !contact_info) {
        return res.status(400).send('All fields are required.');
    }
    ContactReports.create({
        name,
        contact_info,
        message,
    })
    .then(() => {
        console.log('Contact form submission saved to database.');
    })

    console.log('Contact Form Submission:',  name, message , contact_info);
    console.log("head back to home page");
    
    // Redirect to the home page or a thank you page
    res.redirect('/');
});

router.get('/reports', ensureAuthenticated, ensureStatus('accept'), ensureRole('admin'), async (req, res) => {
    // res.send('Contact Reports Page');
    try {
        const reports = await ContactReports.findAll({
            attributes: ['report_id', 'name', 'contact_info', 'message', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        res.render('contact/reports', { reports, title: 'Contact Reports' });
    } catch (error) {
        console.error('Error fetching contact reports:', error);
        res.status(500).render('error', { message: 'Failed to fetch contact reports' });
    }
});

module.exports = router;