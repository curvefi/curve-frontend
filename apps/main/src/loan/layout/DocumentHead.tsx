export type Props = {
  title?: string
}

const DocumentHead = ({ title }: Props) => (
  <>
    <title>{title ? `${title} - Curve` : 'Curve.fi'}</title>
  </>
)

export default DocumentHead
