import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiExclamation, HiCheck, HiShieldCheck } from 'react-icons/hi'
import { usePassword } from '../context/PasswordContext'
import { getStrengthColor } from '../utils/passwordUtils'
import { formatDuration } from '../utils/formatters'

export default function AnalysisPage() {
  const navigate = useNavigate()
  const { analysisResult: r } = usePassword()

  if (!r) return <Navigate to="/input" />

  const strengthColor = getStrengthColor(r.strengthLabel)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8 text-center">Password Analysis</h1>

        {/* Strength overview */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6 text-center">
          <div className="text-6xl font-bold mb-2" style={{ color: strengthColor }}>
            {r.strengthScore}
          </div>
          <div className="text-xl font-semibold mb-4" style={{ color: strengthColor }}>
            {r.strengthLabel}
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 max-w-md mx-auto">
            <motion.div className="h-3 rounded-full" style={{ backgroundColor: strengthColor }}
              initial={{ width: 0 }} animate={{ width: `${r.strengthScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Metrics */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Metrics</h2>
            <div className="space-y-3">
              {[
                { label: 'Length', value: r.length },
                { label: 'Character Set Size', value: r.charsetSize },
                { label: 'Entropy', value: `${r.entropy.toFixed(1)} bits` },
              ].map(m => (
                <div key={m.label} className="flex justify-between">
                  <span className="text-gray-400">{m.label}</span>
                  <span className="font-mono">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Character classes */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <h3 className="text-sm text-gray-400 mb-2">Character Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Lowercase (a-z)', active: r.charset.lowercase },
                  { label: 'Uppercase (A-Z)', active: r.charset.uppercase },
                  { label: 'Digits (0-9)', active: r.charset.digits },
                  { label: 'Special (!@#)', active: r.charset.special },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-2 text-sm">
                    {c.active
                      ? <HiCheck className="text-green-400" />
                      : <span className="w-4 h-4 rounded-full border border-gray-700 inline-block" />}
                    <span className={c.active ? 'text-white' : 'text-gray-600'}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crack Time Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Estimated Crack Time</h2>
            <div className="space-y-4">
              {[
                { tier: 'CPU', data: r.crackTimeEstimates.cpu, desc: '1M guesses/sec' },
                { tier: 'GPU', data: r.crackTimeEstimates.gpu, desc: '1B guesses/sec' },
                { tier: 'GPU Cluster', data: r.crackTimeEstimates.cluster, desc: '100B guesses/sec' },
              ].map(t => (
                <div key={t.tier} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{t.tier}</div>
                      <div className="text-xs text-gray-500">{t.desc}</div>
                    </div>
                    <div className="text-right font-mono text-sm text-blue-400">
                      {t.data.display}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patterns / Warnings */}
        {r.commonPatterns.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <HiExclamation /> Patterns Detected
            </h2>
            <ul className="space-y-1">
              {r.commonPatterns.map((p, i) => (
                <li key={i} className="text-yellow-200/80 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/attack-dashboard')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors text-center">
            Run Attack Simulation
          </button>
          <button onClick={() => navigate('/crack-time')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors text-center">
            View Crack Time Details
          </button>
        </div>
      </motion.div>
    </div>
  )
}
