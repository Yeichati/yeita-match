import { ArrowRight } from './Icons.jsx'

// Identity form shown before a game: candidate, game master and interview date.
export default function SetupModal({ person, onChange, onSubmit, onClose }) {
  const update = (field) => (e) => onChange({ [field]: e.target.value })
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="setup-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Préparer la partie"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <span className="eyebrow">PRÉPARER LA PARTIE</span>
        <h2>Qui joue aujourd’hui ?</h2>
        <p>Ces informations figureront sur le portrait et les exports.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <label>
            Nom complet du candidat
            <input
              required
              autoFocus
              value={person.candidateName}
              onChange={update('candidateName')}
              placeholder="Prénom Nom"
            />
          </label>
          <label>
            Nom complet du maître du jeu
            <input
              required
              value={person.hostName}
              onChange={update('hostName')}
              placeholder="Prénom Nom"
            />
          </label>
          <label>
            Date de l’entretien
            <input required type="date" value={person.date} onChange={update('date')} />
          </label>
          <button className="primary large" type="submit">
            Jouer <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
