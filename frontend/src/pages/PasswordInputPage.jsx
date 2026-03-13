import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { usePassword } from '../context/PasswordContext'
import { analyzeLocally, getStrengthColor } from '../utils/passwordUtils'
import api from '../services/api'

export default function PasswordInputPage() {
  const navigate = useNavigate()
  const { setPassword: setCtxPassword, setAnalysisResult, setSessionId } = usePassword()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const local = password ? analyzeLocally(password) : null

  const handleAnalyze = async () => {
    if (!password) return toast.error('Please enter a password')
    setLoading(true)
    try {
      const { data } = await api.post('/analyze', { password })
      setCtxPassword(password)
      setAnalysisResult(data)
      setSessionId(crypto.randomUUID())
      navigate('/analysis')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-2">Test Your Password</h1>
        <p className="text-gray-400 text-center mb-10">Enter a password to analyze its strength and simulate attacks.</p>

        {/* Input */}
        <div className="relative mb-4">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            placeholder="Enter a password..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 pr-12 text-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500 font-mono"
          />
          <button onClick={() => setShowPw(!showPw)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            {showPw ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
          </button>
        </div>

        {/* Strength bar */}
        {local && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Strength</span>
              <span style={{ color: getStrengthColor(local.label) }}>{local.label}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <motion.div
                className="h-2.5 rounded-full"
                style={{ backgroundColor: getStrengthColor(local.label) }}
                initial={{ width: 0 }}
                animate={{ width: `${local.score}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Length: {local.length}</span>
              <span>Charset: {local.charsetSize}</span>
              <span>Entropy: {local.entropy} bits</span>
            </div>
          </div>
        )}

        {/* Character classes */}
        {local && (
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'a-z', active: local.hasLower },
              { label: 'A-Z', active: local.hasUpper },
              { label: '0-9', active: local.hasDigit },
              { label: '!@#', active: local.hasSpecial },
            ].map(c => (
              <div key={c.label}
                className={`text-center py-2 rounded-lg text-sm font-mono ${
                  c.active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-900 text-gray-600 border border-gray-800'
                }`}>
                {c.label}
              </div>
            ))}
          </div>
        )}

        <button onClick={handleAnalyze} disabled={loading || !password}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg transition-colors">
          {loading ? 'Analyzing...' : 'Analyze Password'}
        </button>
      </motion.div>
    </div>
  )
}
