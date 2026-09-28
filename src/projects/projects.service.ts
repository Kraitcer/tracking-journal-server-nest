import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Body, httpError, joiValidate } from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import { GOAL_MODEL } from '../goals/goal.schema.js';
import { SUB_TASK_MODEL } from '../sub-tasks/sub-task.schema.js';
import {
  FETUS_MODEL,
  PROJECT_MODEL,
  fetusJoiSchema,
  projectJoiSchema,
} from './project.schema.js';

const DEFAULT_FETUS = {
  fun: 0,
  effect: 0,
  time: 0,
  urgency: 0,
  strategy: 0,
  total: 0,
};

function mapProjectFields(body: Body): Body {
  const {
    _id,
    user_id,
    projectName,
    date_created,
    description,
    completed,
    fetusIndex,
  } = body;
  return {
    _id,
    user_id,
    projectName,
    date_created,
    description,
    completed,
    fetusIndex,
  };
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(PROJECT_MODEL) private readonly projects: AnyModel,
    @InjectModel(FETUS_MODEL) private readonly fetuses: AnyModel,
    @InjectModel(GOAL_MODEL) private readonly goals: AnyModel,
    @InjectModel(SUB_TASK_MODEL) private readonly subTasks: AnyModel,
  ) {}

  create(body: Body) {
    joiValidate(projectJoiSchema, body);
    return new this.projects(mapProjectFields(body)).save();
  }

  async findByUser(userId: string) {
    const projects = await this.projects
      .find({ user_id: userId })
      .sort('priority');

    return Promise.all(
      projects.map(async (project) => {
        const byProject = { currentProjectID: project._id };
        const [
          queueTasksCount,
          developmentTasksCount,
          doneTasksCount,
          totalTasksCount,
          fetus,
        ] = await Promise.all([
          this.goals.countDocuments({ ...byProject, status: 'queue' }),
          this.goals.countDocuments({ ...byProject, status: 'development' }),
          this.goals.countDocuments({ ...byProject, status: 'done' }),
          this.goals.countDocuments(byProject),
          this.fetuses
            .findOne({ projectID: project._id })
            .sort({ createdAt: -1 }),
        ]);

        return {
          ...project.toObject(),
          id: project._id,
          FETUSIndex: fetus !== null ? fetus.fetusIndex : DEFAULT_FETUS,
          queueTasksCount,
          developmentTasksCount,
          doneTasksCount,
          done:
            totalTasksCount > 0 ? (doneTasksCount / totalTasksCount) * 100 : 0,
        };
      }),
    );
  }

  async reorder(body: Body) {
    const { userId, projectOrder } = body;
    try {
      const projects = await this.projects.find({ user_id: userId });
      const orderMap = new Map<string, number>(
        (projectOrder as Body[]).map((project, index) => [project._id, index]),
      );

      await Promise.all(
        projects.map(async (project) => {
          const priority = orderMap.get(project._id.toString());
          if (priority !== undefined) {
            project.priority = priority;
            await project.save();
          }
        }),
      );

      return { message: 'Project order updated successfully' };
    } catch (error) {
      console.error('Error updating project order:', error);
      throw httpError(HttpStatus.INTERNAL_SERVER_ERROR, {
        error: 'Internal Server Error',
      });
    }
  }

  async saveFetus(body: Body) {
    joiValidate(fetusJoiSchema, body);
    try {
      const { projectID, fetusIndex } = body;
      return await new this.fetuses({ projectID, fetusIndex }).save();
    } catch (err) {
      console.error('Error saving FETUS of project:', err);
      throw httpError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error saving FETUS of project',
      );
    }
  }

  async update(id: string, body: Body) {
    const payload = mapProjectFields(body);
    joiValidate(projectJoiSchema, payload);
    const project = await this.projects.findByIdAndUpdate(id, payload, {
      returnDocument: 'after',
    });
    if (!project) {
      throw httpError(HttpStatus.NOT_FOUND, "Can't store the project...");
    }
    return project;
  }

  async remove(id: string) {
    const project = await this.projects.findByIdAndDelete(id);
    if (!project) {
      throw httpError(HttpStatus.NOT_FOUND, "Can't delete the project...");
    }
    await this.goals.deleteMany({ currentProjectID: id });
    // Same filter as the old server (subTasks store project_id, so this matches nothing).
    await this.subTasks.deleteMany({ currentProjectID: id });
    return project;
  }
}
