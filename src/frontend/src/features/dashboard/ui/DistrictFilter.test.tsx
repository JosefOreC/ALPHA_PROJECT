import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { districts } from '../test/fakes'
import { DistrictFilter } from './DistrictFilter'

describe('DistrictFilter', () => {
  it('lists all districts first and shows the current selection', () => {
    render(<DistrictFilter districts={districts} value="150103" onChange={() => {}} />)

    const options = screen.getAllByRole('option').map((o) => o.textContent)
    expect(options).toEqual(['Todos los distritos', 'Ate', 'Miraflores'])
    expect(screen.getByLabelText('Distrito')).toHaveValue('150103')
    expect(screen.getByText('Mostrando:', { exact: false })).toHaveTextContent('Mostrando: Ate')
  })

  it('reports the chosen district id', async () => {
    const chosen: string[] = []
    render(<DistrictFilter districts={districts} value="" onChange={(id) => chosen.push(id)} />)

    await userEvent.selectOptions(screen.getByLabelText('Distrito'), 'Miraflores')

    expect(chosen).toEqual(['150122'])
  })
})
