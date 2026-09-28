import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Body, httpError, joiValidate } from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import { PROJECT_MODEL } from '../projects/project.schema.js';
import { SUB_TASK_MODEL } from '../sub-tasks/sub-task.schema.js';
import { TASK_MODEL } from '../tasks/task.schema.js';
import { GOAL_MODEL, goalJoiSchema } from './goal.schema.js';

const NOT_FOUND = 'Fucking fuck...';

const countByStatus = (status: string) => ({
  $sum: { $cond: [{ $eq: ['$status', status] }, 1, 0] },
});

function mapGoalFields(body: Body): Body {
  const {
    _id,
    goalName,
    currentProjectID,
    description,
    status,
    padMode,
    creationDate,
    timeSpent,
    dueDate,
  } = body;
  return {
    _id,
    goalName,
    currentProjectID,
    description,
    status,
    padMode,
    creationDate,
    timeSpent,
    dueDate,
  };
}

@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(GOAL_MODEL) private readonly goals: AnyModel,
    @InjectModel(PROJECT_MODEL) private readonly projects: AnyModel,
    @InjectModel(TASK_MODEL) private readonly tasks: AnyModel,
    @InjectModel(SUB_TASK_MODEL) private readonly subTasks: AnyModel,
  ) {}

  allGoalsInfo() {
    return this.goals.aggregate([
      {
        $group: {
          _id: '$currentProjectID',
          queueTasks: countByStatus('queue'),
          developmentTasks: countByStatus('development'),
          doneTasks: countByStatus('done'),
        },
      },
      {
        $project: {
          _id: 0,
          currentProjectID: '$_id',
          queueTasks: 1,
          developmentTasks: 1,
          doneTasks: 1,
        },
      },
    ]);
  }

  async findByProject(projectID: string) {
    const goals = await this.goals
      .find({ currentProjectID: projectID })
      .sort('priority');
    return this.withCounters(goals);
  }

  async findByUser(userId: string) {
    const projects = await this.projects
      .find({ user_id: userId })
      .select('_id');
    const projectIDs = projects.map((project) => project._id);
    if (projectIDs.length === 0) return [];

    const goals = await this.goals
      .find({ currentProjectID: { $in: projectIDs } })
      .sort('priority');
    return this.withCounters(goals);
  }

  private withCounters(goals: any[]) {
    return Promise.all(
      goals.map(async (goal) => {
        const [subTasks, tasks] = await Promise.all([
          // Same filter as the old server (subTasks have no currentTaskID field).
          this.subTasks.countDocuments({
            currentTaskID: goal._id,
            completed: false,
          }),
          this.tasks.countDocuments({ goal_id: goal._id, completed: false }),
        ]);
        // Stored fields are spread last, exactly like `...goal._doc` in the old server.
        return {
          id: goal._id,
          padMode: goal.padMode || 'goalsPageMain',
          subTasks,
          tasks,
          ...goal.toObject(),
        };
      }),
    );
  }

  create(body: Body) {
    joiValidate(goalJoiSchema, body);
    return new this.goals(mapGoalFields(body)).save();
  }

  async reorder(body: Body) {
    const { currentProjectID, goalsOrder } = body;
    try {
      const goals = await this.goals.find({ currentProjectID });
      const order = goalsOrder as Body[];
      const orderMap = new Map<string, number>(
        order.map((goal, index) => [goal._id, index]),
      );

      await Promise.all(
        goals.map(async (goal) => {
          const goalId = goal._id.toString();
          const fromClient = order.find((el) => el._id === goalId);
          if (!fromClient) return;

          goal.status = fromClient.status;
          const priority = orderMap.get(goalId);
          if (priority !== undefined) goal.priority = priority;

          await goal.save();
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

  async update(id: string, body: Body) {
    const changes = Object.fromEntries(
      Object.entries(body ?? {}).filter(([, value]) => value !== ''),
    );
    joiValidate(goalJoiSchema, changes);
    const goal = await this.goals.findByIdAndUpdate(
      id,
      { $set: changes },
      { returnDocument: 'after' },
    );
    if (!goal) throw httpError(HttpStatus.NOT_FOUND, NOT_FOUND);
    return goal;
  }

  async removeByProject(projectID: string) {
    try {
      const result = await this.goals.deleteMany({
        currentProjectID: projectID,
      });
      return { deletedCount: result.deletedCount };
    } catch (err) {
      console.error('Error deleting goals by project:', err);
      throw httpError(HttpStatus.INTERNAL_SERVER_ERROR, {
        message: 'Internal Server Error',
      });
    }
  }

  async remove(id: string) {
    const goal = await this.goals.findByIdAndDelete(id);
    if (!goal) throw httpError(HttpStatus.NOT_FOUND, NOT_FOUND);
    return goal;
  }
}
