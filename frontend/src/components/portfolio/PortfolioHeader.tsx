import React from 'react'
import { Link } from 'react-router-dom'

interface NavLink {
  name: string
  path: string
}

interface PortfolioHeaderProps {
  isLoggedIn: boolean
  onLoginClick: () => void
}

const navLinks: NavLink[] = [
  { name: 'Trade', path: '/trade' },
  { name: 'Markets', path: '/markets' },
  { name: 'Portfolio', path: '/portfolio' },
]

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ isLoggedIn, onLoginClick }) => {
  return (
    <header className="border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white">
          CarbonX
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        {!isLoggedIn && (
          <button
            onClick={onLoginClick}
            className="px-6 py-2 bg-[#40ffa9] text-black font-semibold rounded-lg hover:bg-[#34cc87] transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </header>
  )
}
