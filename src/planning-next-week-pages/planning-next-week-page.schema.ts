import Joi from 'joi';
import { Schema } from 'mongoose';

export const PLANNING_NEXT_WEEK_PAGE_MODEL = 'planningNextWeekPage';

const ProjectItemSchema = new Schema(
  {
    project_id: { type: String, required: true },
    FETUSIndex: {
      FETUS: { type: Number, required: false },
      fun: { type: Number, required: false },
      effect: { type: Number, required: false },
      time: { type: Number, required: false },
      urgency: { type: Number, required: false },
      strategy: { type: Number, required: false },
      bonus: { type: Number, required: false },
      total: { type: Number, required: false },
    },
  },
  { _id: false },
);

const HabitItemSchema = new Schema(
  {
    habit_id: { type: String, required: true },
    detailsType: { type: String, enum: ['trigger', 'blocker'], required: true },
    details: { type: String, required: false },
  },
  { _id: false },
);

export const PlanningNextWeekPageSchema = new Schema(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: true },
    journal_id: { type: String, required: false },
    pageDate: { type: String, required: false },
    isEditing: {
      type: String,
      enum: ['editing', 'finalized'],
      default: 'editing',
    },
    layouts: {
      good_habits: {
        type: String,
        enum: ['triggers', 'trigger one good habit'],
        required: true,
      },
      bad_habits: {
        type: String,
        enum: ['blockers', 'block one bad habit'],
        required: true,
      },
    },
    habits: { type: [HabitItemSchema], default: [] },
    projects: { type: [ProjectItemSchema], default: [] },
  },
  { timestamps: true, collection: 'planningNextWeekPages' },
);

export const planningNextWeekPageJoiSchema = Joi.object({
  _id: Joi.string().required(),
  user_id: Joi.string().required(),
  journal_id: Joi.string().optional().allow(''),
  pageDate: Joi.string().optional().allow(''),
  isEditing: Joi.string().valid('editing', 'finalized').optional(),
  layouts: Joi.object({
    good_habits: Joi.string()
      .valid('triggers', 'trigger one good habit')
      .required(),
    bad_habits: Joi.string()
      .valid('blockers', 'block one bad habit')
      .required(),
  }).optional(),
  habits: Joi.array()
    .items(
      Joi.object({
        habit_id: Joi.string().required(),
        detailsType: Joi.string().valid('trigger', 'blocker').required(),
        details: Joi.string().optional().allow(''),
      }),
    )
    .optional(),
  projects: Joi.array()
    .items(
      Joi.object({
        project_id: Joi.string().required(),
        FETUSIndex: Joi.object({
          FETUS: Joi.number().optional(),
          fun: Joi.number().optional(),
          effect: Joi.number().optional(),
          time: Joi.number().optional(),
          urgency: Joi.number().optional(),
          strategy: Joi.number().optional(),
          bonus: Joi.number().optional(),
          total: Joi.number().optional(),
        }).optional(),
      }),
    )
    .optional(),
});
