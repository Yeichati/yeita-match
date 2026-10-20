import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  HeartHandshake,
  Sparkles,
  Target,
} from '../components/Icons.jsx'

// Decorative icon per card position.
const CARD_ICONS = [Compass, HeartHandshake, Target, Sparkles]

const TEXTS = {
  2: {
    eyebrow: 'CHOISIS DEUX RÉACTIONS',
    instruction: 'Choisis deux cartes, dans n’importe quel ordre.',
    counter: (n) => `${n}/2 choisies`,
    messages: ['Choisis tes cartes', 'Encore une carte.', 'Tes deux cartes sont prêtes.'],
  },
  1: {
    eyebrow: 'CHOISIS UNE RÉACTION',
    instruction: 'Choisis une seule carte.',
    counter: (n) => `${n}/1 choisie`,
    messages: ['Choisis ta carte', 'Ta carte est prête.'],
  },
}

// One round: a situation and its cards. The candidate selects `required` cards, without order;
// once they are selected, the other cards are disabled until one is unselected.
// `index`/`total` are null for the tie-break round, shown as the last round.
export default function PlayScreen({
  round,
  index,
  total,
  required,
  selected,
  isLast,
  onPick,
  onNext,
  onBack,
}) {
  const texts = TEXTS[required]
  const isTiebreak = index === null
  const full = selected.length >= required
  return (
    <section className={`play-screen ${isTiebreak ? 'tiebreak' : ''}`}>
      <div className="play-top">
        <button className="text-btn" onClick={onBack}>
          <ArrowLeft size={17} /> {index === 0 ? 'Quitter' : 'Précédent'}
        </button>
        <span className="step-count">
          {isTiebreak ? (
            'DERNIÈRE MANCHE'
          ) : (
            <>
              MANCHE {index + 1} <span>/ {total}</span>
            </>
          )}
        </span>
      </div>
      <div className="progress">
        <span style={{ width: `${isTiebreak ? 100 : ((index + 1) / total) * 100}%` }} />
      </div>
      <div className="round-head">
        <span className="eyebrow">
          <span className="eyebrow-circle">✦</span> {texts.eyebrow}
        </span>
        <h2>{round.title}</h2>
        <p>{round.context}</p>
      </div>
      <div className="play-instruction">
        <div>
          <strong>Qu’est-ce qui te ressemble le plus ?</strong>
          <span>{texts.instruction}</span>
        </div>
        <span className="selection-counter">{texts.counter(selected.length)}</span>
      </div>
      <div
        className={`choice-grid ${round.cards.length < 4 ? 'few' : ''}`}
        style={{ '--count': round.cards.length }}
      >
        {round.cards.map((card, i) => {
          const chosen = selected.includes(card.id)
          const Icon = CARD_ICONS[i % CARD_ICONS.length]
          return (
            <button
              key={card.id}
              className={`choice-card ${chosen ? 'chosen' : ''}`}
              style={{ '--i': i }}
              disabled={full && !chosen}
              aria-pressed={chosen}
              onClick={() => onPick(card.id)}
            >
              <span className="choice-icon">
                <Icon size={23} strokeWidth={1.8} />
              </span>
              <span className="choice-name">{card.label}</span>
              <span className="choice-rank">{chosen ? 'Sélectionnée' : 'Choisir cette carte'}</span>
              {chosen && (
                <span className="rank-bubble">
                  <Check size={15} strokeWidth={3} />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="round-foot">
        <div className="pick-summary">
          <span className="pick-line">{texts.messages[selected.length]}</span>
          <span>Tu peux modifier ton choix avant de continuer.</span>
        </div>
        <button className="primary" disabled={!full} onClick={onNext}>
          {isLast ? 'Découvrir mon profil' : 'Manche suivante'} <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}
