import { afterEach, describe, expect, it, vi } from 'vitest'
import { getHashRedirectUrl } from './route-redirects'

const redirect = (pathname: string, search: Record<string, string>, hash = '') => {
  const url = new URL(pathname, 'https://curve.finance')
  url.search = new URLSearchParams(search).toString()
  url.hash = hash
  vi.stubGlobal('window', { location: url })
  return getHashRedirectUrl({ pathname, search } as Parameters<typeof getHashRedirectUrl>[0], 'ethereum')
}

afterEach(() => vi.unstubAllGlobals())

describe('getHashRedirectUrl', () => {
  it('preserves query parameters on the root redirect', () => {
    expect(redirect('/', { utm: 'qwerty' })).toBe('/dex/ethereum/swap?utm=qwerty')
    expect(redirect('/', {})).toBe('/dex/ethereum/swap')
  })

  it('preserves query parameters on legacy redirects', () => {
    expect(redirect('/integrations', { utm: 'qwerty' })).toBe('/dex/ethereum/integrations/?utm=qwerty')
    expect(redirect('/dex/swap', { utm: 'qwerty' })).toBe('/dex/ethereum/swap/?utm=qwerty')
    expect(redirect('/', { utm: 'qwerty' }, '#/ethereum/create-pool')).toBe('/dex/ethereum/create-pool?utm=qwerty')
  })
})
