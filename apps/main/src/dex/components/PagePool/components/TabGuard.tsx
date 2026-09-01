import type { ComponentType } from 'react'
import type { TransferTabsParams } from '@/dex/components/PagePool/types'
import type { PoolAlert } from '@/dex/types/main.types'
import { AlertBox } from '@legacy-ui/AlertBox'
import type { Falsy } from '@primitives/objects.utils'

/** Renders a tab-level alert when present, otherwise renders the tab form component. */
export const TabGuard = ({
  alert,
  otherwise: Otherwise,
  ...props
}: TransferTabsParams & {
  alert: (props: TransferTabsParams) => PoolAlert | Falsy
  otherwise: ComponentType<TransferTabsParams>
}) => {
  const tabAlert = alert(props)
  return tabAlert ? <AlertBox {...tabAlert}>{tabAlert.message}</AlertBox> : <Otherwise {...props} />
}
