const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST /api/bookings/check-cart-availability
router.post('/check-cart-availability', bookingController.checkCartAvailability);

// GET /api/bookings/available-dates/:productId/:size
router.get('/available-dates/:productId/:size', bookingController.getAvailableDates);

// GET /api/bookings/user/:uid
router.get('/user/:uid', bookingController.getUserBookings);

module.exports = router;
