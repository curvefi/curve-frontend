import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import { styled } from 'styled-components'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { Checkbox } from '@ui/Checkbox'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type PriceImpact = { priceImpact: string; swapFrom: string; swapTo: string }

export function DialogFormWarning({
  health,
  priceImpact,
  confirmed,
  setConfirmed,
}: {
  health?: { warningTitle: string; warning: string } | null
  priceImpact?: PriceImpact | null
  confirmed: boolean
  setConfirmed: Dispatch<SetStateAction<boolean>>
}) {
  const getHighPriceImpactWarning = useCallback((priceImpact: PriceImpact) => {
    const resp = { title: '', warning: '' }
    const { priceImpact: priceImpactPercent, swapFrom, swapTo } = priceImpact
    resp.title = t`High price impact!`
    resp.warning = t`There is a price impact of ${formatNumber(priceImpactPercent, {
      style: 'percent',
      maximumSignificantDigits: 4,
    })} when swapping from ${swapFrom} to ${swapTo}.`
    return resp
  }, [])

  const { title, warning } = useMemo(() => {
    if (health && priceImpact) {
      return {
        title: t`Please confirm the warnings below:`,
        warning: [health.warning, getHighPriceImpactWarning(priceImpact).warning],
      }
    } else if (health) {
      return { title: health.warningTitle, warning: health.warning }
    } else if (priceImpact) {
      return getHighPriceImpactWarning(priceImpact)
    } else {
      return { title: '', warning: '' }
    }
  }, [getHighPriceImpactWarning, health, priceImpact])

  return (
    <>
      <AlertBox alertType="error">
        <Box grid gridGap={2}>
          <strong>{title}</strong>

          {Array.isArray(warning) ? (
            <Warnings>
              {warning.map((w) => (
                <WarningItem key={w}>{w}</WarningItem>
              ))}
            </Warnings>
          ) : (
            warning
          )}
        </Box>
      </AlertBox>

      <StyledCheckbox isSelected={confirmed} onChange={setConfirmed}>
        {t`Confirm warning to proceed.`}
      </StyledCheckbox>
    </>
  )
}

const StyledCheckbox = styled(Checkbox)`
  margin-top: 1rem;
`

const Warnings = styled.ol`
  margin-left: var(--spacing-3);
`

const WarningItem = styled.li`
  list-style-type: disc;
  margin-bottom: var(--spacing-1);
`
