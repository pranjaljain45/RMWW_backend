const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },
  pinCode: { type: String, required: true }
}, { _id: false });


const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },

  phoneNumber: { type: String, default: '' },

  // Measurements (optional)
  heightFeet: { type: String, default: '' },
  heightInches: { type: String, default: '' },
  weight: { type: String, default: '' },
  bustSize: { type: String, default: '' },
  bodyType: { type: String, default: '' },
  primaryDressSize: { type: String, default: '' },

  // Address section
  address: { type: addressSchema, default: undefined },

  // Rental History: list of orders
  rentalHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'  // Referencing the Order model
    }
  ]
}, { timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;