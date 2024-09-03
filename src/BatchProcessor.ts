// src/BatchProcessor.ts

export interface BatchProcessor<T, R> {
  (
    jobs: Array<{
      job: any;
      resolve: (result: R) => void;
      reject: (reason?: any) => void;
    }>
  ): Promise<void>;
}
