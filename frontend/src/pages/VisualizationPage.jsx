import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter
} from 'recharts'
import api from '../services/api'

const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#22c55e', '#eab308']

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

function formatSeconds(s) {
  if (s < 1) return 'Instant'
  if (s < 60) return `${s.toFixed(0)}s`
  if (s < 3600) return `${(s / 60).toFixed(0)}m`
  if (s < 86400) return `${(s / 3600).toFixed(0)}h`
  if (s < 86400 * 365) return `${(s / 86400).toFixed(0)}d`
  return `${(s / (86400 * 365)).toFixed(0)}y`
}

export default function VisualizationPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/visualization-data')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading visualization data...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
        Failed to load visualization data.
      </div>
    )
  }

  // Prepare crack time data with log scale for display
  const crackTimeData = (data.lengthVsCrackTime || []).map(d => ({
    ...d,
    cpuLog: d.cpuSeconds > 0 ? Math.log10(d.cpuSeconds) : 0,
    gpuLog: d.gpuSeconds > 0 ? Math.log10(d.gpuSeconds) : 0,
    clusterLog: d.clusterSeconds > 0 ? Math.log10(d.clusterSeconds) : 0,
  }))

  // Charset data
  const charsetData = data.charsetVsSecurity || []

  // Attack success data for pie chart
  const attackData = data.attackTypeVsSuccess || {}
  const pieData = Object.entries(attackData).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    found: val.found || 0,
    notFound: val.total - (val.found || 0),
    total: val.total || 0,
    successRate: Math.round((val.successRate || 0) * 100),
  }))

  const customTooltipStyle = {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#fff',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-2">Security Visualizations</h1>
        <p className="text-gray-400 text-center mb-8">
          Interactive charts showing password security metrics and attack analysis.
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* 1. Password Length vs Crack Time */}
          <ChartCard title="Password Length vs Crack Time (log scale)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={crackTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="length" stroke="#9ca3af" label={{ value: 'Length', position: 'bottom', fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" tickFormatter={(v) => `10^${v.toFixed(0)}`}
                  label={{ value: 'Seconds (log₁₀)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                <Tooltip contentStyle={customTooltipStyle}
                  formatter={(value, name) => {
                    const map = { cpuLog: 'CPU', gpuLog: 'GPU', clusterLog: 'Cluster' }
                    return [`10^${value.toFixed(1)} seconds`, map[name] || name]
                  }} />
                <Legend />
                <Line type="monotone" dataKey="cpuLog" name="CPU" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="gpuLog" name="GPU" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="clusterLog" name="Cluster" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2. Character Set vs Entropy Per Char */}
          <ChartCard title="Character Set vs Entropy Per Character">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charsetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="charset" stroke="#9ca3af" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="#9ca3af" label={{ value: 'Bits/char', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                <Tooltip contentStyle={customTooltipStyle}
                  formatter={(value, name) => [
                    `${value} bits`,
                    name === 'entropyPerChar' ? 'Entropy/char' : name
                  ]} />
                <Bar dataKey="entropyPerChar" name="Entropy per char" radius={[4, 4, 0, 0]}>
                  {charsetData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3. Character Set Size comparison */}
          <ChartCard title="Character Set Size Comparison">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charsetData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="charset" stroke="#9ca3af" width={120} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={customTooltipStyle}
                  formatter={(value) => [`${value} characters`, 'Pool size']} />
                <Bar dataKey="size" name="Character pool" radius={[0, 4, 4, 0]}>
                  {charsetData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4. Attack Type Success Rate */}
          <ChartCard title="Attack Type Success Rates">
            {pieData.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Legend />
                  <Bar dataKey="found" name="Cracked" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="notFound" name="Survived" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <p className="mb-2">No attack data available yet.</p>
                  <p className="text-sm">Run some attacks to see success rate comparisons.</p>
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/recommendations')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
            View Recommendations <HiArrowRight />
          </button>
          <button onClick={() => navigate('/input')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Test Another Password
          </button>
        </div>
      </motion.div>
    </div>
  )
}
