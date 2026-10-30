import { DistritoIcon } from '../../../shared/ui'
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
    <form role="search" aria-label="Filtrar indicadores" className="eco-filterbar" onSubmit={(e) => e.preventDefault()}>
      <div className="eco-field eco-field--inline">
        <label htmlFor="dash-district">
          <DistritoIcon />
          Distrito
        </label>
        <select id="dash-district" className="eco-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <span className="eco-tag eco-tag--eco">
        Mostrando: <strong>{current}</strong>
      </span>
    </form>
  )
}
