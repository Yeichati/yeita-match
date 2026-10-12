import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('Yei’ta Match : erreur React', error, info) }
  render() {
    if (this.state.error) {
      return <main style={{font:'16px system-ui',maxWidth:680,margin:'12vh auto',padding:28,background:'#f5f3ff',borderRadius:16}}>
        <h1>Impossible d’afficher le jeu</h1>
        <p>Une erreur a interrompu l’application. Tu peux copier le message ci-dessous pour identifier le problème.</p>
        <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:13}}>{String(this.state.error)}</pre>
      </main>
    }
    return this.props.children
  }
}

const root = document.getElementById('root')
if (!root) throw new Error('Élément #root introuvable dans index.html')
createRoot(root).render(<AppErrorBoundary><App /></AppErrorBoundary>)
