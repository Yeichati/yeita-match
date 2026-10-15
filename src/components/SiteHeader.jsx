import YeitaLogo from './YeitaLogo.jsx'

export default function SiteHeader({ onHome }) {
  return (
    <header className="site-head no-print">
      <div className="site-nav">
        <button className="brand" onClick={onHome} aria-label="Yeita Match, retour à l'accueil">
          <YeitaLogo />
          <span className="brand-product">match</span>
        </button>
      </div>
    </header>
  )
}
