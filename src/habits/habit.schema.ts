import Joi from 'joi';
import { Schema } from 'mongoose';

export const HABIT_MODEL = 'habit';

export const HabitSchema = new Schema(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: false },
    name: { type: String, required: false },
    direction: { type: String, enum: ['bad', 'good'], required: false },
    type: {
      type: String,
      enum: ['health', 'emotions', 'intellect'],
      required: false,
    },
    status: {
      type: String,
      enum: ['established', 'building', 'desired'],
      required: false,
    },
  },
  { timestamps: true },
);

export const habitJoiSchema = Joi.object({
  _id: Joi.string().optional().allow(''),
  user_id: Joi.string().optional().allow(''),
  name: Joi.string().optional().allow(''),
  type: Joi.string().valid('health', 'emotions', 'intellect').optional(),
  direction: Joi.string().valid('bad', 'good').optional(),
  status: Joi.string().valid('established', 'building', 'desired').optional(),
});
