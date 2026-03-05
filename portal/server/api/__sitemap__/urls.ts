export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl as string

  try {
    const response = await $fetch<{ data: Array<{ id: string; updatedAt?: string }> }>(
      `${apiBaseUrl}/properties`,
      { params: { limit: 1000, isPublished: true } }
    )

    const properties = Array.isArray(response) ? response : (response.data ?? [])

    return properties.map((property: any) => ({
      loc: `/properties/${property.id}`,
      lastmod: property.updatedAt ?? new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    }))
  } catch {
    return []
  }
})
