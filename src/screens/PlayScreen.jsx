import {
  ArrowLeft,
  ArrowRight,
  Compass,
  HeartHandshake,
  Sparkles,
  Target,
} from '../components/Icons.jsx'

// Decorative icon per card position.
const CARD_ICONS = [Compass, HeartHandshake, Target, Sparkles]

const RANK_LABELS = { 1: '1er réflexe', 2: '2e réflexe' }
const PICK_MESSAGES = [
  'Choisis tes cartes',
  'Bien joué, encore une carte.',
  'Tes deux réflexes sont prêts.',
]

// One round: a situation and four cards. The candidate picks two cards, in order.
export default function PlayScreen({ round, index, total, selected, onPick, onNext, onBack }) {
  const isFirst = index === 0
  const isLast = index === total - 1
  return (
    <section className="play-screen">
      <div className="play-top">
        <button className="text-btn" onClick={onBack}>
          <ArrowLeft size={17} /> {isFirst ? 'Quitter' : 'Précédent'}
        </button>
        <span className="step-count">
          MANCHE {index + 1} <span>/ {total}</span>
        </span>
      </div>
      <div className="progress">
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <div className="round-head">
        <span className="eyebrow">
          <span className="eyebrow-circle">✦</span> CHOISIS TES DEUX RÉFLEXES
        </span>
        <h2>{round.title}</h2>
        <p>{round.context}</p>
      </div>
      <div className="play-instruction">
        <div>
          <strong>Qu'est-ce qui te vient en premier ?</strong>
          <span>Choisis une première carte, puis une seconde.</span>
        </div>
        <span className="selection-counter">{selected.length}/2 choisies</span>
      </div>
      <div className="choice-grid">
        {round.cards.map((card, i) => {
          const rank = selected.indexOf(card.id) + 1
          const Icon = CARD_ICONS[i % CARD_ICONS.length]
          return (
            <button
              key={card.id}
              className={`choice-card ${rank ? 'chosen' : ''}`}
              onClick={() => onPick(card.id)}
            >
              <span className="choice-icon">
                <Icon size={23} strokeWidth={1.8} />
              </span>
              <span className="choice-name">{card.label}</span>
              <span className="choice-rank">{RANK_LABELS[rank] ?? 'Choisir cette carte'}</span>
              {rank > 0 && <span className="rank-bubble">{rank}</span>}
            </button>
          )
        })}
      </div>
      <div className="round-foot">
        <div className="pick-summary">
          <span className="pick-line">{PICK_MESSAGES[selected.length]}</span>
          <span>Tu peux modifier ton choix avant de continuer.</span>
        </div>
        <button className="primary" disabled={selected.length !== 2} onClick={onNext}>
          {isLast ? 'Découvrir le portrait' : 'Manche suivante'} <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}
