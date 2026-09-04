import { FormTabs, type FormTab } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import { t } from '@ui/lib/i18n'
import { RefuelForm, type RefuelFormParams } from './components/RefuelForm'

const RefuelMenu = [
  {
    value: 'refuel',
    label: t`Refuel setup`,
    component: RefuelForm,
  },
] satisfies FormTab<RefuelFormParams>[]

export const RefuelFormTabs = ({ ...params }: RefuelFormParams) => <FormTabs params={params} menu={RefuelMenu} />
