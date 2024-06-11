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

function requireLoginR(req, res, next) {
  if (req.session && req.session.restaurantId) {
    next();
  } else {
    res.redirect('/restaurant/login');
  }
}


router.get('/add-restaurant', (req, res) => {
  res.render('add-restaurant');
});

//add a new restaurant
router.post('/add-restaurant', async (req, res) => {
  const { name, contact_no, email, location, picture_url, opening_time, closing_time } = req.body;
  if (!/^\d{11}$/.test(contact_no) || !contact_no.startsWith('01')) {
    return res.status(400).send('Invalid contact_no. Must be an 11-digit number starting with 01.');
  }
  try {
    const query = await db.query(
      'INSERT INTO restaurant (name, contact_no, email, location, opening_time, closing_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, contact_no, email, location, opening_time, closing_time]);
    const restaurantId = query.rows[0].id;
    req.session.restaurantId = restaurantId;
    const insertQuery = await db.query('INSERT INTO restaurant_photos (restaurant_id, picture_url) VALUES ($1, $2)', [restaurantId, picture_url]);
    res.redirect(`/restaurant/restaurant/${restaurantId}`);
  } catch (error) {
    console.error('Error adding restaurant:', error);
    res.status(500).send('Error adding restaurant');
  }
});

router.get('/login', (req, res) => {
  res.render('restaurant-login');
});

// restaurant login
router.post('/login', async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await db.query(
      'SELECT * FROM restaurant WHERE name = $1 AND email = $2',
      [name, email]
    );

    if (result.rows.length === 1) {
      const restaurantId = result.rows[0].id;
      req.session.restaurantId = restaurantId;
      res.redirect(`/restaurant/restaurant/${restaurantId}`);
    } else {
      res.send('Invalid credentials. Please try again.');
    }
  } catch (error) {
    console.error('Error during restaurant login:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/all-restaurants', requireLoginR, async (req, res) => {
  try {
    const restaurants = await db.query('SELECT * FROM restaurant');
    res.render('all-restaurants', { restaurants: restaurants.rows });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/all-restaurants-customer', requireLogin, async (req, res) => {
  try {
    const restaurants = await db.query('SELECT *, TO_CHAR(NOW(), \'HH24:MI:SS\') AS current_time FROM restaurant r left outer join restaurant_photos rp on (r.id = rp.restaurant_id)');

    let discounts = [];

    const customerId = req.session.customerId;
    const customerName = await db.query(`SELECT NAME FROM CUSTOMER WHERE id=$1`, [customerId]);
    if (customerId) {
      const discountResult = await db.query(`
              SELECT d.percentage, cd.code
              FROM customer_discount_offered cdo
              JOIN customer_discount cd ON cdo.customer_discount_id = cd.discount_id
              JOIN discount d ON cd.discount_id = d.id
              WHERE cdo.customer_id = $1`, [customerId]);
      discounts = discountResult.rows;
    }

    res.render('all-restaurants-customer', { restaurants: restaurants.rows, discounts, customerId, customerName });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/restaurant/:id', requireLoginR, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantResult = await db.query('SELECT * FROM restaurant r left outer join restaurant_photos rp on (r.id = rp.restaurant_id) WHERE r.id = $1', [id]);
    const foodResult = await db.query('SELECT * FROM food f left outer join food_photos fp on (f.id = fp.food_id) WHERE restaurant_id = $1 order by f.id', [id]);

    const restaurant = restaurantResult.rows[0];
    const foods = foodResult.rows;

    res.render('restaurant-details', { restaurant, foods });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/orders-exisiting/:id', requireLoginR, async (req, res) => {
  try {
    const { id } = req.params;

    const restaurantResult = await db.query('SELECT id as restaurant_id, name as restaurant_name FROM restaurant WHERE id = $1', [id]);
    const restaurant = restaurantResult.rows[0];

    const ordersQuery = `
      SELECT orders.*, food.id as food_id, food.name as food_name, food_order.no_of_servings
      FROM orders
      INNER JOIN food_order ON orders.id = food_order.order_id
      INNER JOIN food ON food_order.food_id = food.id
      WHERE food.restaurant_id = $1 and orders.status != 'Delivered'
    `;
    const ordersResult = await db.query(ordersQuery, [id]);
    const orders = ordersResult.rows;

    const ordersWithFoodItems = orders.reduce((acc, order) => {
      const existingOrder = acc.find(item => item.id === order.id);
      const foodItem = {
        id: order.food_id,
        name: order.food_name,
        no_of_servings: order.no_of_servings
      };
      if (existingOrder) {
        existingOrder.foodItems.push(foodItem);
      } else {
        const newOrder = { ...order, foodItems: [foodItem] };
        delete newOrder.food_id;
        delete newOrder.food_name;
        delete newOrder.no_of_servings;
        acc.push(newOrder);
      }
      return acc;
    }, []);

    res.render('view-orders-existing', { restaurant, orders: ordersWithFoodItems });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/orders-delivered/:id', requireLoginR, async (req, res) => {
  try {
    const { id } = req.params;

    const restaurantResult = await db.query('SELECT id as restaurant_id, name as restaurant_name FROM restaurant WHERE id = $1', [id]);
    const restaurant = restaurantResult.rows[0];

    const ordersQuery = `
      SELECT orders.*, food.id as food_id, food.name as food_name, food_order.no_of_servings
      FROM orders
      INNER JOIN food_order ON orders.id = food_order.order_id
      INNER JOIN food ON food_order.food_id = food.id
      WHERE food.restaurant_id = $1 and orders.status = 'Delivered'
    `;
    const ordersResult = await db.query(ordersQuery, [id]);
    const orders = ordersResult.rows;

    const ordersWithFoodItems = orders.reduce((acc, order) => {
      const existingOrder = acc.find(item => item.id === order.id);
      const foodItem = {
        id: order.food_id,
        name: order.food_name,
        no_of_servings: order.no_of_servings
      };
      if (existingOrder) {
        existingOrder.foodItems.push(foodItem);
      } else {
        const newOrder = { ...order, foodItems: [foodItem] };
        delete newOrder.food_id;
        delete newOrder.food_name;
        delete newOrder.no_of_servings;
        acc.push(newOrder);
      }
      return acc;
    }, []);

    res.render('view-orders-delivered', { restaurant, orders: ordersWithFoodItems });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/orders-existing-customer/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const restaurantResult = await db.query('SELECT id as restaurant_id, name as restaurant_name FROM restaurant WHERE id = $1', [id]);
    const restaurant = restaurantResult.rows[0];
    const customerId = req.session.customerId;

    const ordersQuery = `
      SELECT orders.*, food.id as food_id, food.name as food_name, food_order.no_of_servings
      FROM orders
      INNER JOIN food_order ON orders.id = food_order.order_id
      INNER JOIN food ON food_order.food_id = food.id
      WHERE orders.customer_id = $1 and orders.status != 'Delivered'
    `;
    const ordersResult = await db.query(ordersQuery, [id]);
    const orders = ordersResult.rows;

    const ordersWithFoodItems = orders.reduce((acc, order) => {
      const existingOrder = acc.find(item => item.id === order.id);
      const foodItem = {
        id: order.food_id,
        name: order.food_name,
        no_of_servings: order.no_of_servings
      };
      if (existingOrder) {
        existingOrder.foodItems.push(foodItem);
      } else {
        const newOrder = { ...order, foodItems: [foodItem] };
        delete newOrder.food_id;
        delete newOrder.food_name;
        delete newOrder.no_of_servings;
        acc.push(newOrder);
      }
      return acc;
    }, []);

    res.render('orders-existing-customer', { restaurant, orders: ordersWithFoodItems, customerId });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/update-order-status', requireLoginR, async (req, res) => {
  try {
    const { orderId, restaurant_id, status } = req.body;

    const updateOrderStatusQuery = `
      UPDATE orders 
      SET status = $1
      WHERE id = $2
    `;
    await db.query(updateOrderStatusQuery, [status, orderId]);

    res.redirect(`/restaurant/restaurant/${restaurant_id}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/restaurant-customer/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantResult = await db.query('SELECT * FROM restaurant WHERE id = $1', [id]);
    const foodResult = await db.query('SELECT * FROM food f left outer join food_photos fp on (f.id = fp.food_id) WHERE restaurant_id = $1 order by f.id', [id]);
    const discountResult = await db.query(`
          SELECT d.id, d.percentage, rd.max_discount
          FROM restaurant_discount_offered rdo
          JOIN restaurant_discount rd ON rdo.restaurant_discount_id = rd.discount_id
          JOIN discount d ON rd.discount_id = d.id
          WHERE rdo.restaurant_id = $1`, [id]);
    const avgScoreResult = await db.query('SELECT ROUND(AVG(score),1) AS avg_score FROM review WHERE restaurant_id = $1', [id]);

    const restaurant = restaurantResult.rows[0];
    const foods = foodResult.rows;
    const discounts = discountResult.rows;
    const avgScore = avgScoreResult.rows[0].avg_score;
    const reviewResult = await db.query(`
          SELECT r.*, c.name AS customer_name
          FROM review r
          JOIN customer c ON r.customer_id = c.id
          WHERE r.restaurant_id = $1`, [id]);
    const reviews = reviewResult.rows;

    res.render('restaurant-details-customer', { restaurant, foods, discounts, avgScore, reviews });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/food/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const foodResult = await db.query('SELECT * FROM food WHERE id = $1', [id]);
    const foodTypeResult = await db.query('SELECT get_food_types($1);', [id]);
    const discountResult = await db.query(`
      SELECT 
      fd.code AS food_discount_code,
      d1.percentage AS food_discount_percentage,
      rd.max_discount AS restaurant_max_discount,
      d2.percentage AS restaurant_discount_percentage
      FROM 
        food f
      JOIN 
        food_discount_offered fdo ON f.id = fdo.food_id
      JOIN 
        food_discount fd ON fdo.food_discount_id = fd.discount_id
      LEFT JOIN 
        restaurant_discount_offered rdo ON f.restaurant_id = rdo.restaurant_id
      LEFT JOIN 
        restaurant_discount rd ON rdo.restaurant_discount_id = rd.discount_id
      LEFT JOIN 
        discount d1 ON fd.discount_id = d1.id
      LEFT JOIN 
        discount d2 ON rd.discount_id = d2.id
      WHERE 
        f.id = $1`, [id]);

    const food = foodResult.rows[0];
    const foodType = foodTypeResult.rows.map(row => ({
      type_name: row.get_food_types
    }));
    const discounts = discountResult.rows;

    //res.render('food-details', { food, foodType, discounts });
    res.render('food-details-for-restaurant', { food, foodType, discounts });
  } catch (error) {
    console.error('Error fetching food details:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/food-customer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const foodResult = await db.query('SELECT * FROM food WHERE id = $1', [id]);
    const foodTypeResult = await db.query('SELECT get_food_types($1);', [id]);
    const discountResult = await db.query(`
    SELECT 
    fd.discount_id AS discount_id,
    COALESCE(fd.code, '') AS food_discount_code,
    COALESCE(d1.percentage, 0) AS food_discount_percentage,
    COALESCE(rd.max_discount, 0) AS restaurant_max_discount,
    COALESCE(d2.percentage, 0) AS restaurant_discount_percentage
FROM 
    food f
left JOIN 
    food_discount_offered fdo ON f.id = fdo.food_id
LEFT JOIN 
    food_discount fd ON fdo.food_discount_id = fd.discount_id
LEFT JOIN 
    restaurant_discount_offered rdo ON f.restaurant_id = rdo.restaurant_id
LEFT JOIN 
    restaurant_discount rd ON rdo.restaurant_discount_id = rd.discount_id
LEFT JOIN 
    discount d1 ON fd.discount_id = d1.id
LEFT JOIN 
    discount d2 ON rd.discount_id = d2.id
WHERE 
    f.id = $1`, [id]);

    const food = foodResult.rows[0];
    const foodType = foodTypeResult.rows.map(row => ({
      type_name: row.get_food_types
    }));
    const discounts = discountResult.rows;

    res.render('food-details', { food, foodType, discounts });
    //res.render('food-details-for-restaurant', { food, foodType, discounts });
  } catch (error) {
    console.error('Error fetching food details:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/admin/add-food', requireLoginR, async (req, res) => {
  try {
    const foodTypesQuery = 'SELECT * FROM food_type';
    const foodTypesResult = await db.query(foodTypesQuery);
    const foodTypes = foodTypesResult.rows;

    res.render('add-food', { foodTypes });
  } catch (error) {
    console.error('Error fetching food types:', error);
    res.status(500).send('Error fetching food types');
  }
});



router.post('/admin/add-food', requireLoginR, async (req, res) => {
  const { name, base_price, description, variation, key_ingredient, nutritional_information, picture_url, foodType } = req.body;
  const restaurant_id = req.session.restaurantId;

  try {
    const insertFoodQuery = 'INSERT INTO food (name, base_price, description, variation, key_ingredient, nutritional_information, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id';
    const insertFoodValues = [name, base_price, description, variation, key_ingredient, nutritional_information, restaurant_id];
    const insertFoodResult = await db.query(insertFoodQuery, insertFoodValues);
    const foodId = insertFoodResult.rows[0].id;

    const insertFoodTypeQuery = 'INSERT INTO food_food_type (food_id, type_id) VALUES ($1, $2)';
    const insertFoodTypeValues = [foodId, foodType];
    await db.query(insertFoodTypeQuery, insertFoodTypeValues);

    const inserturl = await db.query('INSERT INTO food_photos (food_id, picture_url) VALUES ($1, $2)', [foodId, picture_url]);

    res.redirect(`/restaurant/restaurant/${restaurant_id}`);
  } catch (error) {
    console.error('Error adding food item:', error);
    res.status(500).send('Error adding food item');
  }
});

router.get('/admin/update-food/:id', requireLoginR, async (req, res) => {
  const foodId = req.params.id;
  try {
    const foodTypesQuery = 'SELECT * FROM food_type';
    const foodTypesResult = await db.query(foodTypesQuery);
    const foodTypes = foodTypesResult.rows;

    res.render('update-food', { foodTypes, foodId });
  } catch (error) {
      console.error('Error rendering update food form:', error);
      res.status(500).send('Error rendering update food form');
  }
});

router.post('/admin/update-food/:id', requireLoginR, async (req, res) => {
  try {
      const foodId = req.params.id;
      const { name, base_price, description, variation, key_ingredient, nutritional_information, picture_url, foodType } = req.body;

      let updateQuery = 'UPDATE food SET';

      if (name) {
          updateQuery += ` name = '${name}',`;
      }
      if (base_price) {
          updateQuery += `base_price = ${base_price},`;
      }
      if (description) {
          updateQuery += `description = '${description}',`;
      }
      if (variation) {
          updateQuery += `variation = '${description}',`;
      }
      if (key_ingredient) {
          updateQuery += `key_ingredient = '${key_ingredient}',`;
      }
      if (nutritional_information) {
          updateQuery += `nutritional_information = '${nutritional_information}',`;
      }
      if (picture_url) {
        await db.query('UPDATE food_photos SET picture_url = $1 WHERE food_id = $2', [picture_url, foodId]);
    }    
      if (foodType) {
        await db.query(`UPDATE food_food_type set type_id = ${foodType} WHERE food_id = ${foodId}`);
      }

      updateQuery = updateQuery.slice(0, -1);

      updateQuery += ` WHERE id = ${foodId}`;

      await db.query(updateQuery);

      res.redirect(`/restaurant/food/${foodId}`);
  } catch (error) {
      console.error('Error updating food item:', error);
      res.status(500).send('Error updating food item');
  }
});


router.post('/restaurant/:id/delete-food/:foodId', requireLoginR, async (req, res) => {
  const { id, foodId } = req.params;
  try {
    const query = 'CALL delete_food($1)';
    await db.query(query, [foodId]);
    res.redirect(`/restaurant/restaurant/${id}`);
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).send('Error deleting food');
  }
});

router.get('/search-restaurants', requireLogin, async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      res.redirect('/restaurant/all-restaurants');
      return;
    }

    const searchResult = await db.query('SELECT * FROM restaurant WHERE LOWER(name) LIKE LOWER($1)', [`%${search}%`]);

    res.render('search-results', { search, restaurants: searchResult.rows });
  } catch (error) {
    console.error('Error searching restaurants:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/search-food', requireLogin, async (req, res) => {
  try {
    const { foodName } = req.query;
    const result = await db.query('SELECT * FROM food WHERE name ILIKE $1', [`%${foodName}%`]);

    const foods = result.rows;
    res.render('search-food', { foods, searchQuery: foodName });
  } catch (error) {
    console.error('Error searching food:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/add-restaurant-discount', requireLoginR, async (req, res) => {
  res.render('add-restaurant-discount');
});

router.post('/add-restaurant-discount', requireLoginR, async (req, res) => {
  const { percentage, maxDiscount } = req.body;
  const restaurantId = req.session.restaurantId;

  try {
    const result = await db.query('INSERT INTO discount (percentage) VALUES ($1) returning id', [percentage]);
    const discountId = result.rows[0].id;
    const insertDiscountQuery = `
          INSERT INTO restaurant_discount (discount_id, max_discount)
          VALUES ($1, $2)
      `;
    await db.query(insertDiscountQuery, [discountId, maxDiscount]);

    const insertDiscountOfferedQuery = `
          INSERT INTO restaurant_discount_offered (restaurant_id, restaurant_discount_id)
          VALUES ($1, $2)
      `;
    await db.query(insertDiscountOfferedQuery, [restaurantId, discountId]);

    res.redirect(`/restaurant/restaurant/${restaurantId}`);
  } catch (error) {
    console.error('Error adding restaurant discount:', error);
    res.status(500).send('Error adding restaurant discount');
  }
});

router.get('/restaurant-discount', requireLoginR, async (req, res) => {
  const restaurantId = req.session.restaurantId;
  try {
    const discounts = await db.query(
      `select * from restaurant_discount cd 
        full outer join restaurant_discount_offered cdo on(cd.discount_id = cdo.restaurant_discount_id) 
        left join discount d on(cd.discount_id = d.id) where cdo.restaurant_id = $1`, [restaurantId]);
    //console.log('Discounts:', discounts.rows);

    res.render('restaurant-discount', { discounts: discounts.rows });

  } catch (error) {
    console.error('Error fetching customer discounts:', error);
    res.status(500).send('Error fetching customer discounts');
  }
});

router.post('/delete-restaurant-discount', requireLoginR, async (req, res) => {
  const { discountId } = req.body;
  try {
    await db.query('DELETE FROM discount WHERE id = $1', [discountId]);
    res.redirect(`/restaurant/restaurant/${restaurant_id}`);
  } catch (error) {
    console.error('Error deleting restaurant discount:', error);
    res.status(500).send('Error deleting restaurant discount');
  }
});

router.get('/customer-profile', requireLogin, async (req, res) => {
  try {
    const customerId = req.session.customerId;
    const customer = await db.query('SELECT * FROM customer WHERE id = $1', [customerId]);

    res.render('customer-profile', { customer: customer.rows[0] });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/update-contact-no', async (req, res) => {
  try {
    const { contact_no, email } = req.body;

    const result = await db.query('UPDATE customer SET contact_no = $1 WHERE email = $2',
      [contact_no, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Customer not found');
    }
    res.redirect('/restaurant/customer-profile');
  } catch (error) {
    console.error('Error updating customer contact number:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/update-name', async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await db.query('UPDATE customer SET name = $1 WHERE email = $2',
      [name, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Customer not found');
    }

    res.redirect('/restaurant/customer-profile');
  } catch (error) {
    console.error('Error updating customer name:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/update-location', async (req, res) => {
  try {
    const { location, email } = req.body;

    const result = await db.query('UPDATE customer SET location = $1 WHERE email = $2',
      [location, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Customer not found');
    }

    res.redirect('/restaurant/customer-profile');
  } catch (error) {
    console.error('Error updating customer location:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/update-email', async (req, res) => {
  try {
    const { new_email, email } = req.body;

    const result = await db.query('UPDATE customer SET email = $1 WHERE email = $2',
      [new_email, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Customer not found');
    }

    res.redirect('/restaurant/customer-profile');
  } catch (error) {
    console.error('Error updating customer email:', error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/restaurant-profile', requireLoginR, async (req, res) => {
  try {
    const restaurantId = req.session.restaurantId;
    const restaurantQuery = await db.query('SELECT * FROM restaurant WHERE id = $1', [restaurantId]);
    const restaurant = restaurantQuery.rows[0];

    const photoQuery = await db.query('SELECT picture_url FROM restaurant_photos WHERE restaurant_id = $1', [restaurantId]);
    const photoUrl = photoQuery.rows.length > 0 ? photoQuery.rows[0].picture_url : null;

    res.render('restaurant-profile', { restaurant, photoUrl });
  } catch (error) {
    console.error('Error fetching restaurant profile:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/update-email-res', async (req, res) => {
  try {
    const { new_email, email } = req.body;

    const result = await db.query('UPDATE restaurant SET email = $1 WHERE email = $2',
      [new_email, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Restaurant not found');
    }

    res.redirect('/restaurant/restaurant-profile');
  } catch (error) {
    console.error('Error updating restaurant email:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/update-name-res', async (req, res) => {
  try {
    const { new_name, email } = req.body;

    const result = await db.query('UPDATE restaurant SET name = $1 WHERE email= $2',
      [new_name, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Restaurant not found');
    }

    res.redirect('/restaurant/restaurant-profile');
  } catch (error) {
    console.error('Error updating restaurant name:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/update-contact-no-res', async (req, res) => {
  try {
    const { new_contact_no, email } = req.body;

    if (!new_contact_no) {
      return res.status(400).send('Missing parameter new contact');
    }
    if (!email) {
      return res.status(400).send('Missing parameters email');
    }

    const result = await db.query('UPDATE restaurant SET contact_no = $1 WHERE email = $2',
      [new_contact_no, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Restaurant not found');
    }

    res.redirect('/restaurant/restaurant-profile');
  } catch (error) {
    console.error('Error updating restaurant contact number:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/update-location-res', async (req, res) => {
  try {
    const { new_location, email } = req.body;

    const result = await db.query('UPDATE restaurant SET location = $1 WHERE email = $2',
      [new_location, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Restaurant not found');
    }

    res.redirect('/restaurant/restaurant-profile');
  } catch (error) {
    console.error('Error updating restaurant location:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/update-opening-time-res', async (req, res) => {
  try {
    const { opening_time, email } = req.body;

    if (!opening_time) {
      return res.status(400).send('Missing parameter opening time');
    }
    if (!email) {
      return res.status(400).send('Missing parameter email');
    }

    const result = await db.query('UPDATE restaurant SET opening_time = $1 WHERE email = $2',
      [opening_time, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Restaurant not found');
    }

    res.redirect('/restaurant/restaurant-profile');
  } catch (error) {
    console.error('Error updating restaurant opening time:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/update-closing-time-res', async (req, res) => {
  try {
    const { closing_time, email } = req.body;

    if (!closing_time) {
      return res.status(400).send('Missing parameter closing time');
    }
    if (!email) {
      return res.status(400).send('Missing parameter email');
    }

    const result = await db.query('UPDATE restaurant SET closing_time = $1 WHERE email = $2',
      [closing_time, email]);

    if (result.rowCount === 0) {
      return res.status(404).send('Restaurant not found');
    }

    res.redirect('/restaurant/restaurant-profile');
  } catch (error) {
    console.error('Error updating restaurant closing time:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/advanced-search', async (req, res) => {
  res.render('form');
});

router.post('/advanced-search', async (req, res) => {
  try {
    const { foodName, restaurantName, foodType, minScore } = req.body;

    let query = 'SELECT f.* FROM food f';
    query += ' LEFT JOIN review r ON f.restaurant_id = r.restaurant_id';
    query += ' LEFT JOIN restaurant rs ON f.restaurant_id = rs.id';
    query += ' LEFT JOIN food_food_type fft ON f.id = fft.food_id';
    query += ' LEFT JOIN food_type ft ON fft.type_id = ft.id';
    query += ' WHERE 1 = 1';

    if (foodName) {
      query += ` AND f.name ILIKE '%${foodName}%'`;
    }

    if (restaurantName) {
      query += ` AND rs.name ILIKE '%${restaurantName}%'`;
    }

    if (foodType) {
      query += ` AND ft.type_name ILIKE '%${foodType}%'`;
    }

    if (minScore) {
      query += ` GROUP BY f.id HAVING AVG(r.score) >= ${minScore}`;
    }

    const searchResults = await db.query(query);

    res.render('advanced-search-results', { foods: searchResults.rows });
  } catch (error) {
    console.error('Error performing food search:', error);
    res.status(500).send('Error performing food search');
  }
});
module.exports = router;