const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
require('dotenv').config();
const {sequelize} = require('./models');

// Import routes
const DoctorRouter = require('./routes/Doctor');
const HospitalRouter = require('./routes/Hospital');
const FormRouter = require('./routes/Form')
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
app.use('/doctor', DoctorRouter);
app.use('/hospital', HospitalRouter); 
app.use('/form', FormRouter); 
app.use('/seed', SeedRouter); 

// Main route
app.get('/', (req, res) => {
    res.redirect('/doctor');
});

// { force: true }
sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });