import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, User, LogOut, ChevronDown, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type NavbarMode = 'landing' | 'app';

interface NavbarProps {
  mode: NavbarMode;
  scrolled?: boolean; // Only used when mode='landing' for external scroll state
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Navbar = ({ mode, scrolled: _externalScrolled, isLoggedIn, onLoginClick, onLogout }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalScrolled, setInternalScrolled] = useState(false);
  const location = useLocation();

  // For landing mode, track scroll position internally
  useEffect(() => {
    if (mode !== 'landing') return;

    const handleScroll = () => {
      setInternalScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode]);

  // Determine scrolled state based on mode
  const isScrolled = mode === 'landing' ? internalScrolled : true;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Markets', path: '/markets' },
    { name: 'Trading', path: '/trade' },
    { name: 'Portfolio', path: '/portfolio' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'h-14 lg:h-16 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-white/5'
          : 'h-14 lg:h-16 bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#40ffa9] to-[#0d7f54] flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
              <span className="text-[#0a0e17] font-bold text-sm">C</span>
            </div>
            <span className="font-semibold">
              Carbon<span className="text-[#40ffa9]">X</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                  isActive(link.path)
                    ? 'text-[#40ffa9] bg-[#40ffa9]/10'
                    : 'text-[#9ca3af] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell - Desktop */}
            <button aria-label="Notifications" className="hidden md:flex p-2 text-[#9ca3af] hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label="User menu" className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#40ffa9]/30 to-[#0d7f54]/30 flex items-center justify-center border border-[#40ffa9]/30">
                      <User className="w-3.5 h-3.5 text-[#40ffa9]" />
                    </div>
                    <span className="text-sm hidden sm:inline">0x7a...3f9</span>
                    <ChevronDown className="w-4 h-4 text-[#9ca3af]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#111827] border-white/10 text-white min-w-[160px]">
                  <DropdownMenuItem className="hover:bg-white/5 cursor-pointer focus:bg-white/5">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/5 cursor-pointer focus:bg-white/5">
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-white/5 cursor-pointer text-[#ff6b6b] focus:bg-white/5 focus:text-[#ff6b6b]"
                    onClick={(e) => {
                      e.preventDefault();
                      onLogout();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={onLoginClick}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Connect</span>
                <span className="sm:hidden">Wallet</span>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              aria-label="Toggle menu"
              className="md:hidden p-2 text-[#9ca3af] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0e17]/98 backdrop-blur-xl border-b border-white/5">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'bg-[#40ffa9]/10 text-[#40ffa9]'
                    : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!isLoggedIn && (
              <Button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-primary mt-2"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
