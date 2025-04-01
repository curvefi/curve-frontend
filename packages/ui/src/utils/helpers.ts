export function delayAction<T>(cb: T) {
  if (typeof cb === 'function') {
    setTimeout(() => cb(), 100)
  }
}

export function getIsFullScreen() {
  const classList = document?.body?.classList
  return classList?.contains('page-small-x') || classList?.contains('page-small-xx')
}

export function shortenAccount(account: string, visibleLength = 4) {
  if (account.length === 42) {
    return (
      account.slice(0, account.startsWith('0x') ? visibleLength + 2 : visibleLength) +
      '…' +
      account.slice(account.length - visibleLength)
    )
  } else {
    return account
  }
}
