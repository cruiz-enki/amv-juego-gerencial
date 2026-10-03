import { injectedChallenges } from './inyectados'
import { morningChallenges } from './manana'
import { afternoonChallenges } from './tarde'

export const challenges = [...morningChallenges, ...afternoonChallenges, ...injectedChallenges]
