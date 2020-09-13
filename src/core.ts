import { formatTime } from './helpers'
import diffLogger from './diff'
import { LoggerOption, LogLevelType, ReduxState, ReduxAction, LogTime, LogEntry } from './types'
import { isSome } from 'fp-ts/lib/Option'

type ObjectWithLogLevel = {
  type: LogLevelType
}
type LevelFunction = (a: ReduxState) => string | LevelFunction | ObjectWithLogLevel

/// TODO :: For now, just a string.
function getLogLevel(
  level: string | LevelFunction | ObjectWithLogLevel,
  _action: ReduxAction,
  _payload: any,
  _type: LogLevelType
) {
  return level
}

function defaultTitleFormatter(options: LoggerOption) {
  const { timestamp, duration } = options

  return (action: ReduxAction, time: string, took: number) => {
    const parts = ['action']

    parts.push(`%c${String(action.type)}`)
    if (timestamp) parts.push(`%c@ ${time}`)
    if (duration) parts.push(`%c(in ${took.toFixed(2)} ms)`)

    return parts.join(' ')
  }
}

function printBuffer(logEntries: LogEntry[], options: LoggerOption) {
  const { logger, actionTransformer, collapsed, colors, level, diff } = options
  const titleFormatter = defaultTitleFormatter(options)

  const isUsingDefaultFormatter = typeof titleFormatter === 'undefined'

  logEntries.forEach((logEntry, key) => {
    const { started, startedTime, action, prevState, error } = logEntry
    let { took, nextState } = logEntry
    const nextEntry = logEntries[key + 1]

    if (nextEntry) {
      nextState = nextEntry.prevState
      took = nextEntry.started - started
    }

    // Message
    const formattedAction = actionTransformer(action)
    const isCollapsed = isSome(collapsed)
      ? collapsed.value(() => nextState, action, logEntry)
      : false

    const formattedTime = formatTime(startedTime)
    const titleCSS = colors.title ? `color: ${colors.title()};` : ''
    const headerCSS = ['color: gray; font-weight: lighter;']
    headerCSS.push(titleCSS)
    if (options.timestamp) headerCSS.push('color: gray; font-weight: lighter;')
    if (options.duration) headerCSS.push('color: gray; font-weight: lighter;')
    const title = titleFormatter(formattedAction, formattedTime, took)

    if (isSome(logger)) {
    }
  })
}

export default printBuffer
