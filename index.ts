class BatchIdsExecutor<IdType, FunResult extends { id: IdType }> {
  fun: (ids: IdType[]) => Promise<FunResult[]>;
  ms = 500;

  _cache = new Map();
  _currentIds: IdType[] = [];
  _sleepCallback: undefined | Promise<unknown> = undefined;

  constructor({
    fun,
    ms,
  }: {
    fun: (ids: IdType[]) => Promise<FunResult[]>;
    ms: number;
  }) {
    this.fun = fun;
    this.ms = ms;
  }

  _executeFun = () => {
    return this.fun(this._currentIds).then((results) => {
      results.forEach((data) => {
        this._cache.set(data.id, data);
      });
    });
  };

  _resetCurrentIds: () => void = () => {
    this._sleepCallback = undefined;
    this._currentIds = [];
  };

  batchExecute: (id: IdType) => Promise<FunResult> = (id) => {
    if (this._cache.has(id)) {
      return Promise.resolve(this._cache.get(id));
    }

    if (!this._sleepCallback)
      this._sleepCallback = new Promise((resolve) =>
        setTimeout(
          () => this._executeFun().then(this._resetCurrentIds).then(resolve),
          this.ms
        )
      );

    this._currentIds.push(id);

    return this._sleepCallback.then(() => this._cache.get(id));
  };

  resetCache: () => void = () => {
    this._cache = new Map();
  };

  deleteFromCache: (arg: unknown) => boolean = (arg) => {
    return this._cache.delete(arg);
  };
}

export default BatchIdsExecutor;

// TEST

const fun: (ids: number[]) => Promise<{ date: Date; id: number }[]> = (ids) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(ids.map((id) => ({ date: new Date(), id }))), 500)
  );

const batchIdsExecutor = new BatchIdsExecutor<
  number,
  { date: Date; id: number }
>({ fun, ms: 3000 });

setTimeout(() => batchIdsExecutor.batchExecute(1).then(console.log), 500);
setTimeout(() => batchIdsExecutor.batchExecute(2).then(console.log), 1000);
setTimeout(() => batchIdsExecutor.batchExecute(3).then(console.log), 2000);
setTimeout(() => batchIdsExecutor.batchExecute(3).then(console.log), 5000);
setTimeout(() => batchIdsExecutor.batchExecute(4).then(console.log), 5000);

setTimeout(() => batchIdsExecutor.deleteFromCache(3), 6000);
setTimeout(() => batchIdsExecutor.batchExecute(3).then(console.log), 6500);

batchIdsExecutor.resetCache();
