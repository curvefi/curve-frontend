import { t } from '@lingui/macro'
import React from 'react'

import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'

import { Chip } from '@/ui/Typography'
import { Item } from '@/ui/Items'
import { StyledInformationSquare16 } from '@/components/PagePool/PoolDetails/PoolStats/styles'

type AdminFee = string | number | undefined

interface DaoFeeProps {
  adminFee: AdminFee
}

interface PoolParametersDaoFeesProps {
  adminFee: AdminFee
  isEymaPools: boolean
}

const DaoFee: React.FC<DaoFeeProps> = ({ adminFee }) => (
    <Item>
      {t`DAO fee:`}{' '}
      {adminFee && (
        <Chip
          isBold
          size="md"
          tooltip={t`The total fee on each trade is split in two parts: one part goes to the pool’s Liquidity Providers, another part goes to the DAO (i.e. Curve veCRV holders)`}
          tooltipProps={{
            placement: 'bottom end',
          }}
        >
          {formatNumber(adminFee, { style: 'percent', maximumFractionDigits: 4 })}
          <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
        </Chip>
      )}
    </Item>
  )

const PoolParametersDaoFees: React.FC<PoolParametersDaoFeesProps> = ({ adminFee, isEymaPools }) => {
  if (typeof adminFee === 'undefined') {
    return <></>
  }

  if (isEymaPools) {
    const parsedAdminFee = +adminFee / 2
    return (
      <>
        <DaoFee adminFee={parsedAdminFee} />
        <Item>
          {t`EYWA fee:`}{' '}
          {parsedAdminFee && (
            <Chip isBold size="md">
              {formatNumber(parsedAdminFee, { style: 'percent', ...getFractionDigitsOptions(parsedAdminFee, 4) })}
            </Chip>
          )}
        </Item>
      </>
    )
  }

  return <DaoFee adminFee={adminFee} />
}

export default PoolParametersDaoFees
