// Shows how the candidate's cards led to the profile: cards chosen per value (a count, not a score)
// and the 12 profiles with the one obtained highlighted. Shown under the profile and printed.

const plural = (n) => `${n} carte${n > 1 ? 's' : ''}`

function tiebreakNote(tiebreakValues, labelOf) {
  if (tiebreakValues.length === 1)
    return `Égalité tranchée en dernière manche : tu y as choisi une carte ${labelOf(tiebreakValues[0])}, comptée ci-dessus.`
  if (tiebreakValues.length === 2)
    return `Deux égalités tranchées en dernière manche : une carte ${labelOf(tiebreakValues[0])} a désigné ta dominante, puis une carte ${labelOf(tiebreakValues[1])} ta seconde couleur. Elles sont comptées ci-dessus.`
  return null
}

export default function ProfileExplanation({ values, profiles, profile, cards, tiebreakValues }) {
  const valueById = (id) => values.find((v) => v.id === id)
  const labelOf = (id) => valueById(id).label
  const scale = Math.max(1, ...values.map((v) => cards.total[v.id]))
  const role = (id) =>
    id === profile.dominant ? 'Dominante' : id === profile.second ? 'Seconde couleur' : null
  const note = tiebreakNote(tiebreakValues, labelOf)

  return (
    <section className="explanation">
      <h2 className="explanation-title">Comment tes choix mènent à ce profil</h2>
      <div className="explanation-grid">
        <article className="panel cards-chart">
          <h3>Tes cartes par valeur</h3>
          <p className="explanation-lead">
            Chaque carte choisie compte pour sa valeur. Les deux valeurs les plus choisies donnent
            ton profil.
          </p>
          <ul className="bars">
            {values.map((v) => {
              const total = cards.total[v.id]
              const bonus = cards.fromTiebreaks[v.id]
              return (
                <li key={v.id} style={{ '--value': v.color, '--value-tint': v.tint }}>
                  <span className="bar-label">
                    {v.label}
                    {role(v.id) && <em>{role(v.id)}</em>}
                  </span>
                  <span className="bar-track">
                    <span
                      className="bar-fill"
                      style={{ width: `${((total - bonus) / scale) * 100}%` }}
                    />
                    {bonus > 0 && (
                      <span className="bar-bonus" style={{ width: `${(bonus / scale) * 100}%` }} />
                    )}
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
            {profiles.map((p) => {
              const current = p.id === profile.id
              return (
                <div
                  key={p.id}
                  className={`profile-tile ${current ? 'current' : ''}`}
                  style={{ '--value': valueById(p.dominant).color }}
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
