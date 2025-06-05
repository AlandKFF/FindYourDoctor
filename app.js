const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
console.log("port is ", PORT);


const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
require('dotenv').config();
const { sequelize } = require('./models');
const {sessionMiddleware, setLoggedInUser} = require('./middlewares/session.js');

// Import routes
const DoctorRouter = require('./routes/Doctor');
const HospitalRouter = require('./routes/Hospital');
const AuthRouter = require('./routes/Auth');
const UserRouter = require('./routes/User');
const ContactRoute = require('./routes/Contact');
const SeedRouter = require('./routes/seed.js');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);
app.use(setLoggedInUser);
// app.use(ensureAdmin); // Removed from here as it applies to ALL routes

// View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(expressLayouts); // Enable layouts
app.set('layout', 'layouts/main'); // Set default layout

// Using routes
app.use('/doctors', DoctorRouter);
app.use('/hospitals', HospitalRouter);
app.use('/auth', AuthRouter); 
app.use('/users', UserRouter);
app.use('/contact', ContactRoute);
app.use('/', SeedRouter);

// app.get('/', (req, res) => {
//     res.render('index', { title: 'Home', user: req.session.user });
// });

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/terms', (req, res) => {
    res.render('terms', { title: 'Terms' });
});

app.get('/privacy', (req, res) => {
    res.render('privacy', { title: 'Privacy' });
});

// Sync Sequelize & Start Server 
sequelize.sync({alter: true}) // {force: true}
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });
