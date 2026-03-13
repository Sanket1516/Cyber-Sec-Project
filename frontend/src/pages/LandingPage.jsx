import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiLightningBolt, HiChartBar, HiClock } from 'react-icons/hi'

const features = [
  { icon: HiShieldCheck, title: 'Password Analysis', desc: 'Evaluate entropy, character composition, and detect common patterns.' },
  { icon: HiLightningBolt, title: 'Attack Simulation', desc: 'Dictionary, hybrid, and brute force attack simulations in real time.' },
  { icon: HiClock, title: 'Crack Time Estimation', desc: 'See how long your password would take to crack on CPU, GPU, and clusters.' },
  { icon: HiChartBar, title: 'Visual Analytics', desc: 'Interactive charts showing password strength metrics and comparisons.' },
]

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm mb-6">
          <HiShieldCheck />
          Cybersecurity Education Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          How Strong Is Your Password?
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Discover how attackers crack passwords using dictionary attacks, hybrid mutations,
          and brute force — and learn how to defend against them.
        </p>
        <Link to="/input"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-blue-600/20">
          Start Password Analysis
        </Link>
      </motion.div>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
          >
            <f.icon className="text-3xl text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-20 text-center">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-start max-w-4xl mx-auto">
          {['Enter your password', 'Analyze strength & entropy', 'Simulate real attacks', 'Get security insights'].map((step, i) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mb-3">{i + 1}</div>
              <p className="text-gray-300 text-sm max-w-[160px]">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
