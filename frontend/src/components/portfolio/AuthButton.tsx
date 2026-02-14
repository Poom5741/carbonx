import React from 'react'

interface AuthButtonProps {
  isLoggedIn: boolean
  onLoginClick: () => void
}

export const AuthButton: React.FC<AuthButtonProps> = ({ isLoggedIn, onLoginClick }) => {
  if (!isLoggedIn) {
    return (
      <button
        onClick={onLoginClick}
        className="px-6 py-2 bg-[#40ffa9] text-black font-semibold rounded-lg hover:bg-[#34cc87] transition-colors"
      >
        Connect
      </button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-gray-400 text-sm">0x1234...5678</span>
      <button className="text-gray-400 hover:text-white transition-colors">
        ▼
      </button>
    </div>
  )
}
