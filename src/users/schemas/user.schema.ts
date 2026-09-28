import { Schema } from 'mongoose';

export const USER_MODEL = 'user';

export const UserSchema = new Schema({
  _id: { type: String, required: false },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  firstName: { type: String, required: true, minlength: 1, maxlength: 50 },
  lastName: { type: String, required: true, minlength: 1, maxlength: 50 },
  isActive: { type: Boolean, default: true, required: false },
  profileName: { type: String, required: false, minlength: 5, maxlength: 50 },
  password: { type: String, required: false, minlength: 5, maxlength: 255 },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, required: false, unique: true, sparse: true },
});
