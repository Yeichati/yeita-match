// Shows how the candidate's cards led to the profile: cards chosen per value (a count, not a score)
// and the 12 profiles with the one obtained highlighted. Shown under the profile and printed.

import { useInView } from '../lib/useInView.js'

const plural = (n) => `${n} carte${n > 1 ? 's' : ''}`

// Says which place each tie-break settled, between which values, and which card was chosen.
function tiebreakNote(tiebreaks, profile, labelOf) {
  const list = (ids) =>
    ids
      .map(labelOf)
      .join(ids.length > 2 ? ', ' : ' et ')
      .replace(/, ([^,]*)$/, ' et $1')
  const place = (value) => (value === profile.dominant ? 'ta dominante' : 'ta seconde couleur')
  if (tiebreaks.length === 1) {
    const [t] = tiebreaks
    return `Égalité entre ${list(t.between)} pour ${place(t.value)} : tu l’as tranchée en dernière manche avec une carte ${labelOf(t.value)}, comptée ci-dessus.`
  }
  if (tiebreaks.length === 2)
    return `Deux égalités tranchées en dernière manche : entre ${list(tiebreaks[0].between)}, une carte ${labelOf(tiebreaks[0].value)} a désigné ta dominante ; puis entre ${list(tiebreaks[1].between)}, une carte ${labelOf(tiebreaks[1].value)} ta seconde couleur. Elles sont comptées ci-dessus.`
  return null
}

export default function ProfileExplanation({ values, profiles, profile, cards, tiebreaks }) {
  const valueById = (id) => values.find((v) => v.id === id)
  const labelOf = (id) => valueById(id).label
  const scale = Math.max(1, ...values.map((v) => cards.total[v.id]))
  const role = (id) =>
    id === profile.dominant ? 'Dominante' : id === profile.second ? 'Seconde couleur' : null
  const note = tiebreakNote(tiebreaks, profile, labelOf)
  const [ref, inView] = useInView()

  return (
    <section ref={ref} className={`explanation ${inView ? 'in-view' : ''}`}>
      <h2 className="explanation-title">Comment tes choix mènent à ce profil</h2>
      <div className="explanation-grid">
        <article className="panel cards-chart">
          <h3>Tes cartes par valeur</h3>
          <p className="explanation-lead">
            Chaque carte choisie compte pour sa valeur. Les deux valeurs les plus choisies donnent
            ton profil.
          </p>
          <ul className="bars">
            {values.map((v, i) => {
              const total = cards.total[v.id]
              const bonus = cards.fromTiebreaks[v.id]
              return (
                <li key={v.id} style={{ '--value': v.color, '--value-tint': v.tint, '--i': i }}>
                  <span className="bar-label">
                    {v.label}
                    {role(v.id) && <em>{role(v.id)}</em>}
                  </span>
                  <span className="bar-track">
                    <span className="bar-value" style={{ width: `${(total / scale) * 100}%` }}>
                      <span className="bar-fill" style={{ flexGrow: total - bonus }} />
                      {bonus > 0 && <span className="bar-bonus" style={{ flexGrow: bonus }} />}
                    </span>
                  </span>
                  <span className="bar-count">
                    {plural(total)}
                    {bonus > 0 && <small>dont {bonus} en dernière manche</small>}
                  </span>
                </li>
              )
            })}
          </ul>
          {note && <p className="bar-note">{note}</p>}
        </article>

        <article className="panel profiles-panel">
          <h3>Les 12 profils</h3>
          <div className="profiles-grid">
            {profiles.map((p, i) => {
              const current = p.id === profile.id
              return (
                <div
                  key={p.id}
                  className={`profile-tile ${current ? 'current' : ''}`}
                  style={{ '--value': valueById(p.dominant).color, '--i': i }}
                >
                  <span className="tile-combo">
                    {labelOf(p.dominant)} › {labelOf(p.second)}
                  </span>
                  <strong>{p.label}</strong>
                  <span className="tile-description">{p.description}</span>
                  {current && <span className="tile-badge">Ton profil</span>}
                </div>
              )
            })}
          </div>
        </article>
      </div>
    </section>
  )
}
