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

  return null
}
