import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Body, httpError, joiValidate } from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import { SUB_TASK_MODEL, subTaskJoiSchema } from './sub-task.schema.js';

const NOT_FOUND = 'Fucking fuck...';

@Injectable()
export class SubTasksService {
  constructor(
    @InjectModel(SUB_TASK_MODEL) private readonly subTasks: AnyModel,
  ) {}

  async findByGoal(goalId: string) {
    const subTasks = await this.subTasks.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: 'task_id',
          foreignField: '_id',
          as: 'task',
        },
      },
      { $unwind: '$task' },
      { $match: { 'task.goal_id': goalId } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          subTaskName: 1,
          task_id: 1,
          goal_id: 1,
          project_id: 1,
          description: { $ifNull: ['$description', ''] },
          completed: 1,
        },
      },
    ]);
    if (!subTasks.length) throw httpError(HttpStatus.NOT_FOUND, NOT_FOUND);
    return subTasks;
  }

  create(body: Body) {
    joiValidate(subTaskJoiSchema, body);
    return new this.subTasks({
      _id: body._id,
      subTaskName: body.subTaskName,
      task_id: body.task_id,
      goal_id: body.goal_id,
      project_id: body.project_id,
      description: body.description,
    }).save();
  }

  async update(id: string, body: Body) {
    joiValidate(subTaskJoiSchema, body);
    const subTask = await this.subTasks.findByIdAndUpdate(
      id,
      {
        subTaskName: body.subTaskName,
        task_id: body.task_id,
        goal_id: body.goal_id,
        project_id: body.project_id,
        description: body.description,
        completed: body.completed,
      },
      { returnDocument: 'after' },
    );
    if (!subTask) throw httpError(HttpStatus.NOT_FOUND, NOT_FOUND);
    return subTask;
  }

  async remove(id: string) {
    const subTask = await this.subTasks.findByIdAndDelete(id);
    if (!subTask) throw httpError(HttpStatus.NOT_FOUND, NOT_FOUND);
    return subTask;
  }

  async removeByTask(taskId: string) {
    const result = await this.subTasks.deleteMany({ task_id: taskId });
    return { deletedCount: result.deletedCount };
  }

  async removeByProject(projectId: string) {
    const result = await this.subTasks.deleteMany({ project_id: projectId });
    return { deletedCount: result.deletedCount };
  }
}
