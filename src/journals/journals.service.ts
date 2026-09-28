import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Body, httpError, joiValidate } from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import { EVENING_PAGE_MODEL } from '../evening-pages/evening-page.schema.js';
import { FREE_DAY_MODEL } from '../free-days/free-day.schema.js';
import { MORNING_PAGE_MODEL } from '../morning-pages/morning-page.schema.js';
import { PLANNING_NEXT_WEEK_PAGE_MODEL } from '../planning-next-week-pages/planning-next-week-page.schema.js';
import { WEEK_IN_REVIEW_PAGE_MODEL } from '../week-in-review-pages/week-in-review-page.schema.js';
import { JOURNAL_MODEL, journalJoiSchema } from './journal.schema.js';

function mapJournal(journal: Body): Body {
  const { id, journal_footer, journal_pages, padMode, ...rest } = journal;
  return { _id: id, ...rest, journal_pages };
}

function toResponse(journal: Body): Body {
  const { _id, ...rest } = journal;
  return { id: _id, padMode: 'mainPad', ...rest };
}

const NAVIGATION_VALUES = ['previousPage', 'nextPage', ''];

@Injectable()
export class JournalsService {
  constructor(
    @InjectModel(JOURNAL_MODEL) private readonly journals: AnyModel,
    @InjectModel(MORNING_PAGE_MODEL) private readonly morningPages: AnyModel,
    @InjectModel(EVENING_PAGE_MODEL) private readonly eveningPages: AnyModel,
    @InjectModel(PLANNING_NEXT_WEEK_PAGE_MODEL)
    private readonly planningNextWeekPages: AnyModel,
    @InjectModel(WEEK_IN_REVIEW_PAGE_MODEL)
    private readonly weekInReviewPages: AnyModel,
    @InjectModel(FREE_DAY_MODEL) private readonly freeDays: AnyModel,
  ) {}

  create(body: Body) {
    const payload = mapJournal(body);
    joiValidate(journalJoiSchema, payload);
    return new this.journals(payload).save();
  }

  async findByUser(userId: string) {
    const journals = await this.journals.find({ user_id: userId }).lean();
    return journals.map((journal) => toResponse(journal));
  }

  async updateFreeDays(id: string, body: Body) {
    if (!Array.isArray(body.free_days)) {
      throw httpError(HttpStatus.BAD_REQUEST, 'free_days must be an array');
    }
    const journal = await this.journals.findByIdAndUpdate(
      id,
      { $set: { free_days: body.free_days } },
      { returnDocument: 'after' },
    );
    if (!journal) throw httpError(HttpStatus.NOT_FOUND, 'Journal not found');
    return journal;
  }

  async updatePageId(id: string, body: Body) {
    const { date, page, page_id } = body;
    if (!date || !page || !page_id) {
      throw httpError(
        HttpStatus.BAD_REQUEST,
        'date, page and page_id are required',
      );
    }
    const journal = await this.journals
      .findOneAndUpdate(
        { _id: id, journal_pages: { $elemMatch: { date, page } } },
        { $set: { 'journal_pages.$.page_id': page_id } },
        { returnDocument: 'after' },
      )
      .lean();
    if (!journal) {
      throw httpError(HttpStatus.NOT_FOUND, 'Journal page not found');
    }
    return toResponse(journal);
  }

  async updatePage(id: string, body: Body) {
    const { date, page, page_id, navigation } = body;
    if (!date || !page) {
      throw httpError(HttpStatus.BAD_REQUEST, 'date and page are required');
    }

    const journal = await this.journals.findById(id);
    if (!journal) throw httpError(HttpStatus.NOT_FOUND, 'Journal not found');

    const pages: Body[] = journal.journal_pages;
    // date+page is unique per entry; page_id can be shared (free day pair), so it must not take priority.
    const index = pages.findIndex((p) => p.date === date && p.page === page);
    if (index === -1) {
      throw httpError(HttpStatus.NOT_FOUND, 'Journal page not found');
    }

    if (page_id !== undefined) {
      pages[index].page_id = page_id;
    }

    if (navigation === 'currentPage') {
      pages.forEach((p) => {
        p.navigation = '';
      });
      if (pages[index - 1]) pages[index - 1].navigation = 'previousPage';
      pages[index].navigation = 'currentPage';
      if (pages[index + 1]) pages[index + 1].navigation = 'nextPage';
    } else if (NAVIGATION_VALUES.includes(navigation)) {
      pages[index].navigation = navigation;
    }

    await journal.save();
    return toResponse(journal.toObject());
  }

  async update(id: string, body: Body) {
    const payload = mapJournal(body);
    joiValidate(journalJoiSchema, payload);
    const journal = await this.journals.findByIdAndUpdate(id, payload, {
      returnDocument: 'after',
    });
    if (!journal) throw httpError(HttpStatus.NOT_FOUND, 'Journal not found');
    return journal;
  }

  async remove(id: string) {
    const journal = await this.journals.findById(id);
    if (!journal) throw httpError(HttpStatus.NOT_FOUND, 'Journal not found');

    const filter = { journal_id: id };
    const [morning, evening, planning, review, free] = await Promise.all([
      this.morningPages.deleteMany(filter),
      this.eveningPages.deleteMany(filter),
      this.planningNextWeekPages.deleteMany(filter),
      this.weekInReviewPages.deleteMany(filter),
      this.freeDays.deleteMany(filter),
    ]);

    await this.journals.findByIdAndDelete(id);

    return {
      id,
      deleted: {
        journals: 1,
        morningPages: morning.deletedCount,
        eveningPages: evening.deletedCount,
        planningNextWeekPages: planning.deletedCount,
        weekInReviewPages: review.deletedCount,
        freeDays: free.deletedCount,
      },
    };
  }
}
