import { useEffect, useMemo, useState } from 'react'
import type { Administration } from '../../application/administration'
import { EMISSION_FUELS, SettingsValidationError, sameParameters, validateParameters } from '../../domain/algorithmSettings'
import type { AlgorithmParameters, EmissionFuel, ParameterErrors } from '../../domain/algorithmSettings'

export type NumericField = 'co2Weight' | 'maxSeconds' | 'maxLoadPercent' | 'windowSlackMinutes'

/** Lo que el usuario teclea: texto, para poder borrar un campo sin que salte a 0. */
export interface ParameterText {
  co2Weight: string
  maxSeconds: string
  maxLoadPercent: string
  windowSlackMinutes: string
  autoReoptimize: boolean
  factors: Record<EmissionFuel, string>
}

const toText = (parameters: AlgorithmParameters): ParameterText => ({
  co2Weight: String(parameters.co2Weight),
  maxSeconds: String(parameters.maxSeconds),
  maxLoadPercent: String(parameters.maxLoadPercent),
  windowSlackMinutes: String(parameters.windowSlackMinutes),
  autoReoptimize: parameters.autoReoptimize,
  factors: Object.fromEntries(EMISSION_FUELS.map((fuel) => [fuel, parameters.emissionFactors[fuel] === null ? '' : String(parameters.emissionFactors[fuel]).replace('.', ',')])) as Record<EmissionFuel, string>,
})

const number = (text: string) => (text.trim() === '' ? Number.NaN : Number(text.trim().replace(',', '.')))

/** Texto → parámetros. Un campo ilegible se convierte en NaN y la validación lo señala. */
export function parseParameters(text: ParameterText): AlgorithmParameters {
  return {
    co2Weight: number(text.co2Weight),
    maxSeconds: number(text.maxSeconds),
    maxLoadPercent: number(text.maxLoadPercent),
    windowSlackMinutes: number(text.windowSlackMinutes),
    autoReoptimize: text.autoReoptimize,
    emissionFactors: Object.fromEntries(EMISSION_FUELS.map((fuel) => [fuel, text.factors[fuel].trim() === '' ? null : number(text.factors[fuel])])) as AlgorithmParameters['emissionFactors'],
  }
}

export function useParameters(service: Administration) {
  const [saved, setSaved] = useState<AlgorithmParameters | null>(null)
  const [text, setText] = useState<ParameterText | null>(null)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    service
      .parameters()
      .then((value) => {
        if (!active) return
        setSaved(value)
        setText(toText(value))
        setLoadError('')
      })
      .catch((reason) => {
        if (active) setLoadError(reason instanceof Error ? reason.message : 'No se pudieron cargar los parámetros.')
      })
    return () => {
      active = false
    }
  }, [service, reload])

  const draft = useMemo(() => (text ? parseParameters(text) : null), [text])
  const errors: ParameterErrors = useMemo(() => (draft ? validateParameters(draft) : {}), [draft])
  const dirty = Boolean(draft && saved && !sameParameters(draft, saved))

  function edit(change: (current: ParameterText) => ParameterText) {
    setNotice('')
    setSaveError('')
    setText((current) => (current ? change(current) : current))
  }

  async function save() {
    if (!draft || saving) return
    setSaving(true)
    setSaveError('')
    setNotice('')
    try {
      const stored = await service.saveParameters(draft)
      setSaved(stored)
      setText(toText(stored))
      setNotice('Parámetros guardados. Se aplican desde la próxima generación de rutas.')
    } catch (reason) {
      setSaveError(reason instanceof SettingsValidationError ? reason.message : reason instanceof Error ? reason.message : 'No se pudieron guardar los parámetros.')
    } finally {
      setSaving(false)
    }
  }

  function discard() {
    if (!saved) return
    setText(toText(saved))
    setSaveError('')
    setNotice('')
  }

  return {
    ready: text !== null,
    text,
    errors,
    dirty,
    saving,
    loadError,
    saveError,
    notice,
    edit,
    save,
    discard,
    retry: () => setReload((value) => value + 1),
  }
}
export type ParametersState = ReturnType<typeof useParameters>
