import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Module,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Body as Payload } from '../common/http.js';
import { JournalPageService } from '../common/journal-page.service.js';
import type { AnyModel } from '../database/database.module.js';
import { FREE_DAY_MODEL, freeDayJoiSchema } from './free-day.schema.js';

@Injectable()
export class FreeDaysService extends JournalPageService {
  constructor(@InjectModel(FREE_DAY_MODEL) model: AnyModel) {
    super(model, freeDayJoiSchema, 'Free day not found');
  }
}

@Controller('freeDays')
export class FreeDaysController {
  constructor(private readonly freeDays: FreeDaysService) {}

  @Get('journal/:journal_id')
  findByJournal(@Param('journal_id') journalId: string) {
    return this.freeDays.findByJournal(journalId);
  }

  @Post()
  @HttpCode(200)
  create(@Body() body: Payload) {
    return this.freeDays.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Payload) {
    return this.freeDays.update(id, body);
  }

  @Delete('journal/:journal_id')
  @HttpCode(204)
  removeByJournal(@Param('journal_id') journalId: string) {
    return this.freeDays.removeByJournal(journalId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.freeDays.remove(id);
  }
}

@Module({
  controllers: [FreeDaysController],
  providers: [FreeDaysService],
})
export class FreeDaysModule {}
