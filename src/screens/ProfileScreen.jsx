import { Download, ShieldCheck, Sparkles } from '../components/Icons.jsx'
import NotesPanel from '../components/NotesPanel.jsx'
import ProfileExplanation from '../components/ProfileExplanation.jsx'

// One of the two values of the profile: its expectation and its three behaviours.
function ValuePanel({ kicker, value }) {
  return (
    <article
      className="panel value-panel"
      style={{ '--value': value.color, '--value-tint': value.tint }}
    >
      <div className="value-head">
        <span className="value-kicker">{kicker}</span>
        <h3>{value.label}</h3>
        <p className="value-expectation">« {value.expectation} »</p>
      </div>
      <ul className="behaviors">
        {value.behaviors.map((b) => (
          <li key={b.id}>
            <strong>{b.label}</strong>
            <span>{b.description}</span>
            <small>{b.softSkills}</small>
          </li>
        ))}
      </ul>
    </article>
  )
}

// End of game (mode "results"), or a saved game imported to write notes (mode "review").
// Shown to the candidate: a profile name, never a score. The same screen is printed to PDF.
export default function ProfileScreen({
  mode,
  person,
  profile,
  profiles,
  cards,
  tiebreaks,
  dominant,
  second,
  values,
  notes,
  onNoteChange,
  printWithNotes,
  onSaveJson,
  onExportPdf,
}) {
  const formattedDate = new Date(person.date + 'T12:00:00').toLocaleDateString('fr-FR')

  // The reveal animation plays at the end of a game only, not when a game is reopened for notes.
  return (
    <section
      className={`result-screen ${mode === 'results' ? 'reveal' : ''} ${printWithNotes ? '' : 'export-without-notes'}`}
    >
      <div className="result-hero">
        <div>
          <span className="eyebrow">
            <Sparkles size={15} /> TON PROFIL
          </span>
          <h1>{profile.label}</h1>
          <p className="profile-combination">
            <span style={{ color: dominant.color }}>{dominant.label}</span>
            <span aria-hidden="true"> › </span>
            <span style={{ color: second.color }}>{second.label}</span>
          </p>
          <p className="profile-description">{profile.description}</p>
          <div className="host-line">
            <strong>{person.candidateName}</strong> · avec {person.hostName} · {formattedDate}
          </div>
        </div>
        <div className="result-actions no-print">
          {mode === 'results' && (
            <>
              <button className="secondary" onClick={onSaveJson}>
                <Download size={17} /> Télécharger la partie (.json)
              </button>
              <button className="primary" onClick={() => onExportPdf(false)}>
                <Download size={17} /> PDF du profil
              </button>
            </>
          )}
          {mode === 'review' && (
            <>
              <button className="secondary" onClick={onSaveJson}>
                <Download size={17} /> Enregistrer la partie et les notes (.json)
              </button>
              <button className="secondary" onClick={() => onExportPdf(false)}>
                <Download size={17} /> PDF sans notes
              </button>
              <button className="primary" onClick={() => onExportPdf(true)}>
                <Download size={17} /> PDF avec notes
              </button>
            </>
          )}
        </div>
      </div>

      <article className="profile-text">
        {profile.presentation.map((paragraph, i) => (
          <p key={i} className={i === 0 ? 'profile-intro' : undefined}>
            {paragraph}
          </p>
        ))}
      </article>

      <div className="result-grid">
        <ValuePanel kicker="Ta dominante" value={dominant} />
        <ValuePanel kicker="Ta seconde couleur" value={second} />
      </div>

      <ProfileExplanation
        values={values}
        profiles={profiles}
        profile={profile}
        cards={cards}
        tiebreaks={tiebreaks}
      />

      {mode === 'review' && <NotesPanel values={values} notes={notes} onChange={onNoteChange} />}

      <div className="result-bottom">
        <p>
          <ShieldCheck size={18} /> Profil exploratoire fondé sur tes choix pendant la partie ; ce
          n’est ni un test psychométrique validé ni une évaluation de tes compétences.
        </p>
      </div>
    </section>
  )
}
