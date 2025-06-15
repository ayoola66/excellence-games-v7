'use client'

import React, { createContext, useContext } from 'react'

const SoundContext = createContext({
  playSound: () => {},
  isMusicEnabled: false,
  isSoundEnabled: false,
  volume: 0,
  toggleMusic: () => {},
  toggleSound: () => {},
  setVolume: () => {},
})

export function SoundProvider({ children }: { children: React.ReactNode }) {
  return <SoundContext.Provider value={{
    playSound: () => {},
    isMusicEnabled: false,
    isSoundEnabled: false,
    volume: 0,
    toggleMusic: () => {},
    toggleSound: () => {},
    setVolume: () => {},
  }}>{children}</SoundContext.Provider>
}

export function useSound() {
  return useContext(SoundContext)
}