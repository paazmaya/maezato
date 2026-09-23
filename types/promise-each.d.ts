// Type definitions for promise-each
declare module "promise-each" {
  function promiseEach<T, U>(array: T[], iterator: (item: T) => Promise<U>): Promise<U[]>;

  export = promiseEach;
}
