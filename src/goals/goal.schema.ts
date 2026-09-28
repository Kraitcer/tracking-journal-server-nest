import Joi from 'joi';
import { Schema } from 'mongoose';

export const GOAL_MODEL = 'goal';

export const GoalSchema = new Schema({
  _id: { type: String, required: false },
  goalName: { type: String, required: false },
  currentProjectID: { type: String, ref: 'project' },
  description: { type: String, required: false },
  priority: { type: Number, required: false, default: 0 },
  status: { type: String, enum: ['queue', 'development', 'done'] },
  padMode: {
    type: String,
    required: false,
    enum: [
      'subtasks',
      'setGoalName',
      'setProjectName',
      'setDeadLine',
      'setExecutionTime',
      'smart',
      'morningPageMain',
      'goalsPageMain',
    ],
    default: 'goalsPageMain',
  },
  subTasks: { type: Number, required: false, default: 0 },
  creationDate: { type: String, required: false },
  timeSpent: { type: String, required: false },
  dueDate: { type: String, required: false },
});

export const goalJoiSchema = Joi.object({
  _id: Joi.string().allow(''),
  goalName: Joi.string().allow(''),
  currentProjectID: Joi.string().allow(''),
  description: Joi.string().allow(''),
  status: Joi.string(),
  padMode: Joi.string().allow(''),
  priority: Joi.number(),
  creationDate: Joi.string().allow(''),
  timeSpent: Joi.string().allow(''),
  dueDate: Joi.string().allow(''),
});
