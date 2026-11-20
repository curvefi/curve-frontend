import AccordionDetails from '@mui/material/AccordionDetails'
import { Accordion } from '@ui/components/Accordion'
import { IS_DEVELOPMENT } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'
import type { FieldValues, UseFormReturn } from './form.types'

export const FormStateDebug = <T extends FieldValues>({
  values,
  formState,
}: Pick<UseFormReturn<T>, 'values' | 'formState'>) =>
  IS_DEVELOPMENT && (
    <Accordion title={t`Form state`} ghost size="extraSmall">
      <AccordionDetails>
        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {JSON.stringify({ values, ...formState }, null, 2).slice(2, -2)}
        </pre>
      </AccordionDetails>
    </Accordion>
  )
