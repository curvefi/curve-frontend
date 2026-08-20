import Button from '@mui/material/Button'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { CreateVoteModal } from './CreateVoteModal'

export const CreateVote = () => {
  const [isModalOpen, openModal, closeModal] = useSwitch(false)

  return (
    <>
      <Button size="small" onClick={openModal}>{t`Create gauge vote`}</Button>
      <CreateVoteModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}
