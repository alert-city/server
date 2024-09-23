export interface UnifiedErrorStrategy {
  execute(input: any): Promise<void>;
}
