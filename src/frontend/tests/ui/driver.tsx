// Entrada exclusiva de pruebas en Vite; el build del producto solo usa index.html.
import { createRoot } from 'react-dom/client'
import { Harness } from './DriverHarness'
import '../../src/shared/ui/tokens.css'
import '../../src/shared/ui/eco.css'

createRoot(document.getElementById('root')!).render(<Harness />)
