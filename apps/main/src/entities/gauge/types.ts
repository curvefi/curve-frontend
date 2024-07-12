import { gaugeKeys } from './query-keys'

export type GaugeQueryKeys = ReturnType<(typeof gaugeKeys)[keyof typeof gaugeKeys]>

export type GaugeQueryKeyType<K extends keyof typeof gaugeKeys> = ReturnType<(typeof gaugeKeys)[K]>

export type AddRewardTokenParams = {
  token: string
  distributor: string
}
