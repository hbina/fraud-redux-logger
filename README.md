# Fraud Redux-Logger

An attempt at implemeenting `redux-logger` using `Typescript`.
Possibly add more features in the future.
Seems like `redux-logger` is not very active.
IMHO, there's a lot of disgusting stuff in there :3

## Features

### Customization

Unlike `redux-logger`, you can fully customize how logging is performed.
`redux-logger` only provides 1 customization point : the options.
This library exposes 2 customization points : the printer and the options.
Therefore, you can tailor logging to your exact needs.
For example, the defualt logging provided in `redux-logger` does not really work outside of `Chrome`'s console.
If you look at our example in [customizedLogger](./tests/customizedLogger.test.js), you can instead just print normally without any formatting.

### Typescript

This library is implemented entirely using TypeScript which makes maintaining and fixing this library much, much easier.

### Cleaner code

This is just my opinion, but there's a lot of dubious stuff in the `redux-logger`.
For example, it performs indirection unnecessarily.
However, I'll let you be the judge of that :3
