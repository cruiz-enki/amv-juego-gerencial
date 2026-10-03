import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { content, validateContent } from './content'
import './index.css'
import { GameProvider } from './state/GameProvider'

if (import.meta.env.DEV) {
  const problems = validateContent(content)
  if (problems.length) console.warn('[contenido] Revisa estos problemas:\n' + problems.join('\n'))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
)
