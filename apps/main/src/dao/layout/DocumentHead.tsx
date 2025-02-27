export type Props = {
  title?: string
}

const DocumentHead = ({ title }: Props) => (
  <>
    <title>{title ? `${title} - Curve DAO` : 'Curve DAO'}</title>
    <meta name="viewport" content="initial-scale=1, minimum-scale=1, width=device-width" />
  </>
)

export default DocumentHead
