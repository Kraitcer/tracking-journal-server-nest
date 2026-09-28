import Joi from 'joi';
import { Schema } from 'mongoose';

export const JOURNAL_MODEL = 'journal';

const PAGE_TYPES = [
  'morningPage',
  'eveningPage',
  'planningNextWeek',
  'weekInReviewPage',
  'freeDayMorning',
  'freeDayEvening',
];

export const JournalSchema = new Schema(
  {
    _id: { type: String, required: true },
    journal_id: { type: String, required: false },
    user_id: { type: String, required: false },
    free_days: { type: [Number], required: false },
    journal_pages: {
      type: [
        {
          date: { type: String, required: true },
          page_id: { type: String },
          page: { type: String, enum: PAGE_TYPES },
          navigation: {
            type: String,
            enum: ['previousPage', 'currentPage', 'nextPage', ''],
          },
        },
      ],
    },
    start_date: { type: String },
    end_date: { type: String },
  },
  { timestamps: true },
);

export const journalJoiSchema = Joi.object({
  _id: Joi.string().required(),
  journal_id: Joi.string().optional().allow(''),
  user_id: Joi.string().optional().allow(''),
  start_date: Joi.date().optional().allow(''),
  free_days: Joi.array().items(Joi.number()).optional(),
  journal_pages: Joi.array().items(
    Joi.object({
      date: Joi.string().required(),
      page_id: Joi.string().optional().allow(''),
      page: Joi.string()
        .valid(...PAGE_TYPES)
        .optional(),
      navigation: Joi.string()
        .valid('previousPage', 'currentPage', 'nextPage')
        .optional()
        .allow(''),
    }),
  ),
  end_date: Joi.date().min('now').optional().allow(''),
});
