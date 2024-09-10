import { UnifiedErrorStrategy } from './unified-error-strategy.interface';

export class ErrorContext {
  private strategy: UnifiedErrorStrategy;

  constructor(strategy: UnifiedErrorStrategy) {
    this.strategy = strategy;
  }

  async execute(input: any) {
    return await this.strategy.execute(input);
  }
}
