import styled from 'styled-components'
import isPropValid from '@emotion/is-prop-valid'

/**
 * This implements the default behavior from styled-components v5
 * For HTML elements, forward the prop if it is a valid HTML attribute. For other elements, forward all props.
 * TODO: Use transient props: https://styled-components.com/docs/faqs#transient-props-since-5.1
 */
export const shouldForwardProp = (propName: string, target: unknown) =>
  typeof target !== 'string' || isPropValid(propName)

export const FlexContainer = styled.div`
  display: flex;
  gap: var(--spacing-3);
  align-content: center;
  justify-content: space-between;
`

export const GroupedFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

export const FormFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  width: 100%;
`

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  width: 100%;
`
