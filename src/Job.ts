export interface Job<T> {
  data: T;
  result?: JobResult<T>;
}

export interface JobResult<T> {
  result: T;
  error?: Error;
}

export function createJob<T>(data: T): Job<T> {
  return { data };
}
