import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { TabList } from './TabList'

function Sample() {
  const [selected, select] = useState(0)
  return <TabList label="Prueba">{['Uno', 'Dos', 'Tres'].map((name, i) => <button role="tab" key={name} aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => select(i)}>{name}</button>)}</TabList>
}
it('navega por flechas, Inicio y Fin, activando la pestaña enfocada', () => {
  render(<Sample />)
  const [one, two, three] = screen.getAllByRole('tab')
  one.focus()
  fireEvent.keyDown(one, { key: 'ArrowRight' })
  expect(two).toHaveFocus()
  expect(two).toHaveAttribute('aria-selected', 'true')
  fireEvent.keyDown(two, { key: 'End' }); expect(three).toHaveFocus()
  fireEvent.keyDown(three, { key: 'ArrowRight' }); expect(one).toHaveFocus()
  fireEvent.keyDown(one, { key: 'ArrowLeft' }); expect(three).toHaveFocus()
  fireEvent.keyDown(three, { key: 'Home' }); expect(one).toHaveFocus()
  fireEvent.keyDown(one, { key: 'Enter' }); expect(one).toHaveFocus()
})
