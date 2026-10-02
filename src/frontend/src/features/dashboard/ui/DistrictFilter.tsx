import { ALL_DISTRICTS, type District } from '../domain/types'

interface Props {
  districts: District[]
  value: string
  onChange: (districtId: string) => void
}

export function DistrictFilter({ districts, value, onChange }: Props) {
  const options = [ALL_DISTRICTS, ...districts]
  const current = options.find((d) => d.id === value)?.name ?? value

  return (
    <form
      role="search"
      aria-label="Filtrar indicadores"
      className="dash-filter"
      onSubmit={(e) => e.preventDefault()}
    >
      <label htmlFor="dash-district">Distrito</label>
      <select
        id="dash-district"
        className="dash-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <span className="dash-chip">
        Mostrando: <strong>{current}</strong>
      </span>
    </form>
  )
}
