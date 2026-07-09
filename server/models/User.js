const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full architectural name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email format'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a cryptographic password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['Guest', 'Vendor', 'Admin'],
      default: 'Guest',
    },
    aiPreferenceVector: {
      type: [Number],
      default: [0.5, 0.5, 0.5, 0.5], // [Brutalist weight, Quietness weight, Workspace weight, Price weight]
    },
    stripeCustomerId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to MongoDB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
