import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import {
  DESCRIPTION_MODEL,
  DescriptionSchema,
} from '../descriptions/description.schema.js';
import {
  EVENING_PAGE_MODEL,
  EveningPageSchema,
} from '../evening-pages/evening-page.schema.js';
import { FREE_DAY_MODEL, FreeDaySchema } from '../free-days/free-day.schema.js';
import { GOAL_MODEL, GoalSchema } from '../goals/goal.schema.js';
import { HABIT_MODEL, HabitSchema } from '../habits/habit.schema.js';
import { JOURNAL_MODEL, JournalSchema } from '../journals/journal.schema.js';
import {
  MORNING_PAGE_MODEL,
  MorningPageSchema,
} from '../morning-pages/morning-page.schema.js';
import {
  PLANNING_NEXT_WEEK_PAGE_MODEL,
  PlanningNextWeekPageSchema,
} from '../planning-next-week-pages/planning-next-week-page.schema.js';
import {
  FETUS_MODEL,
  FetusSchema,
  PROJECT_MODEL,
  ProjectSchema,
} from '../projects/project.schema.js';
import { SUB_TASK_MODEL, SubTaskSchema } from '../sub-tasks/sub-task.schema.js';
import { TASK_MODEL, TaskSchema } from '../tasks/task.schema.js';
import { USER_MODEL, UserSchema } from '../users/schemas/user.schema.js';
import {
  WEEK_IN_REVIEW_PAGE_MODEL,
  WeekInReviewPageSchema,
} from '../week-in-review-pages/week-in-review-page.schema.js';

// Schemas are dynamic (Joi-validated payloads), so models are intentionally loosely typed.
export type AnyModel = Model<any>;

const models = MongooseModule.forFeature([
  { name: USER_MODEL, schema: UserSchema, collection: 'users' },
  { name: JOURNAL_MODEL, schema: JournalSchema, collection: 'journals' },
  { name: HABIT_MODEL, schema: HabitSchema, collection: 'habits' },
  {
    name: MORNING_PAGE_MODEL,
    schema: MorningPageSchema,
    collection: 'morningPages',
  },
  {
    name: EVENING_PAGE_MODEL,
    schema: EveningPageSchema,
    collection: 'eveningPages',
  },
  { name: PROJECT_MODEL, schema: ProjectSchema, collection: 'projects' },
  { name: FETUS_MODEL, schema: FetusSchema, collection: 'FETUS' },
  {
    name: DESCRIPTION_MODEL,
    schema: DescriptionSchema,
    collection: 'descriptions',
  },
  { name: GOAL_MODEL, schema: GoalSchema, collection: 'goals' },
  { name: TASK_MODEL, schema: TaskSchema, collection: 'tasks' },
  { name: SUB_TASK_MODEL, schema: SubTaskSchema, collection: 'subTasks' },
  {
    name: WEEK_IN_REVIEW_PAGE_MODEL,
    schema: WeekInReviewPageSchema,
    collection: 'weekInReviewPages',
  },
  {
    name: PLANNING_NEXT_WEEK_PAGE_MODEL,
    schema: PlanningNextWeekPageSchema,
    collection: 'planningNextWeekPages',
  },
  { name: FREE_DAY_MODEL, schema: FreeDaySchema, collection: 'freedays' },
]);

@Global()
@Module({
  imports: [models],
  exports: [models],
})
export class DatabaseModule {}
