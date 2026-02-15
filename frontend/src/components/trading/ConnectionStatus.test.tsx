import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConnectionStatus from './ConnectionStatus';

describe('ConnectionStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Status Display', () => {
    it('should show "Live" with green dot when connected', () => {
      render(<ConnectionStatus />);

      // Initially should show connecting, then become live
      expect(screen.getByText('Connecting...')).toBeInTheDocument();

      // Fast forward past initial connection
      vi.advanceTimersByTime(100);
      vi.runAllTimers();

      expect(screen.getByText('Live')).toBeInTheDocument();
      const statusDot = screen.getByTestId('connection-dot');
      expect(statusDot).toHaveClass('bg-[#40ffa9]');
    });

    it('should show "Connecting..." with yellow/amber dot when connecting', () => {
      render(<ConnectionStatus simulateDisconnection={true} />);

      // Should show connecting state
      expect(screen.getByText('Connecting...')).toBeInTheDocument();

      const statusDot = screen.getByTestId('connection-dot');
      expect(statusDot).toHaveClass('bg-[#fbbf24]');
    });

    it('should show "Disconnected" with red dot when disconnected', () => {
      const { rerender } = render(<ConnectionStatus simulateDisconnection={true} />);

      // Force disconnected state
      rerender(<ConnectionStatus simulateDisconnection={true} forceDisconnected={true} />);

      expect(screen.getByText('Disconnected')).toBeInTheDocument();

      const statusDot = screen.getByTestId('connection-dot');
      expect(statusDot).toHaveClass('bg-[#ff6b6b]');
    });
  });

  describe('Auto-Reconnect Logic', () => {
    it('should attempt reconnection with exponential backoff', () => {
      const onReconnectAttempt = vi.fn();
      render(<ConnectionStatus onReconnectAttempt={onReconnectAttempt} simulateDisconnection={true} />);

      // Initial connection attempt
      vi.advanceTimersByTime(100);
      expect(onReconnectAttempt).toHaveBeenCalledTimes(1);

      // Trigger disconnection
      vi.advanceTimersByTime(1000);

      // First reconnect attempt after 1s
      vi.advanceTimersByTime(1000);
      expect(onReconnectAttempt).toHaveBeenCalledTimes(2);

      // Second reconnect attempt after 2s (exponential backoff: 1s -> 2s)
      vi.advanceTimersByTime(2000);
      expect(onReconnectAttempt).toHaveBeenCalledTimes(3);

      // Third reconnect attempt after 4s (2s -> 4s)
      vi.advanceTimersByTime(4000);
      expect(onReconnectAttempt).toHaveBeenCalledTimes(4);

      // Fourth reconnect attempt after 8s max (4s -> 8s max)
      vi.advanceTimersByTime(8000);
      expect(onReconnectAttempt).toHaveBeenCalledTimes(5);

      // Should cap at 8s for subsequent attempts
      vi.advanceTimersByTime(8000);
      expect(onReconnectAttempt).toHaveBeenCalledTimes(6);
    });

    it('should stop reconnect attempts when successfully reconnected', () => {
      const onReconnectAttempt = vi.fn();
      const onStatusChange = vi.fn();

      render(
        <ConnectionStatus
          onReconnectAttempt={onReconnectAttempt}
          onStatusChange={onStatusChange}
          simulateDisconnection={true}
        />
      );

      // Trigger reconnection
      vi.advanceTimersByTime(1000);
      vi.runAllTimers();

      // Eventually should reach "Live" state
      expect(onStatusChange).toHaveBeenCalledWith('live');
    });
  });

  describe('Status Change Callbacks', () => {
    it('should call onStatusChange when connection status changes', () => {
      const onStatusChange = vi.fn();
      render(<ConnectionStatus onStatusChange={onStatusChange} />);

      // Initial connecting state
      expect(onStatusChange).toHaveBeenCalledWith('connecting');

      // After successful connection
      vi.advanceTimersByTime(100);
      vi.runAllTimers();
      expect(onStatusChange).toHaveBeenCalledWith('live');
    });

    it('should call onStatusChange with disconnected when connection fails', () => {
      const onStatusChange = vi.fn();
      render(
        <ConnectionStatus
          onStatusChange={onStatusChange}
          simulateDisconnection={true}
          forceDisconnected={true}
        />
      );

      expect(onStatusChange).toHaveBeenCalledWith('disconnected');
    });
  });

  describe('Demo Simulation', () => {
    it('should support simulated connection state changes for demo', () => {
      const onStatusChange = vi.fn();

      const { rerender } = render(
        <ConnectionStatus onStatusChange={onStatusChange} demoMode={true} />
      );

      // In demo mode, should start live
      vi.advanceTimersByTime(100);
      vi.runAllTimers();
      expect(onStatusChange).toHaveBeenCalledWith('live');

      // Trigger demo disconnection
      rerender(<ConnectionStatus onStatusChange={onStatusChange} demoMode={true} demoDisconnected={true} />);
      expect(onStatusChange).toHaveBeenCalledWith('disconnected');

      // Trigger demo reconnection
      rerender(<ConnectionStatus onStatusChange={onStatusChange} demoMode={true} demoDisconnected={false} />);
      vi.advanceTimersByTime(100);
      vi.runAllTimers();
      expect(onStatusChange).toHaveBeenCalledWith('live');
    });
  });

  describe('Compact Design', () => {
    it('should render in a compact format suitable for headers', () => {
      const { container } = render(<ConnectionStatus />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('gap-2');
    });

    it('should have small dot indicator', () => {
      render(<ConnectionStatus />);

      const statusDot = screen.getByTestId('connection-dot');
      expect(statusDot).toHaveClass('w-2');
      expect(statusDot).toHaveClass('h-2');
    });
  });

  describe('Colors', () => {
    it('should use correct green color (#40ffa9) for live status', () => {
      render(<ConnectionStatus />);

      vi.advanceTimersByTime(100);
      vi.runAllTimers();

      const statusDot = screen.getByTestId('connection-dot');
      expect(statusDot).toHaveClass('bg-[#40ffa9]');
    });

    it('should use correct red color (#ff6b6b) for disconnected status', () => {
      render(<ConnectionStatus forceDisconnected={true} />);

      const statusDot = screen.getByTestId('connection-dot');
      expect(statusDot).toHaveClass('bg-[#ff6b6b]');
    });

    it('should use amber color for connecting status', () => {
      render(<ConnectionStatus simulateDisconnection={true} />);

      const statusDot = screen.getByTestId('connection-dot');
      expect(statusDot).toHaveClass('bg-[#fbbf24]');
    });
  });
});
