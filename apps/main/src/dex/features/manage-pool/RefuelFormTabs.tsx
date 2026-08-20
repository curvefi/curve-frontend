import { t } from '@evm-ui/lib/i18n'
import { FormTabs, type FormTab } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import { RefuelForm, type RefuelFormParams } from './components/RefuelForm'

const RefuelMenu = [
  {
    value: 'refuel',
    label: t`Refuel setup`,
    component: RefuelForm,
  },
] satisfies FormTab<RefuelFormParams>[]

export const RefuelFormTabs = ({ ...params }: RefuelFormParams) => <FormTabs params={params} menu={RefuelMenu} />
