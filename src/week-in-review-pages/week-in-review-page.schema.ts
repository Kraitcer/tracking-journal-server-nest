import Joi from 'joi';
import { Schema } from 'mongoose';

export const WEEK_IN_REVIEW_PAGE_MODEL = 'weekInReviewPage';

export const WeekInReviewPageSchema = new Schema(
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
        enum: ['simplification', 'simplify one good habit'],
        required: true,
      },
      bad_habits: {
        type: String,
        enum: ['complication', 'complicate one bad habit'],
        required: true,
      },
    },
    projects: {
      type: [{ project_id: String, done: Number }],
      default: [],
    },
    habits: {
      type: [
        {
          habit_id: String,
          details: String,
          detailsType: {
            type: String,
            enum: ['simplification', 'complication'],
          },
        },
      ],
      default: [],
    },
    moreOrLess: {
      type: [
        {
          id: String,
          do: { type: String, enum: ['more', 'less'] },
          toDoWhat: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true, collection: 'weekInReviewPages' },
);

export const weekInReviewPageJoiSchema = Joi.object({
  _id: Joi.string().required(),
  user_id: Joi.string().required(),
  journal_id: Joi.string().optional().allow(''),
  pageDate: Joi.string().optional().allow(''),
  isEditing: Joi.string().valid('editing', 'finalized').optional(),
  layouts: Joi.object({
    good_habits: Joi.string()
      .valid('simplification', 'simplify one good habit')
      .required(),
    bad_habits: Joi.string()
      .valid('complication', 'complicate one bad habit')
      .required(),
  }).optional(),
  projects: Joi.array()
    .items(
      Joi.object({
        project_id: Joi.string().required(),
        done: Joi.number().required(),
      }),
    )
    .optional(),
  habits: Joi.array()
    .items(
      Joi.object({
        habit_id: Joi.string().required(),
        details: Joi.string().optional().allow(''),
        detailsType: Joi.string()
          .valid('simplification', 'complication')
          .optional(),
      }),
    )
    .optional(),
  moreOrLess: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        do: Joi.string().valid('more', 'less').required(),
        toDoWhat: Joi.string().optional().allow(''),
      }),
    )
    .optional(),
});
