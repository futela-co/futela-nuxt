export function getEnv() {
  const config = useRuntimeConfig()
  return {
    API_BASE_URL: (config.public.apiBaseUrl as string) || 'http://localhost:8006/api',
    APP_NAME: (config.public.appName as string) || 'Futela',
    NODE_ENV: import.meta.dev ? 'development' : 'production',
  }
}

export type Env = ReturnType<typeof getEnv>
