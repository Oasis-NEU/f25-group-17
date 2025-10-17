import { createSystem, defaultConfig } from '@chakra-ui/react'

// Disable Chakra's preflight (CSS reset) to preserve existing global/Tailwind styles
export const system = createSystem({
  ...defaultConfig,
  preflight: false,
})


