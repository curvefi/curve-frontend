import Fuse from 'fuse.js'
import { useCallback, useState } from 'react'
import { useFilter } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import { ComboBox } from '@/dao/components/ComboBoxSelectGauge/ComboBox'
import { ComboBoxSelectedGaugeButton } from '@/dao/components/ComboBoxSelectGauge/ComboBoxSelectedGaugeButton'
import type { EndsWith } from '@/dao/components/ComboBoxSelectGauge/types'
import { useUserGaugeWeightVotesQuery } from '@/dao/entities/user-gauge-weight-votes'
import { useGauges } from '@/dao/queries/gauges.query'
import { useStore } from '@/dao/store/useStore'
import { GaugeFormattedData } from '@/dao/types/dao.types'
import { delayAction } from '@/dao/utils'
import { ModalDialog } from '@ui/Dialog/ModalDialog'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { Chain } from '@ui-kit/utils/network'

export const ComboBoxGauges = ({
  disabled,
  listBoxHeight,
  testId,
  title,
  onOpen,
}: {
  disabled?: boolean
  listBoxHeight?: string
  testId?: string
  title: string
  onOpen?: () => void
}) => {
  const { endsWith } = useFilter({ sensitivity: 'base' })
  const overlayTriggerState = useOverlayTriggerState({})

  const userAddress = useStore((state) => state.user.userAddress)
  const selectedGauge = useStore((state) => state.gauges.selectedGauge)
  const setSelectedGauge = useStore((state) => state.gauges.setSelectedGauge)
  const setStateByKey = useStore((state) => state.gauges.setStateByKey)
  const isMobile = useIsMobile()

  const { data: gaugeMapper } = useGauges({})

  const { data: userGaugeWeightVotes } = useUserGaugeWeightVotesQuery({
    chainId: Chain.Ethereum, // DAO is only used on mainnet
    userAddress: userAddress ?? '',
  })
  const gauges = Object.values(gaugeMapper ?? {})
    .filter(
      (gauge) =>
        !userGaugeWeightVotes?.gauges.some(
          (userGauge) =>
            userGauge.gaugeAddress.toLowerCase() ===
            (gauge.effective_address?.toLowerCase() ?? gauge.address.toLowerCase()),
        ),
    )
    .sort((a, b) => b.gauge_weight - a.gauge_weight)

  const [result, setResult] = useState<GaugeFormattedData[] | undefined>()

  const handleInpChange = useCallback(
    (filterValue: string, gauges: GaugeFormattedData[] | undefined) => {
      setStateByKey('selectGaugeFilterValue', filterValue)
      const result = filterValue && gauges && gauges.length > 0 ? _filter(filterValue, endsWith, gauges) : gauges
      setResult(result)
    },
    [endsWith, setStateByKey],
  )

  const handleOnSelectChange = (gaugeAddress: string) => {
    const gauge = gaugeMapper?.[gaugeAddress.toLowerCase()]
    if (gauge) {
      setSelectedGauge(gauge)
      handleClose()
    }
  }

  const handleOpen = () => {
    if (typeof onOpen === 'function') onOpen()

    setResult(gauges)
    setStateByKey('selectGaugeFilterValue', '')
    overlayTriggerState.open()
  }

  const handleClose = () => {
    if (isMobile) {
      delayAction(overlayTriggerState.close)
    } else {
      overlayTriggerState.close()
    }
  }

  return (
    <>
      <ComboBoxSelectedGaugeButton
        variant={selectedGauge ? 'outlined' : 'filled'}
        isDisabled={disabled}
        testId={testId}
        onPress={handleOpen}
      >
        {t`Add Gauge`}
      </ComboBoxSelectedGaugeButton>
      {overlayTriggerState.isOpen && (
        <ModalDialog
          testId={testId}
          title={title}
          noContentPadding
          state={{ ...overlayTriggerState, close: handleClose }}
        >
          <ComboBox
            testId={testId}
            dialogClose={handleClose}
            listBoxHeight={listBoxHeight}
            result={result}
            selectedGauge={selectedGauge}
            showInpSearch={true}
            gauges={gauges}
            handleInpChange={handleInpChange}
            handleOnSelectChange={handleOnSelectChange}
          />
        </ModalDialog>
      )}
    </>
  )
}

function _filter(filterValue: string, endsWith: EndsWith, gauges: GaugeFormattedData[]) {
  const fuse = new Fuse<GaugeFormattedData>(gauges, {
    ignoreLocation: true,
    threshold: 0.01,
    keys: ['title', 'address'],
  })

  const result = fuse.search(filterValue)

  if (result.length > 0) {
    return result.map((r) => r.item)
  } else {
    return gauges.filter((item) => endsWith(item.address, filterValue))
  }
}
