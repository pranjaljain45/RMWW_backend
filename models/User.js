const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },
  pinCode: { type: String, required: true }
}, { _id: false }); // _id: false avoids generating _id for subdoc

const userSchema = new mongoose.Schema({
  uid: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },

  // Measurements
  heightFeet: { type: String, default: '' },
  heightInches: { type: String, default: '' },
  weight: { type: String, default: '' },
  bustSize: { type: String, default: '' },
  bodyType: { type: String, default: '' },
  primaryDressSize: { type: String, default: '' },

  // Address section
  address: addressSchema
});

module.exports = mongoose.model('User', userSchema);
