import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Body, httpError, joiValidate } from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import { HABIT_MODEL, habitJoiSchema } from './habit.schema.js';

function mapHabitFields(body: Body): Body {
  const { id, user_id, name, direction, status, type } = body;
  return { _id: id, user_id, name, direction, status, type };
}

@Injectable()
export class HabitsService {
  constructor(@InjectModel(HABIT_MODEL) private readonly habits: AnyModel) {}

  create(body: Body) {
    const payload = mapHabitFields(body);
    joiValidate(habitJoiSchema, payload);
    return new this.habits(payload).save();
  }

  async findByUser(userId: string) {
    const habits = await this.habits
      .find({ user_id: userId })
      .sort('habit_Name');
    return habits.map(({ _id, user_id, name, direction, status }) => ({
      id: _id,
      user_id,
      name,
      direction,
      status,
    }));
  }

  async update(id: string, body: Body) {
    const payload = mapHabitFields(body);
    joiValidate(habitJoiSchema, payload);
    // Returns the document before the update, as the old server did.
    const habit = await this.habits.findByIdAndUpdate(id, payload);
    if (!habit) {
      throw httpError(HttpStatus.NOT_FOUND, "Can't store the habit...");
    }
    return habit;
  }

  async remove(id: string) {
    const habit = await this.habits.findByIdAndDelete(id);
    if (!habit) {
      throw httpError(HttpStatus.NOT_FOUND, "Can't delete the habit...");
    }
    return habit;
  }
}
