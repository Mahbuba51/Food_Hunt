require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db');
function requireLogin(req, res, next) {
    if (req.session && req.session.driverId) {
        next();
    } else {
        res.redirect('/driver/login');
    }
}
router.get('/login', (req, res) => {
    res.render('driver-login'); 
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await db.query(
            'SELECT * FROM driver WHERE user_name = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length === 1) {
            const driverId = result.rows[0].id;
            req.session.driverId = driverId;
          res.redirect('/driver/info');
        } else {
            res.send('Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Error during driver login:', error);
        res.status(500).send('Internal Server Error');
    }
});
// Route to display driver information
/*router.get('/info', requireLogin, async (req, res) => {
    try {
        // Retrieve driver information from the database based on the session driverId
        const driverId = req.session.driverId;
        const result = await db.query('SELECT * FROM driver WHERE id = $1', [driverId]);

        // Render the driver information page and pass the retrieved data to the view
        res.render('driver-info', { driver: result.rows[0] });
    } catch (error) {
        console.error('Error retrieving driver information:', error);
        res.status(500).send('Internal Server Error');
    }
});
*/
router.get('/info', requireLogin, async (req, res) => {
    try {
        const driverId = req.session.driverId;

        const driverResult = await db.query('SELECT * FROM driver WHERE id = $1', [driverId]);
        const driver = driverResult.rows[0];
        const ordersResult = await db.query('SELECT * FROM orders WHERE driver_id = $1', [driverId]);
        const orders= ordersResult.rows;

        res.render('driver-info', { driver, orders});
    } catch (error) {
        console.error('Error retrieving driver information:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/existing-orders', requireLogin, async (req, res) => {
    try {
        const driverId = req.session.driverId;
         const driver=await db.query('SELECT * FROM driver WHERE id = $1',[driverId]);
        const existingOrdersResult = await db.query('SELECT * FROM orders WHERE driver_id = $1 AND status != $2', [driverId, 'Delivered']);
        const existingOrders = existingOrdersResult.rows;

        res.render('existing-orders', { existingOrders,driver });
    } catch (error) {
        console.error('Error retrieving existing orders:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/delivered-orders', requireLogin, async (req, res) => {
    try {
        const driverId = req.session.driverId;

        const deliveredOrdersResult = await db.query('SELECT * FROM orders WHERE driver_id = $1 AND status = $2', [driverId, 'Delivered']);
        const deliveredOrders = deliveredOrdersResult.rows;

        res.render('delivered-orders', { deliveredOrders });
    } catch (error) {
        console.error('Error retrieving delivered orders:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/updateOrderStatus', requireLogin, async (req, res) => {
    try {
        const { orderId, driverId, deliveryTime, status } = req.body;

        let query;
        let queryParams;

        if (deliveryTime) {
            query = 'UPDATE orders SET delivery_time = $1, status = $2 WHERE id = $3';
            queryParams = [deliveryTime, status, orderId];
        } else {
            query = 'UPDATE orders SET status = $1 WHERE id = $2 AND driver_id = $3';
            queryParams = [status, orderId, driverId];
        }

        await db.query(query, queryParams);
        res.status(200).send("succesful");

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/update-name', async (req, res) => {
    try {
      const { name, id} = req.body;
  
      const result = await db.query('UPDATE driver SET name = $1 WHERE id = $2',
        [name, id]);
  
      if (result.rowCount === 0) {
        return res.status(404).send('driver not found');
      }
  
      res.redirect('/driver/info');
    } catch (error) {
      console.error('Error updating customer name:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  router.post('/update-contact-no', async (req, res) => {
    try {
      const { contact_no, id} = req.body;
  
      const result = await db.query('UPDATE driver SET contact_no = $1 WHERE id = $2',
        [contact_no, id]);
  
      if (result.rowCount === 0) {
        return res.status(404).send('driver not found');
      }
  
      res.redirect('/driver/info');
    } catch (error) {
      console.error('Error updating customer name:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  router.post('/update-license-no', async (req, res) => {
    try {
      const { license_no, id} = req.body;
  
      const result = await db.query('UPDATE driver SET driving_license_no = $1 WHERE id = $2',
        [license_no, id]);
  
      if (result.rowCount === 0) {
        return res.status(404).send('driver not found');
      }
  
      res.redirect('/driver/info');
    } catch (error) {
      console.error('Error updating customer name:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  router.post('/update-password', async (req, res) => {
    try {
      const { password, id} = req.body;
  
      const result = await db.query('UPDATE driver SET password = $1 WHERE id = $2',
        [password, id]);
  
      if (result.rowCount === 0) {
        return res.status(404).send('driver not found');
      }
  
      res.redirect('/driver/info');
    } catch (error) {
      console.error('Error updating customer name:', error);
      res.status(500).send('Internal Server Error');
    }
  });
module.exports = router;