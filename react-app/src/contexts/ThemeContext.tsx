import { createContext, useContext, useState, type ReactNode, useEffect } from 'react'

export type ThemeName = 'trendy' | 'apple' | 'professional' | 'simple' | 'default'

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('trendy')

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') as ThemeName
    if (savedTheme && ['trendy', 'apple', 'professional', 'simple', 'default'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  const updateTheme = (newTheme: ThemeName) => {
    setTheme(newTheme)
    localStorage.setItem('selectedTheme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}