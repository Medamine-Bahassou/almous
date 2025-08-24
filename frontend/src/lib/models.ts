export async function fetchModels(provider: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/models?provider=${provider}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (!data.models || !Array.isArray(data.models)) {
      throw new Error("Invalid model data");
    }

    return data.models.map((m: { id: string; name: string }) => [m.id, m.name]) as [string, string][];
  } catch (err: any) {
    console.error("Error fetching models:", err);
    throw new Error(err.message || "Failed to load models. Please try again later.");
  }
}
