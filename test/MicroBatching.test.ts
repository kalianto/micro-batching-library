import { MicroBatching } from '../src/MicroBatching';
import { createJob } from '../src/Job';
import { BatchProcessor } from '../src/BatchProcessor';

const mockBatchProcessor: BatchProcessor<string, string> = async (jobs) => {
  jobs.forEach(({ job, resolve }) => {
    resolve(job.data);
  });
};

describe('MicroBatching', () => {
  it('should process jobs in batches', async () => {
    const microBatching = new MicroBatching<string, string>(
      mockBatchProcessor,
      2, // batch size
      100 // batch interval in miliseconds
    );

    const job1 = createJob<string>('task1');
    const job2 = createJob<string>('task2');
    const job3 = createJob<string>('task3');

    const result1 = await microBatching.submitJob(job1);
    const result2 = await microBatching.submitJob(job2);
    const result3 = await microBatching.submitJob(job3);

    await microBatching.shutdown();

    expect(result1).toBe('task1');
    expect(result2).toBe('task2');
    expect(result3).toBe('task3');
  });

  it('should not accept new jobs after shutdown is initiated', async () => {
    const microBatching = new MicroBatching<string, string>(
      mockBatchProcessor,
      2,
      100
    );

    await microBatching.shutdown();

    await expect(
      microBatching.submitJob(createJob<string>('task4'))
    ).rejects.toThrow('Cannot submit job, shutdown in progress');
  });
});
