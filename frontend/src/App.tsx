import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar, { type NavbarMode } from './components/Navbar';
import LoginModal from './components/LoginModal';
import LandingPage from './pages/LandingPage';
import TradingPage from './pages/TradingPage';
import MarketsPage from './pages/MarketsPage';
import PortfolioPage from './pages/PortfolioPage';
import NotFound404 from './pages/NotFound404';
import { loadDemoData } from './data/demoData';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();

  // Load demo data on app start if localStorage is empty
  useEffect(() => {
    const hasExistingData = localStorage.getItem('carbonx_orders') ||
                             localStorage.getItem('carbonx_portfolio') ||
                             localStorage.getItem('carbonx_order_history');

    if (!hasExistingData) {
      try {
        loadDemoData();
      } catch (error) {
        console.warn('Failed to load demo data:', error);
      }
    }
  }, []);

  // Determine navbar mode based on route
  const getNavbarMode = (): NavbarMode => {
    if (location.pathname === '/') return 'landing';
    return 'app';
  };

  const navbarMode = getNavbarMode();

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <Navbar
        mode={navbarMode}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}

      <Routes>
        <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginModal(true)} />} />
        <Route path="/trade" element={<TradingPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginModal(true)} />} />
        <Route path="/markets" element={<MarketsPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginModal(true)} />} />
        <Route path="/portfolio" element={<PortfolioPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginModal(true)} />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0e17] text-white">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;