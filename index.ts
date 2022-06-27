class BatchIdsExecutor<FunResult, IdType, IdKey extends keyof FunResult> {
  fun: (ids: IdType[]) => Promise<FunResult[]>;
  ms = 500;
  idKey: IdKey;

  _cache = new Map();
  _currentIds: IdType[] = [];
  _sleepCallback: undefined | Promise<unknown> = undefined;

  constructor({
    fun,
    ms,
    idKey,
  }: {
    fun: (ids: IdType[]) => Promise<FunResult[]>;
    ms: number;
    idKey: IdKey;
  }) {
    this.fun = fun;
    this.ms = ms;
    this.idKey = idKey;
  }

  _executeFun: () => Promise<void> = () => {
    return this.fun(this._currentIds).then((results) => {
      results.forEach((data) => {
        this._cache.set(data[this.idKey], data);
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

  deleteFromCache: (id: IdType) => boolean = (id) => {
    return this._cache.delete(id);
  };
}

export default BatchIdsExecutor;

// TEST

const fun: (ids: number[]) => Promise<{ date: Date; id: number }[]> = (ids) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(ids.map((id) => ({ date: new Date(), id }))), 500)
  );

const batchIdsExecutor = new BatchIdsExecutor<
  { date: Date; id: number },
  number,
  'id'
>({ fun, ms: 3000, idKey: 'id' });

setTimeout(() => batchIdsExecutor.batchExecute(1).then(console.log), 500);
setTimeout(() => batchIdsExecutor.batchExecute(2).then(console.log), 1000);
setTimeout(() => batchIdsExecutor.batchExecute(3).then(console.log), 2000);
setTimeout(() => batchIdsExecutor.batchExecute(3).then(console.log), 5000);
setTimeout(() => batchIdsExecutor.batchExecute(4).then(console.log), 5000);

setTimeout(() => batchIdsExecutor.deleteFromCache(3), 6000);
setTimeout(() => batchIdsExecutor.batchExecute(3).then(console.log), 6500);

batchIdsExecutor.resetCache();
