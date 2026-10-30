import type { ReactNode } from 'react'
import { EMISSION_FACTOR_UNITS, EMISSION_FUELS, EMISSION_FUEL_LABELS, PARAMETER_LIMITS } from '../../domain/algorithmSettings'
import type { ParameterField } from '../../domain/algorithmSettings'
import { Banner, Switch } from '../../shared/ui'
import type { NumericField, ParametersState } from './useParameters'

type SettingProps = {
  id: string
  label: string
  hint: string
  error?: string
  /** Texto a la derecha de la etiqueta (valor del control deslizante). */
  value?: ReactNode
  children: ReactNode
  wide?: boolean
}

// Un ajuste: etiqueta visible, control y una pista que explica su efecto; el error la reemplaza.
function Setting({ id, label, hint, error, value, children, wide }: SettingProps) {
  return (
    <div className={`eco-setting${error ? ' eco-setting--error' : ''}`}>
      <label className="eco-setting__label" htmlFor={id}>{label}</label>
      {wide ? value : children}
      {wide ? <div className="eco-setting__wide">{children}</div> : null}
      <span className="eco-setting__hint" id={`${id}-hint`}>{error ?? hint}</span>
    </div>
  )
}

function Unit({ id, field, state, unit, label }: { id: string; field: NumericField; state: ParametersState; unit: string; label: string }) {
  const error = state.errors[field]
  return (
    <span className="eco-setting__input">
      <input
        id={id}
        className="eco-input eco-code eco-input--short"
        type="text"
        inputMode="numeric"
        value={state.text?.[field] ?? ''}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-hint`}
        aria-label={label}
        onChange={(event) => state.edit((current) => ({ ...current, [field]: event.target.value }))}
      />
      <span className="eco-muted">{unit}</span>
    </span>
  )
}

export function ParametersPanel({ state }: { state: ParametersState }) {
  if (state.loadError) {
    return (
      <Banner
        tone="error"
        title="No se pudieron cargar los parámetros."
        action={<button className="eco-btn eco-btn--secondary" type="button" onClick={state.retry}>Reintentar</button>}
      >
        {state.loadError}
      </Banner>
    )
  }
  if (!state.text) return <p role="status" className="eco-muted">Cargando parámetros…</p>
  const { text, errors } = state
  const limits = PARAMETER_LIMITS
  const factorError = (fuel: string) => errors[`factor:${fuel}` as ParameterField]

  return (
    <div className="eco-stack eco-stack--loose">
      {state.notice ? <Banner tone="success">{state.notice}</Banner> : null}
      {state.saveError ? <Banner tone="error" title="No se guardó.">{state.saveError}</Banner> : null}
      <div className="eco-columns">
        <section className="eco-columns__main eco-config" aria-label="Parámetros del algoritmo">
          <Setting
            id="param-weight"
            label="Peso del CO₂ frente al tiempo"
            hint="0 % = solo tiempo · 100 % = solo emisiones (Green VRP)"
            error={errors.co2Weight}
            wide
            value={<span className="eco-code">{Number.isFinite(Number(text.co2Weight)) ? text.co2Weight : '—'} % CO₂</span>}
          >
            <input
              id="param-weight"
              className="eco-range"
              type="range"
              min={limits.co2Weight.min}
              max={limits.co2Weight.max}
              value={Number.isFinite(Number(text.co2Weight)) && text.co2Weight.trim() !== '' ? text.co2Weight : 0}
              aria-describedby="param-weight-hint"
              onChange={(event) => state.edit((current) => ({ ...current, co2Weight: event.target.value }))}
            />
          </Setting>
          <Setting id="param-seconds" label="Tiempo máximo de cálculo" hint="Límite de 5 a 45 segundos para generar una propuesta" error={errors.maxSeconds}>
            <Unit id="param-seconds" field="maxSeconds" state={state} unit="s" label="Tiempo máximo de cálculo en segundos" />
          </Setting>
          <Setting id="param-load" label="Carga máxima por vehículo" hint="Margen de seguridad sobre la capacidad registrada" error={errors.maxLoadPercent}>
            <Unit id="param-load" field="maxLoadPercent" state={state} unit="%" label="Carga máxima en porcentaje" />
          </Setting>
          <Setting id="param-slack" label="Holgura de ventana" hint="Antes del fin de la ventana, el pedido se marca «en riesgo»" error={errors.windowSlackMinutes}>
            <Unit id="param-slack" field="windowSlackMinutes" state={state} unit="min" label="Holgura de ventana en minutos" />
          </Setting>
          <div className="eco-setting">
            <span className="eco-setting__label" id="param-auto-label">Reoptimización automática</span>
            <Switch label="Reoptimización automática" checked={text.autoReoptimize} onChange={(checked) => state.edit((current) => ({ ...current, autoReoptimize: checked }))} />
            <span className="eco-setting__hint">Preferencia guardada para la planificación; las propuestas actuales se generan manualmente</span>
          </div>
        </section>

        <section className="eco-columns__aside" aria-labelledby="fx-title">
          <div className="eco-section-head"><h2 id="fx-title">Factores de emisión</h2></div>
          <div className="eco-list">
            {EMISSION_FUELS.map((fuel) => {
              const id = `factor-${fuel}`
              const error = factorError(fuel)
              const empty = text.factors[fuel].trim() === ''
              return (
                <div key={fuel} className={`eco-row eco-row--factor${error ? ' eco-row--error' : ''}`}>
                  <label htmlFor={id}>{EMISSION_FUEL_LABELS[fuel]}</label>
                  <span className="eco-setting__input">
                    <input
                      id={id}
                      className="eco-input eco-code eco-input--short"
                      type="text"
                      inputMode="decimal"
                      placeholder="por definir"
                      value={text.factors[fuel]}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? `${id}-error` : undefined}
                      onChange={(event) => state.edit((current) => ({ ...current, factors: { ...current.factors, [fuel]: event.target.value } }))}
                    />
                    <span className="eco-muted">{EMISSION_FACTOR_UNITS[fuel]}</span>
                  </span>
                  {error ? <span className="eco-field__hint eco-row__full" id={`${id}-error`}>{error}</span> : null}
                  {empty && !error ? <span className="eco-sr">sin definir</span> : null}
                </div>
              )
            })}
          </div>
          <p className="eco-muted eco-flush eco-note">
            Registra los factores que utiliza tu organización. Un factor sin definir no se usa para calcular emisiones.
          </p>
        </section>
      </div>
    </div>
  )
}
