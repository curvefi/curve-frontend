import Head from 'next/head'

export type Props = {
  title?: string
}

const DocumentHead = ({ title }: Props) => {
  return (
    <Head>
      <title>{title ? `${title} - Curve DAO` : 'Curve DAO'}</title>
      <meta name="viewport" content="initial-scale=1, minimum-scale=1, width=device-width" />
    </Head>
  )
}

export default DocumentHead
