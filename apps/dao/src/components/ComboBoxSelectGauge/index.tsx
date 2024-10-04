import type { EndsWith } from '@/components/ComboBoxSelectGauge/types'

import Fuse from 'fuse.js'
import React, { useCallback, useEffect, useState } from 'react'
import { useFilter } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import { t } from '@lingui/macro'

import { delayAction } from '@/utils'
import useStore from '@/store/useStore'
import networks from '@/networks'

import ComboBox from '@/components/ComboBoxSelectGauge/ComboBox'
import ComboBoxSelectedGaugeButton from '@/components/ComboBoxSelectGauge/ComboBoxSelectedGaugeButton'
import ModalDialog from '@/ui/Dialog'

const ComboBoxGauges = ({
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

  const { userAddress, userGaugeVoteWeightsMapper } = useStore((state) => state.user)
  const { selectedGauge, setSelectedGauge, setStateByKey, gaugeMapper } = useStore((state) => state.gauges)
  const isMobile = useStore((state) => state.isMobile)

  const userGaugeVoteWeights = userGaugeVoteWeightsMapper[userAddress ?? '']
  const gauges = Object.values(gaugeMapper)
    .filter(
      (gauge) =>
        !userGaugeVoteWeights?.data.gauges.some(
          (userGauge) => userGauge.gaugeAddress.toLowerCase() === gauge.address.toLowerCase()
        )
    )
    .sort((a, b) => b.gauge_weight - a.gauge_weight)

  const imageBaseUrl = networks[1].imageBaseUrl

  const [result, setResult] = useState<GaugeFormattedData[] | undefined>()

  const handleInpChange = useCallback(
    (filterValue: string, gauges: GaugeFormattedData[] | undefined) => {
      setStateByKey('selectGaugeFilterValue', filterValue)
      const result = filterValue && gauges && gauges.length > 0 ? _filter(filterValue, endsWith, gauges) : gauges
      setResult(result)
    },
    [endsWith, setStateByKey]
  )

  const handleOnSelectChange = (gaugeAddress: string) => {
    setSelectedGauge(gaugeMapper[gaugeAddress.toLowerCase()])
    handleClose()
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
            imageBaseUrl={imageBaseUrl}
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

export default ComboBoxGauges
