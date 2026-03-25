import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as Record<
        string,
        unknown
      >;
      message = (exceptionResponse?.message as string) || exception.message;
    } else if (exception instanceof ZodValidationException) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      const zodError = exception.getZodError() as ZodError;
      errors = zodError.issues;
    }

    response.status(status).send({
      success: false,
      statusCode: status,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}
