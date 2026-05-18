const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Product details
  productId: { 
    type: String, 
    required: true, 
    index: true,
    ref: 'Product'
  },
  
  // Size of the product being booked
  size: { 
    type: String, 
    required: true 
  },

  // Rental period
  rentalStartDate: { 
    type: Date, 
    required: true,
    index: true 
  },
  
  rentalEndDate: { 
    type: Date, 
    required: true,
    index: true 
  },

  // User who booked
  uid: { 
    type: String, 
    required: true,
    index: true 
  },
  
  email: { 
    type: String, 
    required: true 
  },

  // Order reference
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    required: true 
  },

  // Booking status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
    index: true
  },

  // Buffer days (for cleaning/maintenance between rentals)
  bufferDaysBefore: { 
    type: Number, 
    default: 5 
  },
  
  bufferDaysAfter: { 
    type: Number, 
    default: 6 
  }

}, { timestamps: true });

// Compound index for efficient availability checks
bookingSchema.index({ productId: 1, size: 1, rentalStartDate: 1, rentalEndDate: 1 });
bookingSchema.index({ productId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
