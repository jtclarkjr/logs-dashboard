// Logs service
export { logsService } from './logs'

// Health & metadata service
export { healthService } from './health'

// Import instances to spread
import { logsService } from './logs'
import { healthService } from './health'

// Combined API service (for backward compatibility)
export const apiService = {
  ...logsService,
  ...healthService
}
