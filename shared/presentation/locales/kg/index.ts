import app from './app'
import auth from './auth'
import ui from './ui'
import dashboard from './dashboard'
import property from './property'
import landlord from './landlord'
import help from './help'

export default {
  ...app,
  ...auth,
  ...ui,
  ...dashboard,
  ...property,
  ...landlord,
  ...help,
} as Record<string, string>
