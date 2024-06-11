require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db');

function requireLoginC(req, res, next) {
    if (req.session && req.session.customerId) {
      next();
    } else {
      res.redirect('/customer/login');
    }
  }

router.get('/addCustomer', (req, res) => {
    res.render('addCustomer.ejs');
});

router.post('/addCustomer', async (req, res) => {
    const { name, contact_no, location, email } = req.body;

    if (!/^\d{11}$/.test(contact_no) || !contact_no.startsWith('01')) {
        return res.status(400).send('Invalid contact_no. Must be an 11-digit number starting with 01.');
    }

    try {
        const result = await db.query(
            'INSERT INTO customer (name, contact_no, location, email) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, contact_no, location, email]
        );
        const customerId = result.rows[0].id;
        req.session.customerId = customerId;
        res.redirect('/restaurant/all-restaurants-customer');
    } catch (error) {
        console.error('Error adding customer:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/addReview/:id', requireLoginC, (req, res) => {
    const restaurantId = req.params.id;
    const customerId = req.session.customerId;

    if (!restaurantId) {
        return res.status(400).send('Restaurant ID is required.');
    }

    res.render('addReview', { customerId, restaurantId });
});


router.post('/addReview/:id', requireLoginC, async (req, res) => {
    const { score, comment } = req.body;
    const  restaurantId  = req.params.id;
    const customerId = req.session.customerId;

    if (!customerId || !restaurantId) {
        return res.status(400).send('Customer ID and Restaurant ID are required.');
    }

    try {
        const result = await db.query(
            'INSERT INTO review (score, comment, customer_id, restaurant_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [score, comment, customerId, restaurantId]
        );
        const reviewId = result.rows[0].id;
        res.redirect(`/restaurant/restaurant-customer/${restaurantId}`);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/myReviews/:restaurantId', requireLoginC, async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const restaurantId = req.params.restaurantId;

        const reviewsResult = await db.query(`
            SELECT r.*, c.name AS customer_name, rest.name AS restaurant_name
            FROM review r
            JOIN customer c ON r.customer_id = c.id
            JOIN restaurant rest ON r.restaurant_id = rest.id
            WHERE r.restaurant_id = $1 AND r.customer_id = $2`, [restaurantId, customerId]);
        const reviews = reviewsResult.rows;

        res.render('my-reviews', { reviews });
    } catch (error) {
        console.error('Error fetching customer reviews:', error);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/login', (req, res) => {
    res.render('customer-login');
});

router.post('/login', async (req, res) => {
    try {
        const { name, email } = req.body;

        const result = await db.query(
            'SELECT id FROM customer WHERE name = $1 AND email = $2',
            [name, email]
        );

        if (result.rows.length === 1) {
            const customerId = result.rows[0].id;
            req.session.customerId = customerId;

            res.redirect('/restaurant/all-restaurants-customer');
        } else {
            res.send('Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Error during customer login:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/deleteReview/:reviewId', requireLoginC, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        
        const restaurantIdResult = await db.query('SELECT restaurant_id FROM review WHERE id = $1', [reviewId]);
        const restaurantId = restaurantIdResult.rows[0].restaurant_id;

        await db.query('DELETE FROM review WHERE id = $1', [reviewId]);

        res.redirect(`/restaurant/restaurant-customer/${restaurantId}`);
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;