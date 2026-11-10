import { AdvancedDepositForm } from './AdvancedDepositForm'
import { OneCoinDepositForm } from './OneCoinDepositForm'

export const depositForms = { 'one-coin': OneCoinDepositForm, advanced: AdvancedDepositForm }

export type DepositType = keyof typeof depositForms
