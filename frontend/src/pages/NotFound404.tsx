import React from 'react'
import { Link } from 'react-router-dom'

export const NotFound404: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Large 404 Text */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#40ffa9] to-[#34cc87] leading-none">
            404
          </h1>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-lg mb-2">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          It might have been moved or deleted, or you may have mistyped the URL.
        </p>

        {/* Decorative Line */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#40ffa9] to-transparent mx-auto mb-8"></div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="px-8 py-3 bg-[#40ffa9] text-black font-semibold rounded-lg hover:bg-[#34cc87] transition-all duration-200 shadow-lg shadow-[#40ffa9]/20 hover:shadow-[#40ffa9]/40"
          >
            Go to Home
          </Link>
          <Link
            to="/markets"
            className="px-8 py-3 bg-[#111827] text-white font-semibold rounded-lg hover:bg-[#1f2937] transition-colors border border-gray-700"
          >
            View Markets
          </Link>
        </div>

        {/* Additional Links */}
        <div className="mt-12 flex gap-6 justify-center text-sm">
          <Link to="/trade" className="text-gray-500 hover:text-[#40ffa9] transition-colors">
            Trading
          </Link>
          <span className="text-gray-700">•</span>
          <Link to="/portfolio" className="text-gray-500 hover:text-[#40ffa9] transition-colors">
            Portfolio
          </Link>
          <span className="text-gray-700">•</span>
          <Link to="/markets" className="text-gray-500 hover:text-[#40ffa9] transition-colors">
            Markets
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound404;
