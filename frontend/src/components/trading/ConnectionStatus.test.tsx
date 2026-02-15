import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import ConnectionStatus from './ConnectionStatus';

describe('ConnectionStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Status Display', () => {
    it('should show "Live" with green dot when connected', async () => {
      render(<ConnectionStatus />);

      // Initially should show connecting, then become live
      expect(screen.getByText('Connecting...')).toBeInTheDocument();

      // Fast forward past initial connection
      await act(async () => {
        vi.advanceTimersByTime(100);
        vi.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('Live')).toBeInTheDocument();
      });

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
      act(() => {
        rerender(<ConnectionStatus simulateDisconnection={true} forceDisconnected={true} />);
      });

      expect(screen.getByText('Disconnected')).toBeInTheDocument();

      const statusDot = screen.getByTestId('connection-dot');
      expect(statusDot).toHaveClass('bg-[#ff6b6b]');
    });
  });

  describe('Manual Reconnect', () => {
    it('should call onReconnectAttempt when reconnect button is clicked', () => {
      const onReconnectAttempt = vi.fn();
      render(<ConnectionStatus forceDisconnected={true} onReconnectAttempt={onReconnectAttempt} />);

      const reconnectButton = screen.getByTestId('reconnect-button');
      reconnectButton.click();

      expect(onReconnectAttempt).toHaveBeenCalled();
    });

    it('should show connecting state after reconnect button click', () => {
      const { container } = render(<ConnectionStatus forceDisconnected={true} />);

      const reconnectButton = screen.getByTestId('reconnect-button');
      reconnectButton.click();

      // Fast forward through the reconnect timeout
      vi.advanceTimersByTime(2000);
      vi.runAllTimers();

      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should disable reconnect button while reconnecting', () => {
      render(<ConnectionStatus forceDisconnected={true} />);

      const reconnectButton = screen.getByTestId('reconnect-button');
      reconnectButton.click();

      // Button should be disabled during reconnect
      expect(reconnectButton).toBeDisabled();

      // After reconnect completes, button is re-enabled
      vi.advanceTimersByTime(2000);
      vi.runAllTimers();
    });
  });

  describe('Status Change Callbacks', () => {
    it('should call onStatusChange when connection status changes', async () => {
      const onStatusChange = vi.fn();
      render(<ConnectionStatus onStatusChange={onStatusChange} />);

      // Initial connecting state
      expect(onStatusChange).toHaveBeenCalledWith('connecting');

      // After successful connection
      await act(async () => {
        vi.advanceTimersByTime(100);
        vi.runAllTimers();
      });

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('live');
      });
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
    it('should support simulated connection state changes for demo', async () => {
      const onStatusChange = vi.fn();

      const { rerender } = render(
        <ConnectionStatus onStatusChange={onStatusChange} demoMode={true} />
      );

      // In demo mode, should start live
      await act(async () => {
        vi.advanceTimersByTime(100);
        vi.runAllTimers();
      });

      expect(onStatusChange).toHaveBeenCalledWith('live');

      // Trigger demo disconnection
      act(() => {
        rerender(<ConnectionStatus onStatusChange={onStatusChange} demoMode={true} demoDisconnected={true} />);
      });
      expect(onStatusChange).toHaveBeenCalledWith('disconnected');

      // Trigger demo reconnection
      act(() => {
        rerender(<ConnectionStatus onStatusChange={onStatusChange} demoMode={true} demoDisconnected={false} />);
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
        vi.runAllTimers();
      });

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
    it('should use correct green color (#40ffa9) for live status', async () => {
      render(<ConnectionStatus />);

      await act(async () => {
        vi.advanceTimersByTime(100);
        vi.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('Live')).toBeInTheDocument();
      });

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
