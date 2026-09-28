import Joi from 'joi';
import { Schema } from 'mongoose';

export const MORNING_PAGE_MODEL = 'morningPage';

const TodayProjectSchema = new Schema(
  {
    id: { type: String, required: false },
    goals: { type: [String], default: [] },
  },
  { _id: false },
);

export const MorningPageSchema = new Schema(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: false },
    journal_id: { type: String, required: false },
    pageDate: { type: String, required: false },
    display: { type: String, required: false },
    finalized: { type: Boolean, required: false, default: false },
    selectedProject: { type: String, required: false },
    selectedGoal: { type: String, required: false },
    wakeUpTime: { type: String, required: false },
    wokeUpEnergized: { type: Boolean, required: false, default: false },
    hungryForAction: { type: Boolean, required: false, default: false },
    sleeprRating: { type: Number, required: true, min: 1, max: 5 },
    todayProjectsAndGoals: { type: [TodayProjectSchema], default: [] },
  },
  { timestamps: true, collection: 'morningPages' },
);

export const morningPageJoiSchema = Joi.object({
  _id: Joi.string().optional().allow(''),
  user_id: Joi.string().optional().allow(''),
  journal_id: Joi.string().optional().allow(''),
  pageDate: Joi.string().optional().allow(''),
  display: Joi.string().optional().allow(''),
  finalized: Joi.boolean().optional(),
  selectedProject: Joi.string().optional().allow(''),
  selectedGoal: Joi.string().optional().allow(''),
  wakeUpTime: Joi.string().optional().allow(''),
  wokeUpEnergized: Joi.boolean().optional(),
  hungryForAction: Joi.boolean().optional(),
  sleeprRating: Joi.number().integer().min(1).max(5).required(),
  todayProjectsAndGoals: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().optional().allow(''),
        goals: Joi.array().items(Joi.string()).optional(),
      }),
    )
    .optional()
    .default([]),
});
