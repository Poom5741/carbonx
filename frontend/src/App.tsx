import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import LandingPage from './pages/LandingPage';
import TradingPage from './pages/TradingPage';
import MarketsPage from './pages/MarketsPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { NotFound404 } from './pages/NotFound404';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0e17] text-white">
        <Navbar 
          scrolled={scrolled} 
          isLoggedIn={isLoggedIn} 
          onLoginClick={handleLogin}
          onLogout={handleLogout}
        />

        {showLoginModal && <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />}

        <Routes>
          <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginModal(true)} />} />
          <Route path="/trade" element={<TradingPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginModal(true)} />} />
          <Route path="/markets" element={<MarketsPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginModal(true)} />} />
          <Route path="/portfolio" element={<PortfolioPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginModal(true)} />} />
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
