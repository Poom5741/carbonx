import { useState, useCallback, useEffect, useRef } from 'react'

export interface ShortcutOptions {
  preventDefault?: boolean
}

export interface Shortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  callback: (event: KeyboardEvent) => void
  options: ShortcutOptions
}

export interface KeyboardShortcutsReturn {
  shortcuts: Record<string, Shortcut>
  registerShortcut: (key: string, callback: (event: KeyboardEvent) => void, options?: ShortcutOptions) => void
  unregisterShortcut: (key: string) => void
  unregisterAll: () => void
}

/**
 * Parses a shortcut string into its components
 * Examples: "ctrl+k", "ctrl+shift+k", "escape", "b"
 */
function parseShortcut(keyString: string): {
  key: string
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
} {
  const parts = keyString.toLowerCase().split('+')

  return {
    key: parts[parts.length - 1], // Last part is the key
    ctrlKey: parts.includes('ctrl'),
    shiftKey: parts.includes('shift'),
    altKey: parts.includes('alt'),
    metaKey: parts.includes('meta') || parts.includes('cmd')
  }
}

/**
 * Checks if a keyboard event matches a shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: {
  key: string
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
}): boolean {
  const eventKey = event.key.toLowerCase()

  // Check for special keys
  if (shortcut.key === 'escape' && eventKey !== 'escape') return false

  // Check modifiers
  if (shortcut.ctrlKey !== event.ctrlKey) return false
  if (shortcut.shiftKey !== event.shiftKey) return false
  if (shortcut.altKey !== event.altKey) return false
  if (shortcut.metaKey !== event.metaKey) return false

  // Check key match (handle special cases)
  if (shortcut.key === eventKey) return true
  if (shortcut.key.length === 1 && eventKey === shortcut.key) return true

  return false
}

/**
 * useKeyboardShortcuts - Manages keyboard shortcuts for the application
 *
 * Features:
 * - Register keyboard shortcuts with callbacks
 * - Support for modifier keys (ctrl, shift, alt, meta)
 * - Prevent default behavior option
 * - Automatic cleanup on unmount
 *
 * @returns Object with shortcut management methods
 */
export function useKeyboardShortcuts(): KeyboardShortcutsReturn {
  const [shortcuts, setShortcuts] = useState<Record<string, Shortcut>>({})
  const shortcutsRef = useRef<Record<string, Shortcut>>({})

  // Keep ref in sync with state
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  // Register a shortcut
  const registerShortcut = useCallback((
    key: string,
    callback: (event: KeyboardEvent) => void,
    options: ShortcutOptions = {}
  ) => {
    const parsed = parseShortcut(key)

    const shortcut: Shortcut = {
      key: parsed.key,
      ctrlKey: parsed.ctrlKey,
      shiftKey: parsed.shiftKey,
      altKey: parsed.altKey,
      metaKey: parsed.metaKey,
      callback,
      options
    }

    setShortcuts(prev => ({
      ...prev,
      [key]: shortcut
    }))

    shortcutsRef.current[key] = shortcut
  }, [])

  // Unregister a shortcut
  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })

    delete shortcutsRef.current[key]
  }, [])

  // Unregister all shortcuts
  const unregisterAll = useCallback(() => {
    setShortcuts({})
    shortcutsRef.current = {}
  }, [])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of Object.values(shortcutsRef.current)) {
        // Ensure all required boolean properties are defined
        const shortcutConfig = {
          key: shortcut.key,
          ctrlKey: shortcut.ctrlKey || false,
          shiftKey: shortcut.shiftKey || false,
          altKey: shortcut.altKey || false,
          metaKey: shortcut.metaKey || false
        }

        if (matchesShortcut(event, shortcutConfig)) {
          if (shortcut.options.preventDefault) {
            event.preventDefault()
          }
          shortcut.callback(event)
          break // Only trigger one shortcut per event
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    unregisterAll
  }
}
