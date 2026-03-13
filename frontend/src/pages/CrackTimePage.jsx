import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiClock, HiChip, HiArrowRight } from 'react-icons/hi'
import { usePassword } from '../context/PasswordContext'
import { formatNumber } from '../utils/formatters'
import api from '../services/api'

const TIER_CONFIG = {
  cpu: { label: 'CPU Attack', desc: '1 Million guesses/sec', icon: '🖥️', color: 'blue' },
  gpu: { label: 'GPU Attack', desc: '1 Billion guesses/sec', icon: '🎮', color: 'purple' },
  cluster: { label: 'GPU Cluster', desc: '100 Billion guesses/sec', icon: '🏗️', color: 'red' },
}

function TierCard({ tier, data }) {
  const cfg = TIER_CONFIG[tier]
  const borderColor = {
    blue: 'border-blue-500/30 hover:border-blue-500/60',
    purple: 'border-purple-500/30 hover:border-purple-500/60',
    red: 'border-red-500/30 hover:border-red-500/60',
  }[cfg.color]
  const textColor = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
  }[cfg.color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900 border rounded-xl p-6 transition-colors ${borderColor}`}
    >
      <div className="text-3xl mb-3">{cfg.icon}</div>
      <h3 className="text-lg font-semibold mb-1">{cfg.label}</h3>
      <p className="text-gray-500 text-sm mb-4">{cfg.desc}</p>
      <div className={`text-2xl font-bold font-mono ${textColor}`}>
        {data?.display || '—'}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {formatNumber(data?.rate || 0)} guesses/sec
      </div>
    </motion.div>
  )
}

export default function CrackTimePage() {
  const navigate = useNavigate()
  const { password, analysisResult: r } = usePassword()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!r) return
    api.post('/crack-time', { charsetSize: r.charsetSize, length: r.length })
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [r])

  if (!password || !r) return <Navigate to="/input" />

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-2">Crack Time Estimation</h1>
        <p className="text-gray-400 text-center mb-8">
          Estimated time to brute-force your password on different hardware.
        </p>

        {/* Password info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 text-center">
          <div className="text-sm text-gray-500 mb-1">Your password</div>
          <div className="font-mono text-lg">{'•'.repeat(r.length)}</div>
          <div className="flex justify-center gap-6 text-sm text-gray-400 mt-2">
            <span>Length: <span className="text-white">{r.length}</span></span>
            <span>Charset: <span className="text-white">{r.charsetSize}</span></span>
            <span>Entropy: <span className="text-white">{r.entropy.toFixed(1)} bits</span></span>
          </div>
          {data && (
            <div className="text-xs text-gray-500 mt-2">
              Total combinations: <span className="font-mono text-gray-300">{formatNumber(data.totalCombinations)}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading estimates...</div>
        ) : data ? (
          <>
            {/* Three tier cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {['cpu', 'gpu', 'cluster'].map(tier => (
                <TierCard key={tier} tier={tier} data={data.estimates?.[tier]} />
              ))}
            </div>

            {/* Comparison benchmarks */}
            {data.comparisonBenchmarks && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Comparison Benchmarks</h2>
                <div className="space-y-3">
                  {data.comparisonBenchmarks.map((b, i) => {
                    const isYours = b.label === 'Your password'
                    return (
                      <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                        isYours ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gray-800/50'
                      }`}>
                        <span className={`font-medium ${isYours ? 'text-blue-400' : 'text-gray-300'}`}>
                          {b.label}
                        </span>
                        <div className="flex gap-6 text-sm">
                          <span className="text-gray-400">CPU: <span className="text-blue-400 font-mono">{b.cpuDisplay}</span></span>
                          <span className="text-gray-400 hidden md:inline">GPU: <span className="text-purple-400 font-mono">{b.gpuDisplay}</span></span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-12">Failed to load estimates.</div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/visualizations')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
            View Visualizations <HiArrowRight />
          </button>
          <button onClick={() => navigate('/recommendations')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Recommendations <HiArrowRight />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
