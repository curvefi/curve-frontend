import styled, { css } from 'styled-components'

export const RiskWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--table--background-color);
  margin-bottom: var(--footer-create-pool-height);
  padding: var(--spacing-4) var(--spacing-3);
  max-width: calc(44.875rem + var(--spacing-4) + var(--spacing-4));
  gap: var(--spacing-3);
  margin: auto;
  .extra-margin {
    margin-bottom: var(--spacing-2);
  }
  @media screen and (min-width: 43.75rem) {
    padding: var(--spacing-4);
  }
`

export const RiskTitle = styled.h1`
  border-bottom: 2px solid var(--gray-500a25);
  padding-bottom: var(--spacing-3);
`

export const RiskSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-2);
`

export const RiskSubHeadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`

export const RiskSubTitle = styled.h2`
  border-bottom: 2px solid var(--gray-500a25);
  padding-bottom: var(--spacing-2);
`

export const RiskSubHeading = styled.h3`
  font-size: var(--font-size-3);
`

export const RiskParagraph = styled.p`
  line-height: 1.5;
  font-size: var(--font-size-3);
`

export const RiskComment = styled(RiskParagraph)`
  font-style: italic;
`

const cssListStyles = css`
  margin-left: var(--spacing-normal);
`

export const RiskUnOrderList = styled.ul`
  ${cssListStyles};
`

export const RiskOrderList = styled.ol`
  ${cssListStyles};
`

export const RiskListItem = styled.li`
  list-style: revert;
  margin-bottom: var(--spacing-narrow);

  > *:first-child {
    display: inline-block;
  }
`
