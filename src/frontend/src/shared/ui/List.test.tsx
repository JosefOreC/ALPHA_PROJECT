import { render, screen, within } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { List, ListGroup, ListRow } from './List'

function table(expanded = true) {
  return render(
    <List label="Emisiones por distrito">
      <ListGroup heading="Ate" count={2} expanded={expanded} onToggle={() => undefined}>
        <ListRow head columns="1fr 1fr">
          <span>Distrito</span>
          <span>Emitido</span>
        </ListRow>
        <ListRow columns="1fr 1fr" onSelect={() => undefined}>
          <span>Ate</span>
          <span>12 kg</span>
        </ListRow>
      </ListGroup>
    </List>,
  )
}

describe('List: estructura de cuadrícula accesible (WCAG 1.3.1)', () => {
  it('las filas de encabezado contienen encabezados de columna y las demás, celdas', () => {
    table()
    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(['Distrito', 'Emitido'])
    expect(within(rows[2]).getAllByRole('gridcell').map(cell => cell.textContent)).toEqual(['Ate', '12 kg'])
  })

  it('el botón de cada grupo vive dentro de una fila con una celda', () => {
    table(false)
    const [groupRow] = screen.getAllByRole('row')
    expect(within(within(groupRow).getByRole('gridcell')).getByRole('button', { name: /Ate/ })).toHaveAttribute('aria-expanded', 'false')
  })

  it('axe no detecta hijos ARIA requeridos ausentes ni no permitidos', async () => {
    const { container } = table()
    const result = await axe.run(container, { runOnly: { type: 'rule', values: ['aria-required-children', 'aria-required-parent'] } })
    expect(result.violations).toEqual([])
  })
})
