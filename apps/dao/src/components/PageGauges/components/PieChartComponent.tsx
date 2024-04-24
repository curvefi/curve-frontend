import styled from 'styled-components'
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from 'recharts'

type Props = {
  data: PricesGaugeOverviewData[]
}

const PieChartComponent = ({ data }: Props) => {
  const height = 500

  return (
    <Wrapper chartHeight={height}>
      <InnerWrapper>
        <ResponsiveContainer width={'99%'} height={height}>
          <PieChart title="Gauge vote distribution" width={1000} height={1000}>
            <Pie
              dataKey="value"
              nameKey="address"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </InnerWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ chartHeight: number }>`
  width: 100%;
  height: ${({ chartHeight }) => `${chartHeight}px`};
  position: relative;
`

const InnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`

export default PieChartComponent
