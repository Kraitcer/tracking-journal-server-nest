import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { httpError } from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import { GOAL_MODEL } from '../goals/goal.schema.js';
import { HABIT_MODEL } from '../habits/habit.schema.js';
import { PROJECT_MODEL } from '../projects/project.schema.js';

@Controller('mainBord')
export class MainBordController {
  constructor(
    @InjectModel(PROJECT_MODEL) private readonly projects: AnyModel,
    @InjectModel(GOAL_MODEL) private readonly goals: AnyModel,
    @InjectModel(HABIT_MODEL) private readonly habits: AnyModel,
  ) {}

  @Get(':user_id')
  async getSummary(@Param('user_id') user_id: string) {
    try {
      const projects = await this.projects.find({ user_id }).select('_id');
      const projectIds = projects.map((project) => project._id);
      const inProjects = { currentProjectID: { $in: projectIds } };

      const [
        goodHabits,
        badHabits,
        completeProjects,
        incompleteProjects,
        queueTasksCount,
        developmentTasksCount,
        doneTasksCount,
      ] = await Promise.all([
        this.habits.countDocuments({ user_id, direction: 'good' }),
        this.habits.countDocuments({ user_id, direction: 'bad' }),
        this.projects.countDocuments({ user_id, completed: true }),
        this.projects.countDocuments({ user_id, completed: false }),
        this.goals.countDocuments({ ...inProjects, status: 'queue' }),
        this.goals.countDocuments({ ...inProjects, status: 'development' }),
        this.goals.countDocuments({ ...inProjects, status: 'done' }),
      ]);

      return {
        totalProjects: projectIds.length,
        completeProjects,
        incompleteProjects,
        queueTasksCount,
        developmentTasksCount,
        doneTasksCount,
        goodHabits,
        badHabits,
      };
    } catch (err) {
      console.error('Проблема в GET модуля LOGIN', err);
      throw httpError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Проблема в GET модуля LOGIN',
      );
    }
  }
}
