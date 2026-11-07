import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, type ZodSchema } from 'zod';

/** Validates request body/query against a shared Zod schema from @mentari/shared. */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value ?? {});
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Data yang dikirim tidak valid.',
          details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        });
      }
      throw error;
    }
  }
}
