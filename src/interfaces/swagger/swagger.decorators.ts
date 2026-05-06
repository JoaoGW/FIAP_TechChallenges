/* Temporary no-op Swagger decorators until @nestjs/swagger is added in a later phase. */
export function ApiTags(_name: string): ClassDecorator {
  return () => undefined;
}

export function ApiBearerAuth(): ClassDecorator {
  return () => undefined;
}

export function ApiOperation(_options: { summary: string }): MethodDecorator {
  return () => undefined;
}

export function ApiResponse(_options: {
  status: number;
  description?: string;
}): MethodDecorator {
  return () => undefined;
}

export function ApiQuery(_options: {
  name: string;
  required?: boolean;
}): MethodDecorator {
  return () => undefined;
}

export function ApiProperty(_options?: Record<string, unknown>): PropertyDecorator {
  return () => undefined;
}

export function ApiPropertyOptional(
  _options?: Record<string, unknown>,
): PropertyDecorator {
  return () => undefined;
}
