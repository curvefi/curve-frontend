// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_device_detection
export function getIsMobile() {
  let hasTouchScreen

  if ('maxTouchPoints' in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0
  } else if ('msMaxTouchPoints' in navigator) {
    // @ts-ignore
    hasTouchScreen = navigator.msMaxTouchPoints > 0
  } else {
    const mQ = matchMedia?.('(pointer:coarse)')
    if (mQ?.media === '(pointer:coarse)') {
      // @ts-ignore
      hasTouchScreen = mQ.matches
    } else if ('orientation' in window) {
      hasTouchScreen = true // deprecated, but good fallback
    } else {
      // Only as a last resort, fall back to user agent sniffing
      // @ts-ignore
      const UA = navigator.userAgent
      hasTouchScreen =
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
    }
  }

  return hasTouchScreen
}

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
