import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface PrismaKnownError { name: string; code: string }

function isPrismaKnownError(exception: unknown): exception is PrismaKnownError {
  return (
    typeof exception === 'object' && exception !== null &&
    (exception as { name?: string }).name === 'PrismaClientKnownRequestError' &&
    typeof (exception as { code?: unknown }).code === 'string'
  );
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Terjadi kesalahan pada server.';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse() as { message?: string | string[]; code?: string; details?: unknown } | string;
      if (typeof body === 'string') {
        message = body;
      } else {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message ?? message;
        code = body.code ?? this.defaultCode(status);
        details = body.details;
      }
      code = code || this.defaultCode(status);
    } else if (isPrismaKnownError(exception)) {
      if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        message = 'Data tidak ditemukan.';
      } else if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'DUPLICATE';
        message = 'Data dengan nilai unik ini sudah ada.';
      } else {
        code = `PRISMA_${exception.code}`;
        message = 'Terjadi kesalahan pada database.';
      }
    } else if (exception instanceof Error) {
      this.logger.error(`${request?.method} ${request?.url} → ${exception.message}`, exception.stack);
    }

    if (status >= 500) {
      this.logger.error(`${request?.method} ${request?.url} → ${status}`, exception instanceof Error ? exception.stack : undefined);
    }

    response.status(status).json({
      success: false as const,
      error: { code, message, ...(details !== undefined ? { details } : {}) },
    });
  }

  private defaultCode(status: number): string {
    switch (status) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 429: return 'RATE_LIMITED';
      default: return status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR';
    }
  }
}
