import { MessageCircle } from './Icons.jsx'

export const NOTE_MAX_LENGTH = 350

// Game master's notes, written after the interview: one note per value, always in the order of
// values.json. Each textarea is replaced by plain text when printing (see .print-note).
export default function NotesPanel({ values, notes, onChange }) {
  return (
    <article className="panel notes-panel">
      <div className="panel-title">
        <span className="panel-icon">
          <MessageCircle size={19} />
        </span>
        <div>
          <h3>Notes de l’échange</h3>
          <p>Espace privé du maître du jeu · une note par valeur</p>
        </div>
      </div>
      <div className="notes-grid">
        {values.map((v) => (
          <label
            key={v.id}
            className="note-block"
            style={{ '--value': v.color, '--value-tint': v.tint }}
          >
            <span className="note-label">{v.label}</span>
            <textarea
              rows="3"
              maxLength={NOTE_MAX_LENGTH}
              placeholder="Exemples concrets, verbatims, points à creuser…"
              value={notes[v.id] ?? ''}
              onChange={(e) => onChange(v.id, e.target.value)}
            />
            <div className="print-note">{notes[v.id] || '—'}</div>
          </label>
        ))}
      </div>
    </article>
  )
}
