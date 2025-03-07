import { DAO_ROUTES } from '@ui-kit/shared/routes'
export { CONNECT_STAGE } from '@ui/utils/utilsConnectState'

export const NETWORK_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const ETHEREUM_CHAIN_ID = 1

export const ROUTE = {
  ...DAO_ROUTES,
  PAGE_VECRV_CREATE: '/vecrv/create',
  PAGE_VECRV_ADJUST_CRV: '/vecrv/adjust_crv',
  PAGE_VECRV_ADJUST_DATE: '/vecrv/adjust_date',
  PAGE_404: '/404',
} as const

export const TOP_HOLDERS: Record<string, { address: string; title: string }> = {
  ['0x989aeb4d175e16225e39e87d0d97a3360524ad80']: {
    address: '0x989aeb4d175e16225e39e87d0d97a3360524ad80',
    title: 'Convex',
  },
  ['0xf147b8125d2ef93fb6965db97d6746952a133934']: {
    address: '0xf147b8125d2ef93fb6965db97d6746952a133934',
    title: 'Yearn',
  },
  ['0x52f541764e6e90eebc5c21ff570de0e2d63766b6']: {
    address: '0x52f541764e6e90eebc5c21ff570de0e2d63766b6',
    title: 'Stake DAO',
  },
}
