'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { system } from './system'

export function Provider(props) {
  return (
    <ChakraProvider value={system}>
      {props.children}
    </ChakraProvider>
  )
}
