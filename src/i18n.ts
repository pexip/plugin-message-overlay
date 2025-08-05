import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import { logger } from './logger'

export const initI18n = async (): Promise<void> => {
  logger.info('Initializing i18n...')
  await i18next.use(Backend).init({
    fallbackLng: 'en',
    backend: {
      loadPath: 'locales/{{lng}}/{{ns}}.json'
    }
  })
}

initI18n().catch((error: unknown) => {
  logger.error('Failed to initialize i18n:', error)
})

export { i18next }
