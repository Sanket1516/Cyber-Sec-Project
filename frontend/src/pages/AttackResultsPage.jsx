import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiCheck, HiX, HiArrowRight } from 'react-icons/hi'
import { usePassword } from '../context/PasswordContext'

const STATUS_BADGE = {
  found: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'CRACKED' },
  not_found: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', label: 'SAFE' },
}

function ResultRow({ title, result }) {
  if (!result) return null
  const badge = STATUS_BADGE[result.found ? 'found' : 'not_found']

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text}`}>
          {result.found ? <HiX className="inline mr-1" /> : <HiCheck className="inline mr-1" />}
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Status</div>
          <div className={`font-medium ${badge.text}`}>{result.found ? 'Password Found' : 'Not Found'}</div>
        </div>
        <div>
          <div className="text-gray-500">Attempts</div>
          <div className="font-mono">{(result.attempts || 0).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500">Time</div>
          <div className="font-mono">{((result.elapsed_ms || 0) / 1000).toFixed(2)}s</div>
        </div>
        <div>
          <div className="text-gray-500">Rate</div>
          <div className="font-mono">{(result.rate || 0).toLocaleString()}/s</div>
        </div>
      </div>

      {result.found && result.match && (
        <div className="mt-3 bg-red-500/10 rounded-lg px-3 py-2 text-sm text-red-400">
          Matched: <span className="font-mono font-semibold">{result.match}</span>
        </div>
      )}

      {result.message && (
        <div className="mt-3 text-sm text-gray-400">{result.message}</div>
      )}
    </motion.div>
  )
}

export default function AttackResultsPage() {
  const navigate = useNavigate()
  const { password, attackResults, analysisResult } = usePassword()

  if (!password) return <Navigate to="/input" />

  const attacks = [
    { title: 'Dictionary Attack', key: 'dictionary' },
    { title: 'Hybrid Attack', key: 'hybrid' },
    { title: 'Brute Force Simulation', key: 'bruteforce' },
  ]

  const anyFound = Object.values(attackResults).some(r => r?.found)
  const allComplete = Object.values(attackResults).some(r => r !== null)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-2">Attack Results</h1>
        <p className="text-gray-400 text-center mb-8">
          Summary of all attack simulations on your password.
        </p>

        {/* Overall verdict */}
        {allComplete && (
          <div className={`rounded-xl p-6 mb-8 text-center border ${
            anyFound
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${anyFound ? 'text-red-400' : 'text-green-400'}`}>
              {anyFound ? 'Password Compromised' : 'Password Survived All Attacks'}
            </div>
            <p className={`text-sm ${anyFound ? 'text-red-300/70' : 'text-green-300/70'}`}>
              {anyFound
                ? 'Your password was cracked by at least one attack method. Consider changing it.'
                : 'No attack method was able to crack your password in the simulated scenarios.'}
            </p>
          </div>
        )}

        {/* Result panels */}
        <div className="space-y-4 mb-8">
          {attacks.map(a => (
            <ResultRow key={a.key} title={a.title} result={attackResults[a.key]} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/crack-time')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Crack Time Estimation <HiArrowRight />
          </button>
          <button onClick={() => navigate('/recommendations')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors">
            View Recommendations <HiArrowRight />
          </button>
          <button onClick={() => navigate('/attack-dashboard')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Rerun Attacks
          </button>
        </div>
      </motion.div>
    </div>
  )
}
