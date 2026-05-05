import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // Temporary allow-all guard for phase scaffolding.
    // This will be replaced by a real JWT strategy in a later phase.
    return true;
  }
}
