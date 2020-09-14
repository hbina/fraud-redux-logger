import { Diff, diff as differ, DiffEdit } from 'deep-diff'
import { DiffKind } from './types'

// https://github.com/flitbit/diff#differences
const dictionary = {
  E: {
    color: '#2196F3',
    text: 'CHANGED:'
  },
  N: {
    color: '#4CAF50',
    text: 'ADDED:'
  },
  D: {
    color: '#F44336',
    text: 'DELETED:'
  },
  A: {
    color: '#2196F3',
    text: 'ARRAY:'
  }
}

export function style(kind: DiffKind) {
  return `color: ${dictionary[kind].color}; font-weight: bold`
}

/// TODO :: The original implementation assumes that `path` always exist,
///         maybe  we should provide a Proxy type with that guarantee.
export function renderDiff<S>(diff: Diff<S, S>) {
  switch (diff.kind) {
    case 'E': {
      const { path, lhs, rhs } = diff
      return path ? [path.join('.'), lhs, '→', rhs] : []
    }
    case 'N': {
      const { path, rhs } = diff
      return path ? [path.join('.'), rhs] : []
    }
    case 'D': {
      const { path } = diff
      return path ? [path.join('.')] : []
    }
    case 'A': {
      const { path, index, item } = diff
      return path ? [`${path.join('.')}[${index}]`, item] : []
    }
    default:
      return []
  }
}

export default function diffLogger<S>(
  prevState: S,
  newState: S,
  logger: Console,
  isCollapsed: boolean
) {
  const diff = differ(prevState, newState)

  try {
    if (isCollapsed) {
      logger.groupCollapsed('diff')
    } else {
      logger.group('diff')
    }
  } catch (e) {
    logger.log('diff')
  }

  if (diff) {
    diff.forEach(elem => {
      const { kind } = elem
      const output = renderDiff(elem)

      logger.log(`%c ${dictionary[kind].text}`, style(kind), ...output)
    })
  } else {
    logger.log('—— no diff ——')
  }

  try {
    logger.groupEnd()
  } catch (e) {
    logger.log('—— diff end —— ')
  }
}
