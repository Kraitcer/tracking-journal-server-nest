import Joi from 'joi';
import { Schema } from 'mongoose';

export const FREE_DAY_MODEL = 'freeDay';

export const FreeDaySchema = new Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: false },
  journal_id: { type: String, required: false },
  pageDate: { type: String, required: false },
  morningPages: { type: String, required: false },
  eveningPages: { type: String, required: false },
});

export const freeDayJoiSchema = Joi.object({
  _id: Joi.string().required(),
  user_id: Joi.string().allow('').optional(),
  journal_id: Joi.string().allow('').optional(),
  pageDate: Joi.string().allow('').optional(),
  morningPages: Joi.string().allow('').optional(),
  eveningPages: Joi.string().allow('').optional(),
});
