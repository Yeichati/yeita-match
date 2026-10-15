import {
  ArrowRight,
  CircleHelp,
  Download,
  Layers3,
  Sparkles,
  Target,
} from '../components/Icons.jsx'
import SetupModal from '../components/SetupModal.jsx'

export default function WelcomeScreen({
  setupOpen,
  onOpenSetup,
  onCloseSetup,
  person,
  onPersonChange,
  onStart,
  onImport,
  importError,
}) {
  return (
    <section className="welcome">
      <div className="eyebrow">
        <Sparkles size={16} /> JEU DE CARTES · SOFT SKILLS
      </div>
      <h1>
        Découvrir ses <em>soft skills</em>
      </h1>
      <p className="lead">
        Huit manches de cartes pour faire émerger les préférences de travail et ouvrir la
        discussion.
      </p>
      <div className="welcome-stats">
        <div>
          <Layers3 />
          <strong>8 manches</strong>
          <small>Tirage différent à chaque partie</small>
        </div>
        <div>
          <Target />
          <strong>6 dimensions</strong>
          <small>Des tendances comportementales</small>
        </div>
        <div>
          <Download />
          <strong>Ton portrait</strong>
          <small>Exportable en PDF</small>
        </div>
      </div>
      <div className="welcome-action">
        <button className="primary large" onClick={onOpenSetup}>
          Commencer la partie <ArrowRight size={19} />
        </button>
        <span>Environ 10 à 15 minutes · accompagné d’un recruteur</span>
        <label className="import-link">
          Reprendre une partie pour rédiger mes notes{' '}
          <input type="file" accept=".json,application/json" onChange={onImport} hidden />
        </label>
        {importError && <p className="alert">{importError}</p>}
      </div>
      <div className="welcome-note">
        <CircleHelp size={18} />
        <p>
          À chaque manche, choisis{' '}
          <strong>tes deux réactions les plus naturelles, dans l’ordre</strong>. Toutes les cartes
          correspondent à des approches professionnelles possibles : aucune réponse n’est la « bonne
          » par défaut.
        </p>
      </div>
      {setupOpen && (
        <SetupModal
          person={person}
          onChange={onPersonChange}
          onSubmit={onStart}
          onClose={onCloseSetup}
        />
      )}
    </section>
  )
}
