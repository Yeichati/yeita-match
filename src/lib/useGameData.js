import { useEffect, useState } from 'react'

const fetchJson = (file, label) =>
  fetch(`${import.meta.env.BASE_URL}data/${file}`).then((response) => {
    if (!response.ok) throw Error(label)
    return response.json()
  })

// Loads the game content from public/data. data is null until both files are available.
export function useGameData() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([
      fetchJson('situations.json', 'situations'),
      fetchJson('dimensions.json', 'dimensions'),
    ])
      .then(([scenes, meta]) => setData({ scenes, meta }))
      .catch(() => setError('Les données du jeu sont indisponibles. Recharge la page.'))
  }, [])
  return { data, error }
}
