import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusdYield'

export type DepositWithdrawModule = 'deposit' | 'withdraw'

export type YieldKeys = Extract<keyof ScrvUsdYieldWithAverages, 'proj_apy' | 'proj_apy_7d_avg' | 'proj_apy_total_avg'>

export type StatisticsChart = 'savingsRate' | 'distributions'
