import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import {
  type Body,
  httpError,
  joiValidate,
  toPlain,
  withoutUndefined,
} from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import {
  MORNING_PAGE_MODEL,
  morningPageJoiSchema,
} from './morning-page.schema.js';

function mapFields(body: Body): Body {
  const {
    id,
    _id,
    user_id,
    journal_id,
    pageDate,
    display,
    finalized,
    selectedProject,
    selectedGoal,
    wakeUpTime,
    wokeUpEnergized,
    hungryForAction,
    hungryForActions,
    sleeprRating,
    todayProjectsAndGoals,
  } = body;

  const mapped: Body = {
    _id: id ?? _id,
    user_id,
    journal_id,
    pageDate,
    display,
    finalized,
    selectedProject,
    selectedGoal,
    wakeUpTime,
    wokeUpEnergized,
    hungryForAction: hungryForAction ?? hungryForActions,
    sleeprRating,
  };
  if (todayProjectsAndGoals !== undefined) {
    mapped.todayProjectsAndGoals = todayProjectsAndGoals;
  }
  return mapped;
}

function toResponse(page: unknown): Body | null {
  if (!page) return null;
  const { _id, hungryForAction, ...rest } = toPlain(page);
  return {
    id: _id,
    ...rest,
    hungryForActions: hungryForAction,
    todayProjectsAndGoals: rest.todayProjectsAndGoals ?? [],
  };
}

@Injectable()
export class MorningPagesService {
  constructor(
    @InjectModel(MORNING_PAGE_MODEL) private readonly pages: AnyModel,
  ) {}

  create(body: Body) {
    const payload = mapFields(body);
    joiValidate(morningPageJoiSchema, payload);
    return new this.pages(payload).save();
  }

  async findByJournal(journalId: string) {
    const pages = await this.pages
      .find({ journal_id: journalId })
      .sort('-createdAt')
      .lean();
    return pages.map(toResponse);
  }

  async findByUser(userId: string) {
    const pages = await this.pages
      .find({ user_id: userId })
      .sort('pageDate')
      .lean();
    return pages.map(toResponse);
  }

  async findTodayByJournal(journalId: string) {
    const page = await this.pages.findOne({
      journal_id: journalId,
      createdAt: {
        $gte: DateTime.local().startOf('day').toJSDate(),
        $lte: DateTime.local().endOf('day').toJSDate(),
      },
    });
    if (!page) {
      throw httpError(HttpStatus.NOT_FOUND, 'Morning page for today not found');
    }
    return toResponse(page);
  }

  async update(id: string, body: Body) {
    const { _id, ...payload } = mapFields({ ...body, id });
    const page = await this.pages.findByIdAndUpdate(
      _id,
      withoutUndefined(payload),
      { returnDocument: 'after', runValidators: true },
    );
    if (!page) throw httpError(HttpStatus.NOT_FOUND, 'Morning page not found');
    return toResponse(page);
  }

  async remove(id: string) {
    const page = await this.pages.findByIdAndDelete(id);
    if (!page) throw httpError(HttpStatus.NOT_FOUND, 'Morning page not found');
    return { id };
  }
}
