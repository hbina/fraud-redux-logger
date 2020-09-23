# Fraud Redux-Logger

![npm](https://img.shields.io/npm/v/fraud-redux-logger)
![Codecov](https://img.shields.io/codecov/c/github/hbina/fraud-redux-logger)

> `redux-logger` with more features

An attempt at implementing `redux-logger` using `Typescript` with more features!
Seems like `redux-logger` is not very active.
IMHO, there's a lot of disgusting stuff in there :3

## Features

### Customization

Unlike `redux-logger`, you can fully customize how logging is performed.
`redux-logger` only provides 1 customization point : the options.
This library exposes 2 customization points : the printer and the options.
Therefore, you can tailor logging to your exact needs.
For example, the default logging provided in `redux-logger` does not really work outside of `Chrome`'s console.
If you look at our example in [customizedLogger](./tests/customizedLogger.test.ts), you can instead just print normally without any formatting.

### Typescript

This library is implemented entirely using `TypeScript` which makes maintaining and fixing this library much, much easier.

### Cleaner code

This is just my opinion, but there's a lot of dubious stuff in the `redux-logger`.
For example, it performs indirection unnecessarily.
However, I'll let you be the judge of that :3

## Documentation

To use this library, lets look at the simplest way we can create a logging middleware.

```typescript
// An empty option class
type CustomOption = {}

const basicPrinter: Printer<TestState, TestError, CustomOption> = {
  // Are we logging exceptions?
  // For this one, yes!
  logError: true,
  // If this function returns true, we log. Else, we dont't.
  // For performance or logging reasons, we might want to skip logging.
  // In this case, we always log.
  logPredicate: (s: TestState, b: AnyAction) => true,
  // The logging function.
  printLog: (logEntry: LogEntry<TestState, TestError>, customOption: CustomOption) => {
    console.log(`logEntry:${JSON.stringify(logEntry)}`)
  },
}

// Finally apply the middleware.
const store = createStore(
  reducer,
  applyMiddleware(createLogger<TestState, TestError, CustomOption>(basicPrinter, {}))
)
```

Notice that this library does not actually perform any logging.
However, we do provide sane defaults that works really well on the web that is very similar to `redux-logger`.
However, because you are not bound to our implementation, you can do whatever you want!

## Type Signatures

### `createLogger` Function

```typescript
export const createLogger: <S, E, O>(printer: Printer<S, E, O>, options: O) => MiddlewareFunction<S, Dispatch<AnyAction>, AnyAction> = ...
```

Quite scary, but lets take a look at it slowly.

1.  `S` is simply the full state of your application i.e. it is the root reducer of your Redux.
2.  `E` is the error type that you have, if you don't care, just set it to `any`.
3.  `O` is the option type that you can use to configure how printing is performed.
    Notice that the type `O` is not bounded; you are free to implement it however you want!

In the example above, its a empty struct because there are no options.
To see a robust and powerful example of options, see our implementation of the [defaultWebLogger](./src/default.ts)

### `Printer` Type

```typescript
export type Printer<S, E, O> = {
  readonly logError: boolean
  readonly logPredicate: (s: S, b: AnyAction) => boolean
  readonly printLog: (s: LogEntry<S, E>, o: O) => void
}
```

As before, `S`, `E` and `O` refers to state, error and options respectively.

1.  `logError` determines if we are logging exceptions.
2.  `logPredicate` determines if we should log a particular action or not.
3.  `printLog` is the actual place where you are free to log however you want.

### `LogEntry` Type

```typescript
export type LogEntry<S, E> = {
  readonly action: AnyAction
  readonly error: Option<E>
  readonly startedTime: Date
  readonly took: number
  readonly prevState: S
  readonly nextState: S
}
```

From above, `printLog` accepts 2 arguments: `LogEntry<S, E>` and `O`.
This is the type signature for the former.

1.  `action` is the current action we are performing.
2.  `error` is a maybe type that may contain error if you set `logError` to true and an error actually occurs.
3.  `startedTime` is the date/time when this particular entry is logged.
4.  `took` is the time taken to calculate the next state.
5.  `prevState` is the state before redux calculations.
6.  `nextState` is the state after redux calculations.
