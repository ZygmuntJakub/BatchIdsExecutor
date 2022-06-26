The class serves as a tool to batch execute a function to which arguments collected during the indicated time window will be passed.

TL;DR
This is mainly useful when the function makes a request to the API and instead of making n requests you can make one and then store the values in the cache.


Instead of this
```
fun(1);
fun(2);
fun(3);
```

you can simplify to this
```
fun([1,2,3]);
```

- A class is created with the function and time window specified.

```
const batchArgsExecutor = new BatchArgsExecutor({ fun, ms: 3000 });
```

- The first call of `batchExecute` creates the time window and saves the argument to the cache of the current time window.

```
batchArgsExecutor.batchExecute(1); // _currentArgs = [1]
```

- Subsequent calls add arguments to the cache of the current time window.

```
batchArgsExecutor.batchExecute(2); // _currentArgs = [1,2]
batchArgsExecutor.batchExecute(3); // _currentArgs = [1,2,3]
```

- When the time window ends, the result of the function call to which all collected arguments were passed is returned.

```
// All batchArgsExecutor calls invoke one fun call and return value for provided arg
batchArgsExecutor.batchExecute(1);
batchArgsExecutor.batchExecute(2);
batchArgsExecutor.batchExecute(3);
```

- Additionally, the class provides methods to delete data from the cache and to reset the cache.

```
batchArgsExecutor.deleteFromCache(1);
batchArgsExecutor.resetCache();
```
