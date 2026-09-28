import Joi from 'joi';
import { Schema } from 'mongoose';

export const EVENING_PAGE_MODEL = 'eveningPages';

export const EveningPageSchema = new Schema(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: false },
    pageDate: { type: String, required: false },
    layouts: {
      goals: { type: String, required: false },
      habits: { type: String, required: false },
    },
    isEditing: {
      type: String,
      enum: ['editing', 'finalized'],
      default: 'editing',
      required: false,
    },
    allGoals: { type: Array, required: false },
    journal_id: { type: String, required: false },
    todayGoals: {
      type: [
        {
          goal_id: String,
          completionPercentage: Number,
          name: String,
          scheduledStart: String,
          progress: Number,
          status: {
            type: String,
            enum: ['planned', 'spontaneous'],
            required: false,
          },
        },
      ],
      required: false,
    },
    todaysTasks: { type: [String], required: false },
    gratefulness: {
      type: [
        new Schema(
          { gratefulFor: { type: String }, type: { type: String } },
          { _id: false },
        ),
      ],
      required: false,
    },
    voteCast: {
      type: [{ habit_id: String, improvement: String, details: String }],
      required: false,
    },
    yourEngine: {
      health: { type: Number, required: true, min: 1, max: 5 },
      emotions: { type: Number, required: true, min: 1, max: 5 },
      intellect: { type: Number, required: true, min: 1, max: 5 },
    },
    badTime: { type: String, required: false },
  },
  { timestamps: true, collection: 'eveningPages' },
);

export const eveningPageJoiSchema = Joi.object({
  _id: Joi.string().optional().allow(''),
  journal_id: Joi.string().optional().allow(''),
  user_id: Joi.string().optional().allow(''),
  pageDate: Joi.string().optional().allow(''),
  layouts: Joi.object({
    goals: Joi.string().optional().allow(''),
    habits: Joi.string().optional().allow(''),
  }).optional(),
  isEditing: Joi.string().valid('editing', 'finalized').optional(),
  allGoals: Joi.array().optional(),
  createdAt: Joi.string().optional().allow(''),
  todayGoals: Joi.array()
    .items(
      Joi.object({
        goal_id: Joi.string().optional().allow(''),
        completionPercentage: Joi.number().optional(),
        name: Joi.string().optional().allow(''),
        scheduledStart: Joi.string().optional().allow(''),
        progress: Joi.number().optional(),
        status: Joi.string().valid('planned', 'spontaneous').optional(),
      }),
    )
    .optional(),
  todaysTasks: Joi.array().items(Joi.string()).optional(),
  gratefulness: Joi.array()
    .items(
      Joi.object({
        gratefulFor: Joi.string().required(),
        type: Joi.string().required(),
      }),
    )
    .optional(),
  voteCast: Joi.array()
    .items(
      Joi.object({
        habit_id: Joi.string().required(),
        improvement: Joi.string().required(),
        details: Joi.string().optional(),
      }),
    )
    .optional(),
  yourEngine: Joi.object({
    health: Joi.number().integer().min(1).max(5).required(),
    emotions: Joi.number().integer().min(1).max(5).required(),
    intellect: Joi.number().integer().min(1).max(5).required(),
  }).required(),
  badTime: Joi.string().optional().allow(''),
});
