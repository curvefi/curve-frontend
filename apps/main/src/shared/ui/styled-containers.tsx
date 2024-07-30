import styled from 'styled-components'

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
  max-width: 480px;
`
