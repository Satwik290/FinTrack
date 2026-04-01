import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface RequestUser {
  sub: string;
  email: string;
}

@Controller('copilot')
@UseGuards(JwtAuthGuard)
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  @Post('chat')
  async chat(
    @CurrentUser() user: RequestUser,
    @Body('transcript') transcript: string,
  ) {
    const response = await this.copilotService.processQuery(
      user.sub,
      transcript,
    );
    return { response };
  }

  @Get('greeting')
  async greeting(@CurrentUser() user: RequestUser) {
    const response = await this.copilotService.processQuery(
      user.sub,
      '__PROACTIVE_INSIGHTS__',
    );
    return { response };
  }
}
