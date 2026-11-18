import type { ComponentProps } from 'react'
import { ButtonExport } from '@/analytics/features/charts/components/ButtonExport'

const downloadCsv = (data: ComponentProps<typeof ButtonExport>['data']) => {
  const createObjectURL = cy.stub(URL, 'createObjectURL').returns('blob:csv')
  cy.stub(URL, 'revokeObjectURL')
  cy.stub(HTMLAnchorElement.prototype, 'click')
  cy.mount(<ButtonExport filename="chart" data={data} fullscreen />)
  cy.get('button').click()
  return cy.then(() => {
    expect(createObjectURL.callCount).to.equal(1)
    const blob = createObjectURL.firstCall.args[0] as Blob
    expect(blob.type).to.equal('text/csv;charset=utf-8')
    return blob.text()
  })
}

describe('Chart CSV export', () => {
  it('preserves column ordering, UTC seconds and numeric values', () => {
    downloadCsv({
      USDT: [
        { time: 2000, value: 0 },
        { time: 1000, value: 2 },
      ],
      USDC: [
        { time: 1000, value: -1.25 },
        { time: 2000, value: 3.5 },
      ],
    }).should('equal', '"time";"USDC";"USDT"\n1;-1.25;2\n2;3.5;0')
  })

  const escapedHeaders = [
    ['USD;=1+1', '"USD;=1+1"'],
    ['USD,=1+1', '"USD,=1+1"'],
    ['USD";=1+1', '"USD"";=1+1"'],
    ['USD\r=1+1', '"USD\r=1+1"'],
    ['USD\n=1+1', '"USD\n=1+1"'],
    ['USD\r\n=1+1', '"USD\r\n=1+1"'],
    ['USD";=1+1\r\n"x', '"USD"";=1+1\r\n""x"'],
    [' USDC', '" USDC"'],
    ['USD-USD+', '"USD-USD+"'],
  ]

  escapedHeaders.forEach(([symbol, header]) =>
    it(`contains ${JSON.stringify(symbol)} within one header`, () => {
      downloadCsv({ [symbol]: [{ time: 1000, value: 42 }] }).should('equal', `"time";${header}\n1;42`)
    }),
  )

  ;[
    '=',
    '+',
    '-',
    '@',
    '\t',
    '\r',
    '\n',
    '\t=',
    '\r=',
    '\n=',
    ' =',
    ' \t=',
    '\uFEFF=',
    '＝',
    '＋',
    '－',
    '＠',
    '　＝',
  ].forEach(prefix =>
    it(`treats a symbol beginning with ${JSON.stringify(prefix)} as text`, () => {
      const symbol = `${prefix}1+1`
      downloadCsv({ [symbol]: [{ time: 1000, value: 42 }] }).should('equal', `"time";"series: ${symbol}"\n1;42`)
    }),
  )
})
