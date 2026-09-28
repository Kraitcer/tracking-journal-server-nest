import Joi from 'joi';
import { Schema } from 'mongoose';

export const SUB_TASK_MODEL = 'subTask';

export const SubTaskSchema = new Schema({
  _id: { type: String, required: false },
  subTaskName: { type: String },
  goal_id: { type: String, ref: 'goal' },
  task_id: { type: String, ref: 'task' },
  project_id: { type: String, ref: 'project' },
  description: { type: String, default: '' },
  padMode: { type: String, default: 'main' },
  completed: { type: Boolean, default: false },
});

export const subTaskJoiSchema = Joi.object({
  _id: Joi.string().allow(''),
  subTaskName: Joi.string().allow(''),
  task_id: Joi.string().allow(''),
  goal_id: Joi.string().allow(''),
  padMode: Joi.string().allow(''),
  project_id: Joi.string().allow(''),
  description: Joi.string().allow(''),
  completed: Joi.boolean(),
});
