// Entrada exclusiva de pruebas en Vite: reporte de sostenibilidad con datos de demostración y descarga real.
import { createRoot } from 'react-dom/client'
import { createGetSustainabilityReport } from '../../src/application/getSustainabilityReport'
import { BrowserFileSaver } from '../../src/infrastructure/browserFileSaver'
import { DemoSustainabilityReport } from '../../src/infrastructure/demoSustainability'
import { SustainabilityView } from '../../src/interfaces/SustainabilityView'
import '../../src/shared/ui/tokens.css'
import '../../src/shared/ui/eco.css'

const service = createGetSustainabilityReport({ source: new DemoSustainabilityReport(), saver: new BrowserFileSaver() })
createRoot(document.getElementById('root')!).render(<SustainabilityView service={service} />)
