import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BuddyProvider } from './components/Buddy'
import { GameProvider } from './components/Game'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BuddyProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </BuddyProvider>
  </StrictMode>,
)
