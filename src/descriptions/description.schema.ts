import Joi from 'joi';
import { Schema } from 'mongoose';

export const DESCRIPTION_MODEL = 'descriptions';

const ENTITIES = ['project', 'goal', 'task', 'subTask', 'habit'];

export const DescriptionSchema = new Schema({
  _id: { type: String, required: false },
  for: {
    entity: { type: String, enum: ENTITIES, required: true },
    entity_id: { type: String, required: true },
  },
  body: { type: [Schema.Types.Mixed], required: true, default: [] },
});

DescriptionSchema.index(
  { 'for.entity': 1, 'for.entity_id': 1 },
  { unique: true },
);

const bodyItems = Joi.array()
  .items(Joi.object({ type: Joi.string().required() }).unknown(true))
  .required();

export const createDescriptionJoiSchema = Joi.object({
  _id: Joi.string(),
  for: Joi.object({
    entity: Joi.string()
      .valid(...ENTITIES)
      .required(),
    entity_id: Joi.string().required(),
  }).required(),
  body: bodyItems,
});

export const updateDescriptionJoiSchema = Joi.object({
  for: Joi.object({
    entity: Joi.string().valid(...ENTITIES),
    entity_id: Joi.string(),
  }),
  body: bodyItems,
});

export const entityQueryJoiSchema = Joi.object({
  entity_id: Joi.string().required(),
  entity: Joi.string()
    .valid(...ENTITIES)
    .required(),
});
