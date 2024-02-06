import type { Params } from 'react-router'

const Dao = ({
  rChainId,
  params,
  curve,
}: {
  rChainId: ChainId
  params: Readonly<Params<string>>
  curve: CurveApi | null
}) => {
  return (
    <>
      Dao <pre>{JSON.stringify({ rChainId, cChainId: curve?.chainId, params })}</pre>
    </>
  )
}

export default Dao
