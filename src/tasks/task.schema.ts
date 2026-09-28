import Joi from 'joi';
import { Schema } from 'mongoose';

export const TASK_MODEL = 'task';

export const TaskSchema = new Schema({
  _id: { type: String, required: false },
  taskName: { type: String, default: '' },
  goal_id: { type: String, ref: 'goal' },
  project_id: { type: String, ref: 'project' },
  description: { type: String, default: '' },
  isEditing: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
});

export const taskJoiSchema = Joi.object({
  _id: Joi.string().allow(''),
  id: Joi.string().allow(''),
  taskName: Joi.string().allow(''),
  goal_id: Joi.string().allow(''),
  project_id: Joi.string().allow(''),
  description: Joi.string().allow(''),
  isEditing: Joi.boolean(),
  completed: Joi.boolean(),
});
