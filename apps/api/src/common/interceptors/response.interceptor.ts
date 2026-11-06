import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { PaginationMeta } from '@mentari/shared';

/** Envelope helper — controllers may return `new ApiOk(data, meta?)` or any plain payload. */
export class ApiOk<T> {
  constructor(public readonly data: T, public readonly meta?: PaginationMeta) {}
}
export const ok = <T>(data: T, meta?: PaginationMeta) => new ApiOk(data, meta);
export const paginated = <T>(items: T[], page: number, limit: number, total: number) =>
  new ApiOk(items, { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result) => {
        if (result instanceof ApiOk) {
          return {
            success: true as const,
            data: result.data,
            ...(result.meta ? { meta: result.meta } : {}),
          };
        }
        return { success: true as const, data: result ?? null };
      }),
    );
  }
}
