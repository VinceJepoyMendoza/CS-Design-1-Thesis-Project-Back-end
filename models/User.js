import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: [true, 'Please provide first name'],
      maxlength: 25,
      trim: true,
    },
    mname: {
      type: String,
      maxlength: 25,
      trim: true,
    },
    lname: {
      type: String,
      required: [true, 'Please provide last name'],
      maxlength: 25,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email format',
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password cannot be empty'],
      minlength: 6,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  // Hashing password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Make sure newly created account is set to user
  this.role = 'user';
});

// Create a jwt token
UserSchema.methods.createToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// Verify password
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', UserSchema);
