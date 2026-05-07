import { StrictMode, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './workshop/workshop.css'
import App from './App.jsx'
import WorkshopApp from './workshop/WorkshopApp.jsx'
import ViewToggle from './ViewToggle.jsx'

function readView() {
  const params = new URLSearchParams(window.location.search)
  return params.get('view') === 'workshop' ? 'workshop' : 'standard'
}

function Router() {
  const [view, setView] = useState(readView)

  const switchView = useCallback((next) => {
    const url = new URL(window.location.href)
    if (next === 'workshop') url.searchParams.set('view', 'workshop')
    else url.searchParams.delete('view')
    window.history.pushState({}, '', url)
    setView(next)
  }, [])

  return (
    <>
      {view === 'workshop' ? <WorkshopApp /> : <App />}
      <ViewToggle current={view} onSwitch={switchView} />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
