import { MessageCircle } from './Icons.jsx'

// Each note is capped so that the printed sheet fits on one A4 page.
const NOTE_MAX_LENGTH = 350

// Game master's notes, written after the interview. The textarea is replaced by plain text when
// printing (see .print-note in styles.css).
export default function NotesPanel({ notes, followup, onChange }) {
  return (
    <article className="panel notes-panel">
      <div className="panel-title">
        <span className="panel-icon lavender">
          <MessageCircle size={19} />
        </span>
        <div>
          <h3>Notes de l’échange</h3>
          <p>Espace privé du maître du jeu</p>
        </div>
      </div>
      <div className="notes-grid">
        <label>
          Observations
          <textarea
            rows="3"
            maxLength={NOTE_MAX_LENGTH}
            placeholder="Exemples concrets, verbatims…"
            value={notes}
            onChange={(e) => onChange({ notes: e.target.value })}
          />
          <div className="print-note">{notes || '—'}</div>
        </label>
        <label>
          Points à approfondir
          <textarea
            rows="3"
            maxLength={NOTE_MAX_LENGTH}
            placeholder="Sujets à explorer ensuite…"
            value={followup}
            onChange={(e) => onChange({ followup: e.target.value })}
          />
          <div className="print-note">{followup || '—'}</div>
        </label>
      </div>
    </article>
  )
}
