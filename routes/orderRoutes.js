require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db');

function requireLogin(req, res, next) {
    if (req.session && req.session.customerId) {
        next();
    } else {
        res.redirect('/customer/login');
    }
}

router.get('/cart', requireLogin, (req, res) => {
    const cartItems = req.session.cart || [];

    res.render('cart', { cartItems });
});

router.post('/remove-from-cart', requireLogin, (req, res) => {
    const { food } = req.body;
    const cartItems = req.session.cart || [];

    const foodObject = JSON.parse(food);

    req.session.cart = cartItems.filter(item => {
        return item.food.id !== foodObject.food.id;
    });

    res.redirect('/order/cart');
});

router.post('/remove-all-from-cart', requireLogin, (req, res) => {
    req.session.cart = [];

    res.redirect('/order/cart');
});



/*router.post('/add-to-cart', requireLogin, (req, res) => {
    try {
        const { food, discount } = req.body;

        const foodObj = JSON.parse(food);
        const discountObj = JSON.parse(discount);

        req.session.cart = req.session.cart || [];

        req.session.cart.push({ food: foodObj, discount: discountObj });

        res.send('Item added to cart successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding item to cart');
    }
});*/

router.post('/add-to-cart', requireLogin, async (req, res) => {
    try {
        const { food, discount } = req.body;
        let flag = 0;

        const foodObj = JSON.parse(food);
        const discountObj = JSON.parse(discount);
        req.session.cart = req.session.cart || [];

        if (req.session.cart || req.session.cart.length != 0) {
            const restaurantId = foodObj.restaurant_id;

            const cartContainsFoodFromDifferentRestaurant = req.session.cart.some(item => {
                return item.food.restaurant_id !== restaurantId;
            });

            if (cartContainsFoodFromDifferentRestaurant) {
                flag = 1;
                return res.status(400).send('You can only order food items from one restaurant at a time');
            }
        }

        const restaurantId = foodObj.restaurant_id;
        const query = `
            SELECT *,
                   (SELECT opening_time FROM restaurant WHERE id = $1) AS opening_time,
                   (SELECT closing_time FROM restaurant WHERE id = $1) AS closing_time,
                   TO_CHAR(NOW(), 'HH24:MI:SS') AS current_time
            FROM restaurant
            WHERE id = $1`;
        const restaurant = await db.query(query, [restaurantId]);
        const openingTime = restaurant.rows[0].opening_time;
        const closingTime = restaurant.rows[0].closing_time;
        const currentTime = restaurant.rows[0].current_time;
        
        const openingTimeParts = openingTime.split(':');
        const closingTimeParts = closingTime.split(':');
        const currentTimeParts = currentTime.split(':');
        
        const openingTimeHHMM = `${openingTimeParts[0]}:${openingTimeParts[1]}`;
        const closingTimeHHMM = `${closingTimeParts[0]}:${closingTimeParts[1]}`;
        const currentTimeHHMM = `${currentTimeParts[0]}:${currentTimeParts[1]}`;
        
        if (currentTimeHHMM < openingTimeHHMM || currentTimeHHMM > closingTimeHHMM) {
            flag = 1;
            return res.status(400).send('This restaurant is currently closed for orders');
        }
        

        if (flag != 1) {
            req.session.cart.push({ food: foodObj, discount: discountObj, discounted_price: 0 });
        }
        res.render('itemToCart');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding item to cart');
    }
});



/*router.post('/add-to-cart', requireLogin, (req, res) => {
    try {
        const { food, discount } = req.body;

        const foodObj = JSON.parse(food);
        const discountObj = JSON.parse(discount);

        req.session.cart = req.session.cart || [];

        req.session.cart.push({ food: foodObj, discount: discountObj });

        res.json({ success: true, message: 'Item added to cart successfully' }); // Send JSON response indicating success
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error adding item to cart' }); // Send JSON response indicating error
    }
});*/


router.get('/review', requireLogin, (req, res) => {
    const cartItems = req.session.cart || [];
    if (cartItems.length === 0) {
        return res.redirect('/order/cart');
    }
    cartItems.forEach(item => {
        item.discounted_price = 0;
        if (item.discount && item.discount.length > 0) {
            if (item.discount[0].food_discount_percentage) {
                item.discounted_price = Math.round(item.food.base_price - item.food.base_price * item.discount[0].food_discount_percentage * 0.01);
            }
            if (item.discount[0].restaurant_discount_percentage) {
                if (!item.discounted_price) {
                    item.discounted_price = item.food.base_price;
                }
                item.discounted_price = Math.round(item.discounted_price * item.discount[0].restaurant_discount_percentage * 0.01);
                if (item.discounted_price > item.discount[0].restaurant_max_discount) {
                    item.discounted_price = item.discount[0].restaurant_max_discount;
                }
            }
        } else {
            item.discounted_price = 0;
        }
    });

    res.render('order-review', { cartItems });
});

router.post('/confirm', async (req, res) => {
    const client = await db.connect(); 

    try {
        await client.query('BEGIN'); 

        const { specialInstructions, deliveryLocation, paymentType, discountCode } = req.body;
        const cartItems = req.session.cart || [];
        const customerId = req.session.customerId;

        let discountPercentage = 0;
        if (discountCode) {
            const discountQuery = `
                SELECT discount.id, percentage FROM discount 
                INNER JOIN customer_discount ON discount.id = customer_discount.discount_id 
                WHERE code = $1`;
            const discountResult = await client.query(discountQuery, [discountCode]);
            if (discountResult.rows.length > 0) {
                discountPercentage = discountResult.rows[0].percentage;
            }
        }

        const availableDriverQuery = `
            SELECT id FROM driver 
            WHERE id NOT IN (
                SELECT driver_id FROM orders 
                WHERE status NOT IN ('Delivered', 'Returned')
            ) 
            LIMIT 1`;

        const availableDriverResult = await client.query(availableDriverQuery);
        if (availableDriverResult.rows.length === 0) {
            throw new Error('No available drivers found.');
        }

        const driverId = availableDriverResult.rows[0].id;

        let totalAmount = 0;
        cartItems.forEach(item => {
            totalAmount += (item.food.base_price - item.discounted_price) * req.body[`servings_${item.food.id}`];
        });

        if (discountPercentage > 0) {
            const discountAmount = totalAmount * (discountPercentage / 100);
            totalAmount -= discountAmount;
        }

        const result = await db.query('SELECT charge FROM delivery_charge ORDER BY id DESC LIMIT 1');
        const deliveryCharge = result.rows[0];
        totalAmount += deliveryCharge.charge;

        const insertOrderQuery = `
            INSERT INTO orders 
            (total_amount, special_instructions, delivery_location, delivery_charge, customer_id, driver_id) 
            VALUES ($1::float, $2, $3, $4, $5, $6)
            RETURNING id`;

        const insertOrderValues = [parseFloat(totalAmount), specialInstructions, deliveryLocation, deliveryCharge.charge, customerId, driverId];
        const insertOrderResult = await client.query(insertOrderQuery, insertOrderValues);
        const orderId = insertOrderResult.rows[0].id;

        const insertPaymentQuery = `
            INSERT INTO payment 
            (payment_type, order_id) 
            VALUES ($1, $2)`;

        const insertPaymentValues = [paymentType, orderId];
        await client.query(insertPaymentQuery, insertPaymentValues);

        for (const item of cartItems) {
            const insertFoodOrderQuery = `
                INSERT INTO food_order 
                (food_id, order_id, no_of_servings) 
                VALUES ($1, $2, $3)`;

            const insertFoodOrderValues = [item.food.id, orderId, req.body[`servings_${item.food.id}`]];
            await client.query(insertFoodOrderQuery, insertFoodOrderValues);
        }

        const query = 'CALL apply_discounts($1, $2)';
        await client.query(query, [orderId, discountCode]);
        

        await client.query('COMMIT'); 

        req.session.cart = [];
        const driverQuery = 'SELECT name, contact_no FROM driver WHERE id = $1';
        const driverResult = await client.query(driverQuery, [driverId]);
        const driverName = driverResult.rows[0].name;
        const driverContactNumber = driverResult.rows[0].contact_no;

        const updatedCartItems = cartItems.map(item => {
            const servings = req.body[`servings_${item.food.id}`];
            return {
                food: item.food,
                discount: item.discount,
                discounted_price: item.discounted_price,
                no_of_servings: servings
            };
        });

        res.render('order-success', {
            totalAmount,
            specialInstructions,
            deliveryLocation,
            paymentType,
            deliveryCharge,
            cartItems: updatedCartItems,
            driverName,
            driverContactNumber
        });
    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Error confirming order:', error);
        res.status(500).send('Error confirming order');
    } finally {
        client.release(); 
    }
});



module.exports = router;
