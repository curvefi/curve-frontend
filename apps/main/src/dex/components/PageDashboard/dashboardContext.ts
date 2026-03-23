import { createContext, useContext } from 'react'
import { DashboardDataMapper, FormValues } from '@/dex/components/PageDashboard/types'
import { ChainId, CurveApi } from '@/dex/types/main.types'
import { assert } from '@primitives/objects.utils'

type DashboardContextType = {
  activeKey: string
  rChainId: ChainId
  isLite: boolean
  curve: CurveApi | null
  chainId: ChainId | undefined
  signerAddress: string | undefined
  isLoading: boolean
  formValues: FormValues
  isValidAddress: boolean
  dashboardDataPoolIds: string[] | undefined
  dashboardDataMapper: DashboardDataMapper | undefined
  updateFormValues: (updatedFormValues: Partial<FormValues>) => void
}

export const DashboardContext = createContext<DashboardContextType | null>(null)
export const DashboardContextProvider = DashboardContext.Provider

export const useDashboardContext = () =>
  assert(useContext(DashboardContext), 'useDashboardContext has to be used within <DashboardContextProvider>')
