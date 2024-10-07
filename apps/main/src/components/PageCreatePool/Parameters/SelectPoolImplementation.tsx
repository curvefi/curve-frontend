import Box from '@/ui/Box'
import Checkbox from '@/ui/Checkbox'
import Icon from '@/ui/Icon'
import Tooltip from '@/ui/Tooltip'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import styled from 'styled-components'

import { IMPLEMENTATION_IDS } from '@/components/PageCreatePool/constants'
import useStore from '@/store/useStore'



type Props = {
  chainId: ChainId
}

const SelectPoolImplementation = ({ chainId }: Props) => {
  const { i18n } = useLingui()
  const { implementation, updateImplementation } = useStore((state) => state.createPool)

  const implementations = IMPLEMENTATION_IDS(chainId)

  return (
    <Wrapper>
      <TitleRow flex flexAlignItems={'center'}>
        <SectionLabel>{t`Pool Implementation`}</SectionLabel>
      </TitleRow>
      <Row>
        <StyledCheckbox
          isSelected={implementation === 0}
          onChange={() => updateImplementation(0)}
          isDisabled={false}
        >{t`Basic`}</StyledCheckbox>
        <Tooltip placement="bottom" tooltip={i18n._(implementations[0].description)}>
          <StyledInformationIcon name="InformationSquare" size={16} />
        </Tooltip>
      </Row>
      <Row>
        <StyledCheckbox
          isSelected={implementation === 3}
          onChange={() => updateImplementation(3)}
          isDisabled={false}
        >{t`Optimised`}</StyledCheckbox>
        <Tooltip placement="bottom" tooltip={i18n._(implementations[3].description)}>
          <StyledInformationIcon name="InformationSquare" size={16} />
        </Tooltip>
      </Row>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  margin-top: var(--spacing-4);
`

const TitleRow = styled(Box)`
  display: flex;
  flex-direction: row;
`

const SectionLabel = styled.p`
  margin: var(--spacing-narrow) var(--spacing-2) var(--spacing-2);
  color: var(--box--primary--color);
  font-size: var(--font-size-2);
`

const Row = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const StyledCheckbox = styled(Checkbox)`
  color: var(--box--primary--color);
`

const StyledInformationIcon = styled(Icon)`
  margin: auto auto auto var(--spacing-1);
  color: var(--box--primary--color);
`

export default SelectPoolImplementation
