require('dotenv').config();
const express = require('express');
const session = require('express-session');
const db = require('./db');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: '123',
    resave: false,
    saveUninitialized: false
}));

// Require route handler files
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const driverRoutes=require('./routes/driverRoutes');

app.get('/', (req, res) => {
    res.render('landing-page.ejs');
});

app.use('/customer', customerRoutes);
app.use('/admin', adminRoutes);
app.use('/restaurant', restaurantRoutes);
app.use('/order', orderRoutes);
app.use('/driver',driverRoutes);


const port = process.env.PORT || 5500;
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});
