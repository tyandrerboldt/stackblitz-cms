export async function getSiteConfig() {
  try {
    const response = await fetch("/api/config")
    if (!response.ok) {
      throw new Error("Failed to fetch site config")
    }
    return response.json()
  } catch (error) {
    console.error("Erro ao buscar configurações do site:", error)
    return null
  }
}