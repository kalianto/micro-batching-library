import { Job } from './Job';
import { BatchProcessor } from './BatchProcessor';

export class MicroBatching<T, R> {
  private jobsList: Array<{
    job: Job<T>;
    resolve: (result: R) => void;
    reject: (reason?: any) => void;
  }> = [];
  private timer: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;

  /**
   *
   * @param batchProcessor
   * @param batchSize
   * @param batchInterval
   */
  constructor(
    private batchProcessor: BatchProcessor<T, R>,
    private batchSize: number,
    private batchInterval: number // in miliseconds, as it is used in setTimeout
  ) {}

  public async submitJob(job: Job<T>): Promise<R> {
    if (this.isShuttingDown) {
      throw new Error('Cannot submit job, shutdown in progress');
    }

    return new Promise<R>((resolve, reject) => {
      // adding a job to the list of jobs
      this.jobsList.push({ job, resolve, reject });

      // if jobsList length equal or exceeds the batch size, process the current jobs in the joblist
      if (this.jobsList.length >= this.batchSize) {
        this.processJobs();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.processJobs(), this.batchInterval);
      }
    });
  }

  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.jobsList.length > 0) {
      await this.processJobs();
    }
  }

  private async processJobs(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const jobsToProcess = this.jobsList.splice(0, this.batchSize);
    try {
      await this.batchProcessor(jobsToProcess);
    } catch (error) {
      jobsToProcess.forEach(({ reject }) => reject(error));
    }
  }
}
