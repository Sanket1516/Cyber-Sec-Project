import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiPlay, HiStop, HiCheck, HiX, HiDotsHorizontal } from 'react-icons/hi'
import { usePassword } from '../context/PasswordContext'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'

const STATUS_COLORS = {
  waiting: 'text-gray-500',
  running: 'text-yellow-400',
  found: 'text-red-400',
  not_found: 'text-green-400',
  cancelled: 'text-gray-500',
}
const STATUS_LABELS = {
  waiting: 'Waiting',
  running: 'Running',
  found: 'FOUND',
  not_found: 'Not Found',
  cancelled: 'Cancelled',
}

function AttackPanel({ title, status, progress }) {
  const p = progress || {}
  return (
    <div className={`bg-gray-900 border rounded-xl p-6 ${
      status === 'running' ? 'border-yellow-500/50' : status === 'found' ? 'border-red-500/50' : 'border-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`text-sm font-medium ${STATUS_COLORS[status]}`}>
          {status === 'running' && <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse" />}
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
        <motion.div
          className={`h-2 rounded-full ${status === 'found' ? 'bg-red-500' : status === 'not_found' ? 'bg-green-500' : 'bg-blue-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${p.percent || 0}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Attempts</div>
          <div className="font-mono">{(p.attempts || 0).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500">Progress</div>
          <div className="font-mono">{(p.percent || 0).toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-gray-500">Rate</div>
          <div className="font-mono">{(p.rate || 0).toLocaleString()}/s</div>
        </div>
        <div>
          <div className="text-gray-500">Elapsed</div>
          <div className="font-mono">{((p.elapsed_ms || 0) / 1000).toFixed(1)}s</div>
        </div>
      </div>

      {/* Current word */}
      {p.current_word && status === 'running' && (
        <div className="mt-3 bg-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-gray-400 truncate">
          Testing: <span className="text-white">{p.current_word}</span>
        </div>
      )}

      {/* Result message */}
      {p.message && status !== 'running' && status !== 'waiting' && (
        <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${
          status === 'found' ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-400'
        }`}>
          {p.message}
        </div>
      )}
    </div>
  )
}

export default function AttackDashboardPage() {
  const navigate = useNavigate()
  const { password, sessionId, setAttackResults } = usePassword()
  const { socket, isConnected } = useSocket()

  const [attacks, setAttacks] = useState({
    dictionary: { status: 'waiting', progress: {} },
    hybrid: { status: 'waiting', progress: {} },
    bruteforce: { status: 'waiting', progress: {} },
  })
  const [currentAttack, setCurrentAttack] = useState(null)
  const [allDone, setAllDone] = useState(false)

  // Join session room
  useEffect(() => {
    if (socket && sessionId) {
      socket.emit('join_session', { sessionId })
    }
  }, [socket, sessionId])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const onProgress = (data) => {
      const type = data.attack_type
      setAttacks(prev => ({
        ...prev,
        [type]: { status: 'running', progress: data }
      }))
    }

    const onComplete = (data) => {
      const type = data.attack_type
      const status = data.found ? 'found' : 'not_found'
      setAttacks(prev => ({
        ...prev,
        [type]: { status, progress: { ...prev[type].progress, ...data, message: data.message } }
      }))

      // Store result
      setAttackResults(prev => ({ ...prev, [type]: data }))

      // Move to next attack
      if (type === 'dictionary') {
        if (data.found) {
          setCurrentAttack(null)
          setAllDone(true)
        } else {
          launchAttack('hybrid')
        }
      } else if (type === 'hybrid') {
        if (data.found) {
          setCurrentAttack(null)
          setAllDone(true)
        } else {
          launchAttack('bruteforce')
        }
      } else if (type === 'bruteforce') {
        setCurrentAttack(null)
        setAllDone(true)
      }
    }

    socket.on('attack_progress', onProgress)
    socket.on('attack_complete', onComplete)

    return () => {
      socket.off('attack_progress', onProgress)
      socket.off('attack_complete', onComplete)
    }
  }, [socket])

  const launchAttack = useCallback(async (type) => {
    setCurrentAttack(type)
    setAttacks(prev => ({
      ...prev,
      [type]: { status: 'running', progress: { percent: 0, attempts: 0 } }
    }))

    try {
      await api.post(`/attack/${type}`, { password, sessionId })
    } catch (err) {
      console.error(`Failed to start ${type} attack`, err)
    }
  }, [password, sessionId])

  const startAllAttacks = () => {
    setAllDone(false)
    setAttacks({
      dictionary: { status: 'waiting', progress: {} },
      hybrid: { status: 'waiting', progress: {} },
      bruteforce: { status: 'waiting', progress: {} },
    })
    setAttackResults({ dictionary: null, hybrid: null, bruteforce: null })
    launchAttack('dictionary')
  }

  const stopAttack = () => {
    if (socket && sessionId) {
      socket.emit('stop_attack', { session_id: sessionId })
    }
  }

  if (!password || !sessionId) return <Navigate to="/input" />

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-2">Attack Simulation</h1>
        <p className="text-gray-400 text-center mb-8">
          Simulating dictionary, hybrid, and brute force attacks on your password.
        </p>

        {/* Connection status */}
        <div className="flex items-center justify-center gap-2 mb-6 text-sm">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          {!currentAttack && !allDone && (
            <button onClick={startAllAttacks}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              <HiPlay /> Start Attacks
            </button>
          )}
          {currentAttack && (
            <button onClick={stopAttack}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              <HiStop /> Stop
            </button>
          )}
          {allDone && (
            <>
              <button onClick={() => navigate('/attack-results')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                <HiCheck /> View Results
              </button>
              <button onClick={startAllAttacks}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Rerun
              </button>
            </>
          )}
        </div>

        {/* Attack flow indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 text-sm text-gray-500">
          <span className={attacks.dictionary.status !== 'waiting' ? 'text-blue-400' : ''}>Dictionary</span>
          <span>→</span>
          <span className={attacks.hybrid.status !== 'waiting' ? 'text-blue-400' : ''}>Hybrid</span>
          <span>→</span>
          <span className={attacks.bruteforce.status !== 'waiting' ? 'text-blue-400' : ''}>Brute Force</span>
        </div>

        {/* Panels */}
        <div className="space-y-4">
          <AttackPanel title="Dictionary Attack" status={attacks.dictionary.status} progress={attacks.dictionary.progress} />
          <AttackPanel title="Hybrid Attack" status={attacks.hybrid.status} progress={attacks.hybrid.progress} />
          <AttackPanel title="Brute Force Simulation" status={attacks.bruteforce.status} progress={attacks.bruteforce.progress} />
        </div>
      </motion.div>
    </div>
  )
}
