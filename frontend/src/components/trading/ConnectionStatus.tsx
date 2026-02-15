import React, { useState, useEffect } from 'react'

interface ConnectionStatusProps {
  simulateDisconnection?: boolean
  forceDisconnected?: boolean
  onReconnectAttempt?: () => void
  onStatusChange?: (status: 'live' | 'disconnected' | 'connecting') => void
  demoMode?: boolean
  demoDisconnected?: boolean
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  simulateDisconnection = false,
  forceDisconnected = false,
  onReconnectAttempt,
  onStatusChange,
  demoMode = false,
  demoDisconnected = false,
}) => {
  const [status, setStatus] = useState<'live' | 'disconnected' | 'connecting'>('live')
  const [isReconnecting, setIsReconnecting] = useState(false)

  useEffect(() => {
    if (forceDisconnected || (demoMode && demoDisconnected)) {
      setStatus('disconnected')
    } else if (simulateDisconnection) {
      // Start in connecting state when simulating
      setStatus('connecting')
      // Then switch to live after animation
      const timer = setTimeout(() => {
        setStatus('live')
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setStatus('live')
    }
  }, [simulateDisconnection, forceDisconnected, demoMode, demoDisconnected])

  useEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  const handleReconnect = () => {
    setIsReconnecting(true)
    setStatus('connecting')
    onReconnectAttempt?.()
    setTimeout(() => {
      setStatus('live')
      setIsReconnecting(false)
    }, 2000)
  }

  if (status === 'live') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0e17]/50 rounded-lg" data-testid="connection-status">
        <div className="w-2 h-2 rounded-full bg-[#40ffa9] animate-pulse" data-testid="connection-dot" />
        <span className="text-xs text-[#40ffa9] font-medium" data-testid="connection-text">Live</span>
      </div>
    )
  }

  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0e17]/50 rounded-lg" data-testid="connection-status">
        <div className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse" data-testid="connection-dot" />
        <span className="text-xs text-[#fbbf24] font-medium" data-testid="connection-text">Connecting...</span>
      </div>
    )
  }

  // disconnected state
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0e17]/50 rounded-lg" data-testid="connection-status">
      <div className="w-2 h-2 rounded-full bg-[#ff6b6b]" data-testid="connection-dot" />
      <span className="text-xs text-[#ff6b6b] font-medium" data-testid="connection-text">Disconnected</span>
      <button
        onClick={handleReconnect}
        disabled={isReconnecting}
        className="text-xs text-[#9ca3af] hover:text-[#40ffa9] disabled:opacity-50"
        data-testid="reconnect-button"
      >
        {isReconnecting ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  )
}

export default ConnectionStatus
