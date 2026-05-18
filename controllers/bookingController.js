const Booking = require('../models/Booking');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Default buffer configuration
const DEFAULT_BUFFER_BEFORE = 5;
const DEFAULT_BUFFER_AFTER = 6;

/**
 * Normalize date to midnight UTC
 */
function normalizeDate(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Check if a product is available for given dates
 */
async function checkAvailability(productId, size, startDate, endDate) {
  try {
    
    // Validate product exists and is active
    const product = await Product.findById(productId);

    if (!product) {
      return { available: false, message: 'Product not found' };
    }

    // If status is explicitly set to 'inactive', mark as unavailable
    // Otherwise (undefined or 'active'), treat as available
    if (product.status === 'inactive') {
      return { available: false, message: 'Product is not available' };
    }

    // Normalize dates
    const requestStart = normalizeDate(startDate);
    const requestEnd = normalizeDate(endDate);
    const today = normalizeDate(new Date());

    // Validate dates
    if (requestStart < today) {
      return { available: false, message: 'Start date cannot be in the past' };
    }

    if (requestEnd <= requestStart) {
      return { available: false, message: 'End date must be after start date' };
    }

    // Calculate the blocked period for the NEW booking request
    const newBookingStart = new Date(requestStart);
    const newBookingEnd = new Date(requestEnd);
    
    // Find all active bookings for this product/size
    const existingBookings = await Booking.find({
      productId,
      size,
      status: 'active',
      rentalEndDate: { $gte: today }
    });


    // Check each existing booking for conflicts
    for (const booking of existingBookings) {

      // Calculate the blocked period for the EXISTING booking
      const existingBlockedStart = new Date(booking.rentalStartDate);
      existingBlockedStart.setDate(
        existingBlockedStart.getDate() - (booking.bufferDaysBefore || DEFAULT_BUFFER_BEFORE)
      );

      const existingBlockedEnd = new Date(booking.rentalEndDate);
      existingBlockedEnd.setDate(
        existingBlockedEnd.getDate() + (booking.bufferDaysAfter || DEFAULT_BUFFER_AFTER)
      );

      // Check if the blocked periods overlap
      // Overlap occurs if: newStart <= existingEnd AND newEnd >= existingStart
      const hasOverlap =
        newBookingStart <= existingBlockedEnd &&
        newBookingEnd >= existingBlockedStart;

      if (hasOverlap) {
        return {
          available: false,
          message: 'Product is already booked for these dates (including buffer period)',
          conflicts: [{
            start: booking.rentalStartDate,
            end: booking.rentalEndDate,
            orderId: booking.orderId
          }]
        };
      }
    }

    return {
      available: true,
      message: 'Product is available'
    };

  } catch (error) {
    console.error('Error in checkAvailability:', error);
    return {
      available: false,
      message: 'Error checking availability',
      error: error.message
    };
  }
}

/**
 * API: Check availability for multiple cart items
 * POST /api/bookings/check-cart-availability
 */
exports.checkCartAvailability = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    // Check each item
    const results = await Promise.all(
      items.map(async (item) => {
        const result = await checkAvailability(
          item.productId,
          item.size,
          item.rentalStartDate,
          item.rentalEndDate
        );

        return {
          productId: item.productId,
          size: item.size,
          ...result
        };
      })
    );

    const allAvailable = results.every(r => r.available);

    return res.json({
      success: true,
      allAvailable,
      results
    });

  } catch (error) {
    console.error('Error in checkCartAvailability:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * API: Get unavailable date ranges for a product (for calendar UI)
 * GET /api/bookings/available-dates/:productId/:size?daysAhead=90
 */
exports.getAvailableDates = async (req, res) => {
  try {
    const { productId, size } = req.params;
    const daysAhead = parseInt(req.query.daysAhead) || 90;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const today = normalizeDate(new Date());

    // Get all active bookings for this product/size
    const bookings = await Booking.find({
      productId: productId,
      size: size,
      status: 'active',
      rentalEndDate: { $gte: today }
    }).sort({ rentalStartDate: 1 });

    // Build unavailable ranges (including buffer periods from each booking)
    const unavailableRanges = bookings.map(booking => {
      const blockedStart = new Date(booking.rentalStartDate);
      blockedStart.setDate(
        blockedStart.getDate() - (booking.bufferDaysBefore || DEFAULT_BUFFER_BEFORE)
      );

      const blockedEnd = new Date(booking.rentalEndDate);
      blockedEnd.setDate(
        blockedEnd.getDate() + (booking.bufferDaysAfter || DEFAULT_BUFFER_AFTER)
      );

      return {
        start: blockedStart,
        end: blockedEnd,
        reason: 'Booked (including maintenance period)'
      };
    });

    return res.json({
      success: true,
      availableDates: {
        unavailableRanges,
        bookings: bookings.map(b => ({
          start: b.rentalStartDate,
          end: b.rentalEndDate
        }))
      }
    });

  } catch (error) {
    console.error('Error in getAvailableDates:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Create bookings for an order
 */
exports.createBookingsForOrder = async (orderId, uid, email) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const bookings = [];

    for (const item of order.items) {
      if (!item.rentalStartDate || !item.rentalEndDate) {
        console.error(`Missing dates for item in order ${orderId}`);
        continue;
      }

      const booking = new Booking({
        productId: item.productId,
        size: item.size,
        rentalStartDate: new Date(item.rentalStartDate),
        rentalEndDate: new Date(item.rentalEndDate),
        uid: uid,
        email: email,
        orderId: orderId,
        status: 'active',
        bufferDaysBefore: DEFAULT_BUFFER_BEFORE,
        bufferDaysAfter: DEFAULT_BUFFER_AFTER
      });

      await booking.save();
      bookings.push(booking);
    }

    return {
      success: true,
      bookings
    };

  } catch (error) {
    console.error('Error creating bookings:', error);
    throw error;
  }
};

/**
 * Cancel all bookings for an order
 */
exports.cancelBookingsForOrder = async (orderId) => {
  try {
    const result = await Booking.updateMany(
      { orderId: orderId, status: 'active' },
      { $set: { status: 'cancelled' } }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount
    };

  } catch (error) {
    console.error('Error cancelling bookings:', error);
    throw error;
  }
};

/**
 * Complete all bookings for an order
 */
exports.completeBookingsForOrder = async (orderId) => {
  try {
    const result = await Booking.updateMany(
      { orderId: orderId, status: 'active' },
      { $set: { status: 'completed' } }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount
    };

  } catch (error) {
    console.error('Error completing bookings:', error);
    throw error;
  }
};

/**
 * API: Get user's bookings
 * GET /api/bookings/user/:uid?status=active
 */
exports.getUserBookings = async (req, res) => {
  try {
    const { uid } = req.params;
    const { status } = req.query;

    const query = { uid };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('orderId')
      .sort({ rentalStartDate: -1 });

    return res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Error getting user bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Export for use by other controllers
exports.checkAvailability = checkAvailability;

module.exports = exports;
