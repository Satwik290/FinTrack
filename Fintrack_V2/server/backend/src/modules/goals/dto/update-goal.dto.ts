import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateGoalSchema } from '../goal.schema';

export class UpdateGoalDto extends createZodDto(UpdateGoalSchema) {
  @ApiPropertyOptional({
    example: 'Emergency Fund (Updated)',
    description: 'Name of the financial goal',
  })
  title?: string;

  @ApiPropertyOptional({
    example: 350000,
    description: 'Updated target amount',
  })
  target?: number;

  @ApiPropertyOptional({
    example: '2027-12-31T00:00:00.000Z',
    description: 'Updated deadline (ISO-8601 format)',
  })
  deadline?: string;

  @ApiPropertyOptional({
    example: '🏥',
    description: 'Updated emoji icon',
  })
  icon?: string;

  @ApiPropertyOptional({
    example: '#10b981',
    description: 'Updated hex color code',
  })
  color?: string;
}
