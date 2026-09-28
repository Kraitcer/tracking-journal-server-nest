import Joi from 'joi';
import { Schema } from 'mongoose';

export const PROJECT_MODEL = 'projects';
export const FETUS_MODEL = 'FETUSes';

export const ProjectSchema = new Schema({
  _id: { type: String, required: false },
  user_id: { type: String },
  projectName: { type: String, required: true },
  date_created: { type: String, required: false },
  description: { type: String, required: false },
  completed: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
  fetusIndex: {
    fun: { type: Number, default: 0, max: 10 },
    effect: { type: Number, default: 0, max: 10 },
    time: { type: Number, default: 0, max: 10 },
    urgency: { type: Number, default: 0, max: 10 },
    strategy: { type: Number, default: 0, max: 10 },
    bonus: { type: Number, min: 3, max: 5 },
    total: { type: Number, default: 0, max: 100 },
  },
});

export const projectJoiSchema = Joi.object({
  _id: Joi.string().min(3).required(),
  user_id: Joi.string().allow(''),
  projectName: Joi.string().allow(''),
  date_created: Joi.string(),
  description: Joi.string().allow(''),
  completed: Joi.boolean(),
  priority: Joi.number(),
  fetusIndex: Joi.object({
    fun: Joi.number().max(10),
    effect: Joi.number().max(10),
    time: Joi.number().max(10),
    urgency: Joi.number().max(10),
    strategy: Joi.number().max(10),
    bonus: Joi.number().min(3).max(5),
    total: Joi.number().max(100).required(),
  }),
});

export const FetusSchema = new Schema(
  {
    projectID: { type: String },
    fetusIndex: {
      fun: { type: Number, default: 0, max: 10 },
      effect: { type: Number, default: 0, max: 10 },
      time: { type: Number, default: 0, max: 10 },
      urgency: { type: Number, default: 0, max: 10 },
      strategy: { type: Number, default: 0, max: 10 },
      bonus: { type: Number, default: 0, max: 5 },
      total: { type: Number, default: 0, max: 100 },
    },
  },
  { timestamps: true },
);

export const fetusJoiSchema = Joi.object({
  projectID: Joi.string().required(),
  fetusIndex: Joi.object({
    fun: Joi.number().max(10),
    effect: Joi.number().max(10),
    time: Joi.number().max(10),
    urgency: Joi.number().max(10),
    strategy: Joi.number().max(10),
    bonus: Joi.number().min(0).max(5),
    total: Joi.number().max(100).required(),
  }),
});
