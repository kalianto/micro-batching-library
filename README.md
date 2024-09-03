# Micro-Batching Library

A micro-batching library implemented in TypeScript to improve throughput by grouping tasks into small batches.

## Installation

```bash
npm install @kalianto/micro-batching-library
```

## Usage Example

```typescript
import { 
  createMicroBatching, 
  createJob, 
  BatchProcessor,
} from '@kalianto/micro-batching-library';

const myBatchProcessor: BatchProcessor<string> = async (jobs) => {
    return jobs.map(job => `Processed: ${job.data}`);
};

const microBatching = createMicroBatching<string>(myBatchProcessor, 5, 2000);

(async () => {
    const job1 = createJob<string>('task1');
    const job2 = createJob<string>('task2');
    const job3 = createJob<string>('task3');

    await microBatching.submitJob(job1);
    await microBatching.submitJob(job2);
    await microBatching.submitJob(job3);

    await microBatching.shutdown();

    console.log(job1.result?.result); // Processed: task1
    console.log(job2.result?.result); // Processed: task2
    console.log(job3.result?.result); // Processed: task3
})();
```

## API Reference

### `createMicroBatching`

- Parameters:
  - `batchProcessor` : A function that processes a batch of jobs.
  - `batchSize`: The size of each batch.
  - `batchInterval`: The time interval between batch processing in miliseconds.

### `createJob`

- Parameters:
  - `data` : The data for the job.
  - `batchSize`: The size of each batch.
  - `batchInterval`: The time interval between batch processing.
