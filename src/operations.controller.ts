import { Controller, Get } from '@nestjs/common';

@Controller('api/operations')
export class OperationsController {
  @Get()
  getOperations(): { storage: 'mock'; label: string } {
    return { storage: 'mock', label: '\uB0B4 \uCEF4\uD4E8\uD130' };
  }
}