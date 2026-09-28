import { HttpStatus } from '@nestjs/common';
import type Joi from 'joi';
import type { AnyModel } from '../database/database.module.js';
import {
  type Body,
  httpError,
  joiValidate,
  modelFromBody,
  withIdField,
  withoutUndefined,
} from './http.js';

export abstract class JournalPageService {
  protected constructor(
    protected readonly model: AnyModel,
    private readonly joiSchema: Joi.Schema,
    private readonly notFoundMessage: string,
  ) {}

  async findByUser(userId: string | undefined) {
    if (!userId) {
      throw httpError(
        HttpStatus.BAD_REQUEST,
        'user_id query parameter is required',
      );
    }
    const pages = await this.model.find({ user_id: userId }).lean();
    return pages.map(withIdField);
  }

  async findByJournal(journalId: string) {
    const pages = await this.model.find({ journal_id: journalId }).lean();
    return pages.map(withIdField);
  }

  async create(body: Body) {
    const payload = modelFromBody(body);
    joiValidate(this.joiSchema, payload);
    const page = await new this.model(payload).save();
    return withIdField(page);
  }

  async update(id: string, body: Body) {
    const changes = withoutUndefined(body);
    delete changes.id;
    delete changes._id;

    const page = await this.model.findByIdAndUpdate(
      id,
      { $set: changes },
      { returnDocument: 'after', runValidators: true },
    );
    if (!page) throw httpError(HttpStatus.NOT_FOUND, this.notFoundMessage);
    return withIdField(page);
  }

  async remove(id: string): Promise<void> {
    const page = await this.model.findByIdAndDelete(id);
    if (!page) throw httpError(HttpStatus.NOT_FOUND, this.notFoundMessage);
  }

  async removeByJournal(journalId: string): Promise<void> {
    await this.model.deleteMany({ journal_id: journalId });
  }
}
