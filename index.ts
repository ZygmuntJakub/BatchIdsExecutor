class BatchWrapper {
  fun: (arg: unknown) => Promise<unknown> = () => Promise.resolve();
  ms = 500;

  _cache = new Map();
  _currentArgs = [];
  _sleepCallback = undefined;

  constructor({ fun, ms }) {
    this.fun = fun;
    this.ms = ms;
  }

  _executeFun = () => {
    return this.fun(this._currentArgs).then((results: { arg: unknown }[]) => {
      results.forEach((data) => {
        this._cache.set(data.arg, data);
      });
    });
  };

  _reset = () => {
    this._sleepCallback = undefined;
    this._currentArgs = [];
  };

  batchExecute = (arg: unknown) => {
    if (this._cache.has(arg)) {
      return Promise.resolve(this._cache.get(arg));
    }

    if (!this._sleepCallback)
      this._sleepCallback = new Promise((resolve) =>
        setTimeout(
          () => this._executeFun().then(this._reset).then(resolve),
          this.ms
        )
      );

    this._currentArgs.push(arg);

    return this._sleepCallback.then(() => this._cache.get(arg));
  };
}

const fun = (args) =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve(args.map((arg) => ({ date: new Date(), arg }))),
      500
    )
  );

const wrapper = new BatchWrapper({ fun, ms: 3000 });

setTimeout(() => wrapper.batchExecute(1).then(console.log), 500);
setTimeout(() => wrapper.batchExecute(2).then(console.log), 1000);
setTimeout(() => wrapper.batchExecute(3).then(console.log), 2000);
setTimeout(() => wrapper.batchExecute(3).then(console.log), 5000);
setTimeout(() => wrapper.batchExecute(4).then(console.log), 5000);