import { LogTime } from './types'

export const repeat: (a: string, b: number) => string = (str: string, times: number) =>
  new Array(times + 1).join(str)

export const pad: (a: number, b: number) => string = (num: number, maxLength: number) =>
  repeat('0', maxLength - num.toString().length) + num

export const formatTime: (a: Date) => string = (time: Date) =>
  `${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(
    time.getMilliseconds(),
    3
  )}`

// Use performance API if it's available in order to get better precision
export const timer: LogTime =
  typeof performance !== 'undefined' &&
  performance !== null &&
  typeof performance.now === 'function'
    ? performance
    : Date
