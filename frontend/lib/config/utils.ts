import { API_CONFIG } from './constants'

export const getApiUrl = (
  endpoint: string,
  isServerSide: boolean = false
): string => {
  const baseUrl = isServerSide
    ? API_CONFIG.SERVER_BASE_URL
    : API_CONFIG.BASE_URL
  const apiVersion = API_CONFIG.API_VERSION

  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

  return `${baseUrl}${apiVersion}/${cleanEndpoint}`
}

export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}
