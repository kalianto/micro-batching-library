import { MicroBatching } from '../src/MicroBatching';
import { createJob } from '../src/Job';
import { BatchProcessor } from '../src/BatchProcessor';

describe('MicroBatching', () => {
  let mockBatchProcessor: jest.MockedFunction<BatchProcessor<string, string>>;

  beforeEach(() => {
    // Mocking the BatchProcessor using jest.fn
    mockBatchProcessor = jest.fn(async (jobs) => {
      jobs.forEach(({ job, resolve }) => {
        resolve(job.data);
      });
    });
  });

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
    ).rejects.toThrow('shutdown is in progress');
  });

  it('should process jobs in batches of 2 when 4 jobs are submitted', async () => {
    const batchSize = 2;
    const microBatching = new MicroBatching<string, string>(
      mockBatchProcessor,
      batchSize,
      100
    );

    const job1 = createJob<string>('task1');
    const job2 = createJob<string>('task2');
    const job3 = createJob<string>('task3');
    const job4 = createJob<string>('task4');

    const result1 = microBatching.submitJob(job1);
    const result2 = microBatching.submitJob(job2);
    const result3 = microBatching.submitJob(job3);
    const result4 = microBatching.submitJob(job4);

    await Promise.all([result1, result2, result3, result4]);

    // Check that batch processor was called twice
    expect(mockBatchProcessor).toHaveBeenCalledTimes(2);

    // Check that each batch processed 2 jobs
    expect(mockBatchProcessor).toHaveBeenNthCalledWith(
      1,
      expect.arrayContaining([
        expect.objectContaining({ job: job1 }),
        expect.objectContaining({ job: job2 }),
      ])
    );

    expect(mockBatchProcessor).toHaveBeenNthCalledWith(
      2,
      expect.arrayContaining([
        expect.objectContaining({ job: job3 }),
        expect.objectContaining({ job: job4 }),
      ])
    );

    await microBatching.shutdown();
  });
});
