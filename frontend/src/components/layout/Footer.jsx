import { HiShieldCheck } from 'react-icons/hi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <HiShieldCheck className="text-blue-400" />
          <span className="font-semibold text-gray-400">PassGuard</span>
        </div>
        <p>Password Strength Evaluation &amp; Attack Simulation Platform</p>
        <p className="mt-1">Built for cybersecurity education and research</p>
      </div>
    </footer>
  )
}
