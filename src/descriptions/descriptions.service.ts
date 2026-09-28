import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Body, httpError, joiValidate, toPlain } from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import { deleteImagesReferencedBy } from '../uploads/upload-files.js';
import {
  DESCRIPTION_MODEL,
  createDescriptionJoiSchema,
  entityQueryJoiSchema,
  updateDescriptionJoiSchema,
} from './description.schema.js';

function toResponse(doc: unknown): Body {
  const plain = toPlain(doc);
  return { id: plain._id, ...plain, _id: plain._id };
}

function entityFilter(query: Body): Body {
  const { entity_id, entity } = query;
  joiValidate(entityQueryJoiSchema, { entity_id, entity });
  return { 'for.entity': entity, 'for.entity_id': entity_id };
}

@Injectable()
export class DescriptionsService {
  constructor(
    @InjectModel(DESCRIPTION_MODEL) private readonly descriptions: AnyModel,
  ) {}

  async findByEntity(query: Body) {
    const descriptions = await this.descriptions.find(entityFilter(query));
    return descriptions.map(toResponse);
  }

  async create(body: Body) {
    const { _id, id, for: forEntity, body: content } = body;
    const payload = { _id: _id || id, for: forEntity, body: content };
    joiValidate(createDescriptionJoiSchema, payload);

    const description = await this.descriptions.findOneAndUpdate(
      {
        'for.entity': payload.for.entity,
        'for.entity_id': payload.for.entity_id,
      },
      { $setOnInsert: payload },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    if (!description) {
      throw httpError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
    return toResponse(description);
  }

  async update(id: string, body: Body) {
    joiValidate(updateDescriptionJoiSchema, body);
    const description = await this.descriptions.findByIdAndUpdate(
      id,
      { $set: body },
      { returnDocument: 'after' },
    );
    if (!description) {
      throw httpError(HttpStatus.NOT_FOUND, 'Description not found');
    }
    return toResponse(description);
  }

  async removeByEntity(query: Body) {
    const filter = entityFilter(query);
    const toDelete = await this.descriptions.find(filter).lean();
    await deleteImagesReferencedBy(toDelete.map((d) => d.body));
    const result = await this.descriptions.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }

  async remove(id: string) {
    const description = await this.descriptions.findById(id);
    if (!description) {
      throw httpError(HttpStatus.NOT_FOUND, 'Description not found');
    }
    const data = description.toObject();
    await deleteImagesReferencedBy([data.body]);
    await description.deleteOne();
    return toResponse(data);
  }
}
