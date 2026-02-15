import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts - Keyboard Event Handling (TDG)', () => {
  beforeEach(() => {
    // Reset any event listeners
    document.removeEventListener('keydown', vi.fn())
    document.removeEventListener('keyup', vi.fn())
  })

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty shortcuts', () => {
      const { result } = renderHook(() => useKeyboardShortcuts())
      expect(result.current.shortcuts).toEqual({})
    })

    it('should provide methods for managing shortcuts', () => {
      const { result } = renderHook(() => useKeyboardShortcuts())
      expect(result.current.registerShortcut).toBeInstanceOf(Function)
      expect(result.current.unregisterShortcut).toBeInstanceOf(Function)
      expect(result.current.unregisterAll).toBeInstanceOf(Function)
    })
  })

  describe('Registering Shortcuts', () => {
    it('should register a keyboard shortcut', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('ctrl+k', callback)
      })

      expect(result.current.shortcuts).toHaveProperty('ctrl+k')
    })

    it('should register multiple shortcuts', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('ctrl+k', callback1)
        result.current.registerShortcut('escape', callback2)
      })

      expect(Object.keys(result.current.shortcuts).length).toBe(2)
    })

    it('should handle shortcuts with modifiers', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('ctrl+shift+k', callback)
      })

      expect(result.current.shortcuts).toHaveProperty('ctrl+shift+k')
    })
  })

  describe('Triggering Shortcuts', () => {
    it('should trigger callback when shortcut is pressed', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('escape', callback)
      })

      // Simulate key press
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should trigger callback with ctrl modifier', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('ctrl+k', callback)
      })

      // Simulate ctrl+k
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should not trigger callback when modifiers dont match', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('ctrl+k', callback)
      })

      // Press k without ctrl
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: false })
      document.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should pass event to callback', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('escape', callback)
      })

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Escape' })
      )
    })
  })

  describe('Unregistering Shortcuts', () => {
    it('should unregister a specific shortcut', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('escape', callback)
        result.current.unregisterShortcut('escape')
      })

      expect(result.current.shortcuts).not.toHaveProperty('escape')
    })

    it('should not trigger unregistered shortcut', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('escape', callback)
        result.current.unregisterShortcut('escape')
      })

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should unregister all shortcuts', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('escape', callback1)
        result.current.registerShortcut('ctrl+k', callback2)
        result.current.unregisterAll()
      })

      expect(Object.keys(result.current.shortcuts).length).toBe(0)
    })
  })

  describe('Preventing Default Behavior', () => {
    it('should prevent default when configured', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('ctrl+k', callback, { preventDefault: true })
      })

      const preventDefaultSpy = vi.fn()
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy })

      document.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should not prevent default by default', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('escape', callback)
      })

      const preventDefaultSpy = vi.fn()
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy })

      document.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty key strings', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('', callback)
      })

      // Should not crash
      expect(result.current.shortcuts).toHaveProperty('')
    })

    it('should handle unregistering non-existent shortcut', () => {
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.unregisterShortcut('nonexistent')
      })

      // Should not crash
      expect(result.current.shortcuts).toEqual({})
    })

    it('should overwrite existing shortcut when registering same key', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('escape', callback1)
        result.current.registerShortcut('escape', callback2)
      })

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = renderHook(() => useKeyboardShortcuts())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Common Trading Shortcuts', () => {
    it('should support buy shortcut (b)', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('b', callback)
      })

      const event = new KeyboardEvent('keydown', { key: 'b' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should support sell shortcut (s)', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('s', callback)
      })

      const event = new KeyboardEvent('keydown', { key: 's' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should support cancel shortcut (escape)', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useKeyboardShortcuts())

      act(() => {
        result.current.registerShortcut('escape', callback)
      })

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })
  })
})
