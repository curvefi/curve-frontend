import React from 'react'

import { usePoolContext } from '@/components/PagePool/contextPool'

import AlertBox from '@/ui/AlertBox'

const AlertPool: React.FC = () => {
  const { poolAlert } = usePoolContext()

  return (
    <>
      {poolAlert && poolAlert?.isInformationOnlyAndShowInForm && (
        <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
      )}
    </>
  )
}

export default AlertPool
