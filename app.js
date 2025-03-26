const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
require('dotenv').config();
const { sequelize } = require('./models');

// Import routes
const DoctorRouter = require('./routes/Doctor');
const HospitalRouter = require('./routes/Hospital');
const SeedRouter = require('./routes/seed.js');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(expressLayouts); // Enable layouts
app.set('layout', 'layouts/main'); // Set default layout

// Using routes
app.use('/doctors', DoctorRouter);
app.use('/hospitals', HospitalRouter);
app.use('/seed', SeedRouter);

app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact' });
});

// Sync Sequelize & Start Server 
sequelize.sync( {force: true}) // {force: true}
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });
