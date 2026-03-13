import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiExclamation, HiInformationCircle, HiArrowRight } from 'react-icons/hi'
import { usePassword } from '../context/PasswordContext'
import api from '../services/api'

const PRIORITY_CONFIG = {
  high: {
    bg: 'bg-red-500/10 border-red-500/30',
    icon: HiExclamation,
    iconColor: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400',
    label: 'High Priority',
  },
  medium: {
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon: HiExclamation,
    iconColor: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-400',
    label: 'Medium',
  },
  low: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    icon: HiInformationCircle,
    iconColor: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400',
    label: 'Suggestion',
  },
}

function RecCard({ rec, index }) {
  const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.low
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border rounded-xl p-5 ${cfg.bg}`}
    >
      <div className="flex items-start gap-4">
        <Icon className={`text-2xl mt-0.5 shrink-0 ${cfg.iconColor}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{rec.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
          </div>
          <p className="text-sm text-gray-400">{rec.description}</p>
          {rec.category && (
            <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
              {rec.category}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const navigate = useNavigate()
  const { password, attackResults } = usePassword()
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!password) return
    const attackPayload = {
      dictionary_found: attackResults.dictionary?.found || false,
      hybrid_found: attackResults.hybrid?.found || false,
      bruteforce_found: attackResults.bruteforce?.found || false,
    }

    api.post('/recommendations', { password, attackResults: attackPayload })
      .then(res => setRecs(res.data.recommendations || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [password, attackResults])

  if (!password) return <Navigate to="/input" />

  const highCount = recs.filter(r => r.priority === 'high').length
  const medCount = recs.filter(r => r.priority === 'medium').length
  const lowCount = recs.filter(r => r.priority === 'low').length

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-2">Security Recommendations</h1>
        <p className="text-gray-400 text-center mb-8">
          Personalized suggestions to improve your password security.
        </p>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Generating recommendations...</div>
        ) : recs.length > 0 ? (
          <>
            {/* Summary */}
            <div className="flex justify-center gap-6 mb-8">
              {highCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-gray-400">{highCount} high priority</span>
                </div>
              )}
              {medCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-gray-400">{medCount} medium</span>
                </div>
              )}
              {lowCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-gray-400">{lowCount} suggestions</span>
                </div>
              )}
            </div>

            {/* Recommendation cards */}
            <div className="space-y-3 mb-8">
              {recs.map((rec, i) => (
                <RecCard key={i} rec={rec} index={i} />
              ))}
            </div>

            {/* Score summary */}
            {recs.length <= 2 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8 text-center">
                <HiShieldCheck className="text-4xl text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-semibold">Your password follows most security best practices!</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 mb-8 text-center">
            <HiShieldCheck className="text-5xl text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-semibold text-lg">Excellent!</p>
            <p className="text-green-300/70 text-sm mt-1">No specific recommendations. Your password is strong.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/input')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Test Another Password <HiArrowRight />
          </button>
          <button onClick={() => navigate('/visualizations')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors">
            View Visualizations
          </button>
        </div>
      </motion.div>
    </div>
  )
}
