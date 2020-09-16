### Fraud Redux-Logger

An attempt at implemeenting `redux-logger` using `Typescript`.
Possibly add more features in the future.
Seems like `redux-logger` is not very active.
IMHO, there's a lot of disgusting stuff in there :3

## TODO

1.  Why the hell don't `next` accepts state and actions? Next appears to perform side effects.
2.  This logging library is making query to get current time MULTIPLE TIMEs, this is highly inefficient.
3.  Because this library calls to `next(action)` it performs the computation to get the next state.
    Makes me realize how much redundant computations are performed in `redux`'s middlewares :/
