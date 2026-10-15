export default function SiteHeader({ onHome }) {
  return (
    <header className="site-head no-print">
      <button className="brand" onClick={onHome} aria-label="Retour à l'accueil">
        <span className="brand-wordmark">
          yeita<span className="brand-period">.</span>
        </span>
        <span className="brand-product">match</span>
      </button>
      <div className="head-right">
        <span className="version">PORTRAIT SOFT SKILLS</span>
      </div>
    </header>
  )
}
