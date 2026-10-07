import { type FormTab, FormTabs } from '@ui/features/forms/tabs/FormTabs'
import { t } from '@ui/lib/i18n'
import { MigrationForm, type MigrationFormProps } from './MigrationForm'

const MigrationMenu = [
  { value: 'migrate', label: t`Migrate`, component: MigrationForm },
] satisfies FormTab<MigrationFormProps>[]

export const MigrationFormTabs = (params: MigrationFormProps) => <FormTabs params={params} menu={MigrationMenu} />
