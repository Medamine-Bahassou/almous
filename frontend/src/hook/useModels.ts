// hooks/useModels.ts
import { useEffect, useState } from "react"

interface Model {
  id: string
  name: string
}

export function useModels(provider: string = "pollination") {
  const [models, setModels] = useState<[string, string][]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch(`http://localhost:5000/api/models?provider=${provider}`)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        if (!data.models || !Array.isArray(data.models)) throw new Error("Invalid model data")

        const formatted: [string, string][] = data.models.map((m: Model) => [m.id, m.name])
        setModels(formatted)
      } catch (err: any) {
        console.error(err)
        setError("Failed to load models. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchModels()
  }, [provider])

  return { models, loading, error }
}
