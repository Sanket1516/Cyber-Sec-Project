import { createContext, useContext, useState } from 'react'

const PasswordContext = createContext(null)

export function PasswordProvider({ children }) {
  const [password, setPassword] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [attackResults, setAttackResults] = useState({
    dictionary: null,
    hybrid: null,
    bruteforce: null
  })
  const [sessionId, setSessionId] = useState('')

  const reset = () => {
    setPassword('')
    setAnalysisResult(null)
    setAttackResults({ dictionary: null, hybrid: null, bruteforce: null })
    setSessionId('')
  }

  return (
    <PasswordContext.Provider value={{
      password, setPassword,
      analysisResult, setAnalysisResult,
      attackResults, setAttackResults,
      sessionId, setSessionId,
      reset
    }}>
      {children}
    </PasswordContext.Provider>
  )
}

export function usePassword() {
  const ctx = useContext(PasswordContext)
  if (!ctx) throw new Error('usePassword must be used within PasswordProvider')
  return ctx
}
