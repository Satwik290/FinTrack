import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateGoalSchema } from '../goal.schema';

export class CreateGoalDto extends createZodDto(CreateGoalSchema) {
  @ApiProperty({
    example: 'Emergency Fund',
    description: 'Name of the financial goal',
  })
  title!: string;

  @ApiProperty({
    example: 300000,
    description: 'Target amount to reach the goal',
  })
  target!: number;

  @ApiProperty({
    example: '2026-12-31T00:00:00.000Z',
    description: 'Deadline to achieve the goal (ISO-8601 format)',
  })
  deadline!: string;

  @ApiPropertyOptional({
    example: '🛡️',
    description: 'Emoji icon representing the goal',
  })
  icon?: string;

  @ApiPropertyOptional({
    example: '#6366f1',
    description: 'Hex color code for UI rendering',
  })
  color?: string;
}
