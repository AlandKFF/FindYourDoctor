const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server); // Attach Socket.IO to server
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
const FormRouter = require('./routes/Form');
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
app.use('/forms', FormRouter);
app.use('/seed', SeedRouter);

// Sync Sequelize & Start Server 
sequelize.sync() // {force: true}
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });
