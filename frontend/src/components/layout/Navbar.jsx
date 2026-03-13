import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { HiShieldCheck, HiMenu, HiX } from 'react-icons/hi'

const links = [
  { to: '/', label: 'Home' },
  { to: '/input', label: 'Analyze' },
  { to: '/attack-dashboard', label: 'Attack Sim' },
  { to: '/visualizations', label: 'Charts' },
  { to: '/recommendations', label: 'Tips' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-blue-400 font-bold text-lg">
            <HiShieldCheck className="text-2xl" />
            PassGuard
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === l.to
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-gray-300" onClick={() => setOpen(!open)}>
            {open ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 pb-3">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm ${
                pathname === l.to ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
