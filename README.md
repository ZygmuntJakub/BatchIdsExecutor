The class serves as a tool to batch execute a function to which ids collected during the indicated time window will be passed.

TL;DR
This is mainly useful when the function makes a request to the API and instead of making n requests you can make one and then store the values in the cache.

Instead of doing it this way

```
fun(1);
fun(2);
fun(3);
```

you can simplify it

```
fun([1,2,3]);
```

- A class is created with the function and time window specified.

```
const batchIdsExecutor = new BatchIdsExecutor({ fun, ms: 3000 });
```

- The first call of `batchExecute` creates the time window and saves the id to the store of the current time window.

```
batchIdsExecutor.batchExecute(1); // _currentIds = [1]
```

- Subsequent calls add ids to the store of the current time window.

```
batchIdsExecutor.batchExecute(2); // _currentIds = [1,2]
batchIdsExecutor.batchExecute(3); // _currentIds = [1,2,3]
```

- When the time window ends, the result of the function call to which all collected ids were passed is returned.

```
// All batchIdsExecutor calls invoke one fun call and return value for provided arg
batchIdsExecutor.batchExecute(1);
batchIdsExecutor.batchExecute(2);
batchIdsExecutor.batchExecute(3);
```

- Another call to the same id will return the value from cache

```
batchIdsExecutor.batchExecute(1); // returns after 3000ms
batchIdsExecutor.batchExecute(2); // returns after 3000ms
batchIdsExecutor.batchExecute(3); // returns after 3000ms
batchIdsExecutor.batchExecute(3); // returns immediately from cache
```

- Additionally, the class provides methods to delete data from the cache and to reset the cache.

```
batchIdsExecutor.deleteFromCache(1);
batchIdsExecutor.resetCache();
```
