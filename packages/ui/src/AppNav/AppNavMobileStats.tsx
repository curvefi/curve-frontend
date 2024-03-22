import React from 'react'
import styled from 'styled-components'

const AppNavMobileStats = ({ stats }: { stats: { label: string; value: string }[] }) => {
  return (
    <>
      {stats.map(({ label, value }) => {
        return (
          <AppStat key={label}>
            <AppStatTitle>{label}</AppStatTitle> {value}
          </AppStat>
        )
      })}
    </>
  )
}

const AppStat = styled.div`
  display: grid;
  margin-bottom: var(--spacing-3);
`

const AppStatTitle = styled.strong`
  font-size: var(--font-size-4);
`

export default AppNavMobileStats
