import { Fragment } from 'react'
import { styled } from 'styled-components'
import { t } from '@evm-ui/lib/i18n'
import { Chain } from '@primitives/network.utils'
import { ExternalLink } from '@legacy-ui/Link'
import { maybe, type PartialRecord } from '@primitives/objects.utils'

const MISSING_POOLS: PartialRecord<number, { name: string; url: string }[]> = {
  [Chain.Ethereum]: [
    { name: 'linkusd', url: 'https://classic.curve.finance/linkusd/withdraw' },
    { name: 'tricrypto', url: 'https://classic.curve.finance/tricrypto/withdraw' },
  ],
  [Chain.Polygon]: [
    { name: 'atricrypto', url: 'https://polygon.curve.finance/atricrypto/withdraw' },
    { name: 'atricrypto2', url: 'https://polygon.curve.finance/atricrypto2/withdraw' },
  ],
}

export const ClassicPoolsOnlyDescription = ({ chainId }: { chainId: number }) =>
  maybe(MISSING_POOLS[chainId], missingPools => (
    <MissingPoolDescription>
      {t`*This UI does not support the following pools:`}{' '}
      {missingPools.map((pool, idx) => (
        <Fragment key={pool.name}>
          {idx > 0 && ', '}
          <ExternalLink $noStyles href={pool.url}>
            {pool.name}
          </ExternalLink>
        </Fragment>
      ))}
      {t`. Please click on the pool name to view them`}
    </MissingPoolDescription>
  ))

const MissingPoolDescription = styled.p`
  padding: 1rem;
`
