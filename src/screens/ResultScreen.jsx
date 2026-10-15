import {
  Compass,
  Download,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from '../components/Icons.jsx'
import NotesPanel from '../components/NotesPanel.jsx'
import Radar from '../components/Radar.jsx'

// Portrait shown at the end of a game (mode "results") or after importing a saved game to write
// notes (mode "review"). The same screen is what gets printed to PDF.
export default function ResultScreen({
  mode,
  person,
  result,
  dimensions,
  printWithNotes,
  onSaveJson,
  onExportPdf,
  onPersonChange,
}) {
  const dimension = (id) => dimensions.find((d) => d.id === id)
  const formattedDate = new Date(person.date + 'T12:00:00').toLocaleDateString('fr-FR')

  return (
    <section className={`result-screen ${printWithNotes ? '' : 'export-without-notes'}`}>
      <div className="result-hero">
        <div>
          <span className="eyebrow">
            <Sparkles size={15} /> PORTRAIT · SOFT SKILLS
          </span>
          <h1>{person.candidateName}</h1>
          <p>Préférences comportementales exprimées pendant la partie.</p>
          <div className="host-line">
            Avec <strong>{person.hostName}</strong> · {formattedDate}
          </div>
        </div>
        <div className="result-actions no-print">
          {mode === 'results' && (
            <>
              <button className="secondary" onClick={onSaveJson}>
                <Download size={17} /> Télécharger la partie (.json)
              </button>
              <button className="primary" onClick={() => onExportPdf(false)}>
                <Download size={17} /> PDF du portrait
              </button>
            </>
          )}
          {mode === 'review' && (
            <>
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

      <div className="result-grid">
        <article className="panel radar-panel">
          <div className="panel-title">
            <span className="panel-icon lavender">
              <SlidersHorizontal size={19} />
            </span>
            <div>
              <h3>Dimensions observées</h3>
              <p>Tendances issues des choix</p>
            </div>
          </div>
          <Radar scores={result.scores} dimensions={dimensions} />
          <div className="score-legend">
            {dimensions.map((d) => (
              <div key={d.id}>
                <span>{d.label}</span>
                <div className="tiny-track">
                  <span style={{ width: `${result.scores[d.id] ?? 0}%` }} />
                </div>
                <strong>
                  {result.scores[d.id] ?? '—'}
                  <small>/100</small>
                </strong>
              </div>
            ))}
          </div>
          <p className="method-caption">
            Scores relatifs aux choix effectués, pas à un niveau de maîtrise.
          </p>
        </article>

        <div className="right-stack">
          <article className="panel">
            <div className="panel-title">
              <span className="panel-icon peach">
                <Compass size={19} />
              </span>
              <div>
                <h3>Style qui se dessine</h3>
                <p>Deux tendances complémentaires</p>
              </div>
            </div>
            <div className="styles">
              {result.styles.map((s, i) => (
                <div className="style-card" key={s.id}>
                  <span className="style-number">0{i + 1}</span>
                  <div>
                    <h4>{s.label}</h4>
                    <p>{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="panel">
            <div className="panel-title">
              <span className="panel-icon mint">
                <Sparkles size={19} />
              </span>
              <div>
                <h3>3 traits qui ressortent</h3>
                <p>Les tendances les plus marquées</p>
              </div>
            </div>
            <div className="top-traits">
              {result.top.map((id, i) => (
                <div key={id}>
                  <span className="trait-index">{i + 1}</span>
                  <span>
                    <strong>{dimension(id)?.label ?? id}</strong>
                    <small>{dimension(id)?.description}</small>
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>

      {mode === 'review' && (
        <NotesPanel notes={person.notes} followup={person.followup} onChange={onPersonChange} />
      )}

      <div className="result-bottom">
        <p>
          <ShieldCheck size={18} /> Portrait exploratoire fondé sur des choix déclarés ; ce n’est ni
          un test psychométrique validé ni une mesure objective des soft skills.
        </p>
      </div>
    </section>
  )
}
