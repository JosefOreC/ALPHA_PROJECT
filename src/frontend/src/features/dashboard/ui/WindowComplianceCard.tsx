import type { WindowCompliance } from '../domain/types'
import { formatInt } from './format'
import { NoData, SkeletonGroup, type CardState } from './shared'

interface Props {
  state: CardState
  compliance?: WindowCompliance
}

const TITLE_ID = 'dash-windows-title'

export function WindowComplianceCard({ state, compliance }: Props) {
  return (
    <section aria-labelledby={TITLE_ID} className="dash-card dash-card--windows">
      <h2 id={TITLE_ID} className="dash-card__title">
        Cumplimiento de ventanas horarias
      </h2>
      {state === 'loading' ? <SkeletonGroup lines={[[44, '55%'], [12], [16, '70%']]} /> : null}
      {state === 'error' || (state === 'data' && !compliance) ? (
        <NoData trailing={<span className="dash-figure__unit">%</span>} />
      ) : null}
      {state === 'data' && compliance ? <ComplianceBody compliance={compliance} /> : null}
    </section>
  )
}

function ComplianceBody({ compliance }: { compliance: WindowCompliance }) {
  const value = compliance.percentage ?? 0
  const shown = value.toFixed(1)
  const { target } = compliance
  const showGoal = target != null

  return (
    <>
      <div className="dash-figure">
        <span className="dash-figure__value">{shown}</span>
        <span className="dash-figure__unit">%</span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(shown)}
        aria-valuetext={`${shown} % dentro de ventana${showGoal ? `, meta ${target} %` : ''}`}
        className="dash-meter"
      >
        <span className="dash-meter__fill" style={{ width: `${value}%` }} />
        {showGoal ? (
          <span
            aria-hidden="true"
            className="dash-meter__goal"
            style={{ left: `calc(${target}% - 1px)` }}
          />
        ) : null}
      </div>
      <div aria-hidden="true" className="dash-meter__scale">
        <span>0 %</span>
        {showGoal ? <span>Meta {target} %</span> : null}
        <span>100 %</span>
      </div>
      <p className="dash-note">
        <span className="dash-num">{formatInt(compliance.withinWindow)}</span> de{' '}
        <span className="dash-num">{formatInt(compliance.evaluated)}</span> entregas a tiempo
      </p>
    </>
  )
}
