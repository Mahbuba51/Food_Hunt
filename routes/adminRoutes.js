require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db');

function requireLogin(req, res, next) {
    if (req.session && req.session.isAdmin == 1) {
        next();
    } else {
        res.redirect('/admin/login'); 
    }
  }

router.get('/login', (req, res) =>{
    res.render('admin-login');
  });
  
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (username === adminUsername && password === adminPassword) {
        req.session.isAdmin = 1;
        res.redirect('dashboard');
    } else {
        res.render('admin-login', { error: 'Invalid username or password' });
    }
  });
  
  router.get('/dashboard', requireLogin, async (req, res) => {
    try {
        const driversQuery = 'SELECT * FROM driver';
        const restaurantsQuery = 'SELECT * FROM restaurant';
  
        const driversResult = await db.query(driversQuery);
        const restaurantsResult = await db.query(restaurantsQuery);
  
        const drivers = driversResult.rows;
        const restaurants = restaurantsResult.rows;
  
        const success = req.query.success;
  
        res.render('admin-dashboard', { drivers, restaurants, success });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
  });
  
  
  router.post('/add-driver', requireLogin, async (req, res) => {
    const { user_name, password, name, contact_no, driving_license_no, monthly_payment } = req.body;
    if (!/^\d{11}$/.test(contact_no) || !contact_no.startsWith('01')) {
      return res.status(400).send('Invalid contact_no. Must be an 11-digit number starting with 01.');}
    try {
        const query = 'SELECT add_driver($1, $2, $3, $4, $5, $6)';
        await db.query(query, [user_name, password, name, contact_no, driving_license_no, monthly_payment]);
        res.redirect('/admin/dashboard?success=driver-added');
    } catch (error) {
        console.error('Error adding driver:', error);
        res.status(500).send('Error adding driver');
    }
  });
  
  router.post('/add-restaurant', requireLogin, async (req, res) => {
    const { name, contact_no, email, location, opening_time, closing_time } = req.body;
    if (!/^\d{11}$/.test(contact_no) || !contact_no.startsWith('01')) {
      return res.status(400).send('Invalid contact_no. Must be an 11-digit number starting with 01.');}
    try {
        const query = 'SELECT add_restaurant($1, $2, $3, $4, $5, $6)';
        await db.query(query, [name, contact_no, email, location, opening_time, closing_time]);
        res.redirect('/admin/dashboard?success=restaurant-added');
    } catch (error) {
        console.error('Error adding restaurant:', error);
        res.status(500).send('Error adding restaurant');
    }
  });
  
  router.post('/delete-driver', requireLogin, async (req, res) => {
    const driverId = req.body.driverId;
    try {
        const query = 'CALL delete_driver($1)';
        await db.query(query, [driverId]);
        res.redirect('/admin/dashboard?success=driver-deleted');
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).send('Error deleting driver');
    }
  });
  
  router.post('/delete-restaurant', requireLogin, async (req, res) => {
    const restaurantId = req.body.restaurantId;
    try {
        const query = 'CALL delete_restaurant($1)';
        await db.query(query, [restaurantId]);
        res.redirect('/admin/dashboard?success=restaurant-deleted');
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).send('Error deleting restaurant');
    }
  });

  
router.get('/update-driver/:id', requireLogin, async (req, res) => {
  try {
      
      const driverResult = await db.query('SELECT * FROM driver WHERE id = $1', [req.params.id]);

      const driver = driverResult.rows[0];

      if (!driver) {
          return res.status(404).send('Driver not found');
      }

      res.render('update-driver-admin', { driver });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

router.post('/update-driver/:id', requireLogin, async (req, res) => {
  const driverId = req.params.id;
  const { newValue } = req.body;

  try {
      const result = await db.query(
          `UPDATE driver SET monthly_payment = $1 WHERE id = $2`,
          [newValue, driverId]
      );

      if (result.rowCount === 0) {
          return res.status(404).json({ message: 'Driver not found' });
      }

      res.redirect('/admin/dashboard?success=driver-updated');
  } catch (error) {
      console.error('Error updating driver:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


// router.get('/update-restaurant/:id', requireLogin, async (req, res) => {
//   try {
      
//       const restaurantResult = await db.query('SELECT * FROM restaurant WHERE id = $1', [req.params.id]);

//       const restaurant = restaurantResult.rows[0];

//       if (!restaurant) {
//           return res.status(404).send('Restaurant not found');
//       }

//       res.render('update-restaurant', { restaurant });
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//   }
// });


router.post('/update-restaurant/:id', requireLogin, async (req, res) => {
  const restaurantId = req.params.id;
  const { columnName, columnValue } = req.body;

  try {
      const result = await db.query(
          `UPDATE restaurant SET ${columnName} = $1 WHERE id = $2`,
          [columnValue, restaurantId]
      );

      if (result.rowCount === 0) {
          return res.status(404).json({ message: 'Restaurant not found' });
      }

      res.redirect('/admin/dashboard?success=restaurant-updated');
  } catch (error) {
      console.error('Error updating restaurant:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/add-driver', requireLogin, (req, res) => {
    res.render('add-driver');
});

router.get('/add-restaurant_from_admin', requireLogin, (req, res) => {
    res.render('add-restaurant_from_admin');
});
router.get('/existing-drivers', requireLogin, async (req, res) => {
    try {
        const driversResult = await db.query('SELECT * FROM driver');
        const drivers = driversResult.rows;

        res.render('existing-drivers', { drivers });
    } catch (error) {
        console.error('Error fetching existing drivers:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/existing-restaurants', requireLogin, async (req, res) => {
    try {
        const restaurantsResult = await db.query('SELECT * FROM restaurant');
        const restaurants = restaurantsResult.rows;

        res.render('existing-restaurants', { restaurants });
    } catch (error) {
        console.error('Error retrieving existing restaurants:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/add-customer-discount', requireLogin, async (req, res)=>{
    res.render('add-customer-discount');
});

router.post('/add-customer-discount', requireLogin, async (req, res) => {
    const { percentage, code, customerId } = req.body;

    try {
        const result = await db.query('INSERT INTO discount (percentage) VALUES ($1) returning id', [percentage]);
        const discountId = result.rows[0].id;
        const insertDiscountQuery = `
            INSERT INTO customer_discount (discount_id, code)
            VALUES ($1, $2)
        `;
        await db.query(insertDiscountQuery, [discountId, code]);

        const insertDiscountOfferedQuery = `
            INSERT INTO customer_discount_offered (customer_id, customer_discount_id)
            VALUES ($1, $2)
        `;
        await db.query(insertDiscountOfferedQuery, [customerId, discountId]);

        res.redirect('/admin/dashboard?success=customer-discount-added');
    } catch (error) {
        console.error('Error adding customer discount:', error);
        res.status(500).send('Error adding customer discount');
    }
});

router.get('/customer-discounts', requireLogin, async (req, res) => {
    try {
        const discounts = await db.query('select * from customer_discount cd full outer join customer_discount_offered cdo on(cd.discount_id = cdo.customer_discount_id) left join discount d on(cd.discount_id = d.id)');
  
        res.render('customer-discounts', { discounts: discounts.rows });

    } catch (error) {
        console.error('Error fetching customer discounts:', error);
        res.status(500).send('Error fetching customer discounts');
    }
});

router.post('/delete-customer-discount', requireLogin, async (req, res) => {
    const { discountId } = req.body;
    try {
        await db.query('DELETE FROM discount WHERE id = $1', [discountId]);
        res.redirect('/admin/customer-discounts?success=customer-discount-deleted');
    } catch (error) {
        console.error('Error deleting customer discount:', error);
        res.status(500).send('Error deleting customer discount');
    }
});

router.get('/delivery-charge', async (req, res) => {
    try {
        const deliveryCharge = await db.query('SELECT charge FROM delivery_charge ORDER BY id DESC LIMIT 1');
        res.render('delivery-charge', {deliveryCharge: deliveryCharge.rows[0]});
    } catch (error) {
        console.error('Error fetching delivery charge:', error);
        res.status(500).json({ error: 'Error fetching delivery charge'});
    }
});

router.post('/delivery-charge', async (req, res) => {
    const { newCharge } = req.body;
    try {
        await db.query('UPDATE delivery_charge SET charge = $1 WHERE id = 1', [newCharge]);
        res.redirect('/admin/delivery-charge?success=delivery-charge-updated');
    } catch (error) {
        console.error('Error updating delivery charge:', error);
        res.status(500).send('Error updating delivery charge');
    }
});



module.exports = router;