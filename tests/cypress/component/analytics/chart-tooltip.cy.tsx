import { getInstanceByDom } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { createTooltip } from '@/analytics/features/charts/options'

const TITLE = '<svg onload="alert(1)">'
const NAME = '<img src="data:," onerror="alert(2)">'
const VALUE = '<img src="data:," onerror="alert(3)">'

describe('Shared chart tooltip', () => {
  it('renders titles, series names and formatted values as text', () => {
    cy.window().then(window => cy.stub(window, 'alert').as('alert'))
    cy.mount(
      <ReactECharts
        option={{
          animation: false,
          tooltip: createTooltip((value, name) => (name === NAME ? `${value}%` : `${value} ${VALUE}`)),
          xAxis: { type: 'category', data: [TITLE] },
          yAxis: { type: 'value' },
          series: [
            { type: 'line', name: NAME, data: [25], itemStyle: { color: '#123456' } },
            { type: 'bar', name: 'Count', data: [3] },
          ],
        }}
      />,
    )

    cy.get('.echarts-for-react')
      .should($chart => expect(getInstanceByDom($chart[0])?.getOption().series).to.have.length(2))
      .then($chart => getInstanceByDom($chart[0])!.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: 0 }))

    cy.get('.echarts-for-react').within(() => {
      cy.contains('strong', TITLE).should('be.visible')
      cy.contains('span', NAME)
        .should('be.visible')
        .find('span')
        .should('have.css', 'background-color', 'rgb(18, 52, 86)')
      cy.contains('span', '25%').should('be.visible')
      cy.contains('span', `3 ${VALUE}`).should('be.visible')
      cy.get('img, svg, script').should('not.exist')
    })
    cy.get('@alert').should('not.have.been.called')
  })
})
