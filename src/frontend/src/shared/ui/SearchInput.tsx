import { useId } from 'react'
import { SearchIcon } from './icons'

type SearchInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  shortcut?: string
  id?: string
}

export function SearchInput({ label, value, onChange, placeholder, shortcut, id: givenId }: SearchInputProps) {
  const generated = useId()
  const id = givenId ?? generated
  return (
    <div className="eco-search">
      <label className="eco-sr" htmlFor={id}>
        {label}
      </label>
      <SearchIcon />
      <input
        id={id}
        className="eco-search__input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {shortcut ? (
        <span className="eco-kbd" aria-hidden="true">
          {shortcut}
        </span>
      ) : null}
    </div>
  )
}
