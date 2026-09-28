import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  type Body,
  httpError,
  joiValidate,
  withIdField,
  withoutUndefined,
} from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import {
  EVENING_PAGE_MODEL,
  eveningPageJoiSchema,
} from './evening-page.schema.js';

@Injectable()
export class EveningPagesService {
  constructor(
    @InjectModel(EVENING_PAGE_MODEL) private readonly pages: AnyModel,
  ) {}

  async create(body: Body) {
    const { id, ...rest } = body;
    const payload = { _id: id, ...rest };
    joiValidate(eveningPageJoiSchema, payload);
    const page = await new this.pages(payload).save();
    return withIdField(page);
  }

  async findByUser(userId: string | undefined) {
    if (!userId) {
      throw httpError(
        HttpStatus.BAD_REQUEST,
        'user_id query parameter is required',
      );
    }
    const pages = await this.pages.find({ user_id: userId }).lean();
    return pages.map(withIdField);
  }

  async findByJournal(journalId: string) {
    const pages = await this.pages.find({ journal_id: journalId }).lean();
    return pages.map(withIdField);
  }

  async update(id: string, body: Body) {
    const changes = withoutUndefined(body);
    delete changes.id;
    delete changes._id;

    const page = await this.pages.findByIdAndUpdate(
      id,
      { $set: changes },
      { returnDocument: 'after', runValidators: true, context: 'query' },
    );
    if (!page) throw httpError(HttpStatus.NOT_FOUND, 'Evening page not found');
    return withIdField(page);
  }
}
