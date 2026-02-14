import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, TrendingUp, Shield, Zap, Globe, 
  CheckCircle, BarChart3, Leaf, Wind, Sun, 
  Wallet, Menu, X, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const LandingPage = ({ isLoggedIn, onLoginClick }: LandingPageProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const tradingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for next tick to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Hero animations
        const heroTl = gsap.timeline({ delay: 0.2 });

        heroTl.to('.hero-badge', {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out'
        })
        .to('.hero-title-line', {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out'
        }, '-=0.3')
        .to('.hero-subtitle', {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out'
        }, '-=0.3')
        .to('.hero-cta', {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out'
        }, '-=0.2')
        .to('.hero-stats', {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out'
        }, '-=0.2')
        .to('.hero-image', {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.6');

        // Stats counter animation - use to() instead of from() for reliability
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.to('.stat-card', {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out',
              overwrite: true
            });
          },
          once: true
        });

        // Features animation - use to() instead of from() for reliability
        ScrollTrigger.create({
          trigger: featuresRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.to('.feature-card', {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out',
              overwrite: true
            });
          },
          once: true
        });

        // Trading pairs animation - use to() instead of from() for reliability
        ScrollTrigger.create({
          trigger: tradingRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.to('.trading-card', {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.15,
              ease: 'power3.out',
              overwrite: true
            });
          },
          once: true
        });

        // Refresh ScrollTrigger after all setup
        ScrollTrigger.refresh();
      });

      return () => {
        ctx.revert();
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const tradingPairs = [
    { name: 'REC Token', symbol: 'REC/USDT', price: 45.20, change: 2.4, icon: Sun, desc: 'Renewable Energy Certificate' },
    { name: 'TVER Token', symbol: 'TVER/USDT', price: 12.80, change: 5.1, icon: Wind, desc: 'Thailand Voluntary Emission' },
    { name: 'TVER-P Token', symbol: 'TVER-P/USDT', price: 18.50, change: 3.2, icon: Leaf, desc: 'Premium Carbon Offset' },
  ];

  const features = [
    { icon: Shield, title: 'Blockchain Verified', desc: 'Every credit is traceable and immutable on the blockchain' },
    { icon: Zap, title: 'Instant Settlement', desc: 'T+0 trading with smart contract execution' },
    { icon: Globe, title: 'Global Access', desc: 'Trade 24/7 from anywhere in the world' },
    { icon: BarChart3, title: 'Real-time Data', desc: 'Live price feeds and market depth' },
    { icon: CheckCircle, title: 'I-REC Compatible', desc: 'Fully compliant with international standards' },
    { icon: TrendingUp, title: 'Institutional Grade', desc: 'Professional trading tools and APIs' },
  ];

  const faqs = [
    { q: 'What is a REC token?', a: 'REC (Renewable Energy Certificate) tokens represent 1 MWh of clean energy production. Each token is backed by verified renewable energy generation and can be traded or retired for carbon offsetting purposes.' },
    { q: 'How do I start trading?', a: 'Simply connect your wallet using MetaMask or WalletConnect, deposit USDT, and you can start trading REC, TVER, and TVER-P tokens immediately.' },
    { q: 'Is the platform regulated?', a: 'Yes, CarbonX operates under a UGT-2 Aggregator License and complies with I-REC standards across ASEAN markets.' },
    { q: 'What are the trading fees?', a: 'We charge a competitive 0.1% trading fee per transaction with no deposit or withdrawal fees.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e17]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#40ffa9] to-[#0d7f54] flex items-center justify-center">
                <span className="text-[#0a0e17] font-bold text-lg">C</span>
              </div>
              <span className="font-semibold text-lg">Carbon<span className="text-[#40ffa9]">X</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {['Home', 'Markets', 'Trading'].map((item) => (
                <Link
                  key={item}
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                  className="px-4 py-2 text-sm text-[#9ca3af] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#40ffa9]/30 to-[#0d7f54]/30 flex items-center justify-center">
                    <span className="text-[#40ffa9] text-xs">0x</span>
                  </div>
                  <span className="text-sm">0x7a...3f9</span>
                </div>
              ) : (
                <Button onClick={onLoginClick} className="btn-primary text-sm">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover:bg-white/5 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0e17] border-t border-white/5 p-4">
            <div className="flex flex-col gap-2">
              {['Home', 'Markets', 'Trading'].map((item) => (
                <Link
                  key={item}
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                  className="px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-white/5 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Button onClick={onLoginClick} className="btn-primary mt-2">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#40ffa9]/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0d7f54]/10 rounded-full blur-[128px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-[#40ffa9]/10 border border-[#40ffa9]/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-[#40ffa9] rounded-full animate-pulse" />
                <span className="text-sm text-[#40ffa9]">Live Trading Now Available</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="hero-title-line block">The Future of</span>
                <span className="hero-title-line block text-[#40ffa9]">Carbon Credit</span>
                <span className="hero-title-line block">Trading</span>
              </h1>

              <p className="hero-subtitle text-lg text-[#9ca3af] max-w-xl mx-auto lg:mx-0 mb-8">
                Tokenized environmental assets on the blockchain. Trade RECs, carbon credits, and renewable energy certificates with transparency and speed.
              </p>

              <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Link to="/trade">
                  <Button className="btn-primary text-base px-8 py-3">
                    Start Trading
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/markets">
                  <Button className="btn-secondary text-base px-8 py-3">
                    View Markets
                  </Button>
                </Link>
              </div>

              <div className="hero-stats flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-8">
                {[
                  { value: '$2.4M', label: '24h Volume' },
                  { value: '1,247', label: 'Active Traders' },
                  { value: '6', label: 'Trading Pairs' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl lg:text-3xl font-bold text-[#40ffa9]">{stat.value}</p>
                    <p className="text-sm text-[#6b7280]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="hero-image relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-[#40ffa9]/20 to-[#0d7f54]/20 rounded-3xl blur-2xl" />
                <img 
                  src="/earth-hero.png" 
                  alt="Carbon Trading" 
                  className="relative w-full h-full object-contain animate-float"
                />
                <div className="absolute inset-0 border border-[#40ffa9]/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-8 border border-[#40ffa9]/10 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 lg:py-24 border-y border-white/5 bg-[#111827]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { value: '1.9M+', label: 'MWh Ready for Sale' },
              { value: '500K', label: 'Year 1 Sales Target' },
              { value: '>50%', label: 'Market Share Secured' },
              { value: '0.1%', label: 'Trading Fee' },
            ].map((stat, i) => (
              <div key={i} className="stat-card text-center p-6 rounded-2xl bg-[#111827] border border-white/5">
                <p className="text-3xl lg:text-4xl font-bold text-[#40ffa9] mb-2">{stat.value}</p>
                <p className="text-sm text-[#9ca3af]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose <span className="text-[#40ffa9]">CarbonX</span>
            </h2>
            <p className="text-[#9ca3af] max-w-2xl mx-auto">
              The most advanced platform for environmental asset trading with institutional-grade features
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="feature-card p-6 rounded-2xl bg-[#111827] border border-white/5 hover:border-[#40ffa9]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#40ffa9]/10 flex items-center justify-center mb-4 group-hover:bg-[#40ffa9]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#40ffa9]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[#9ca3af]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trading Pairs Section */}
      <section ref={tradingRef} className="py-16 lg:py-24 border-y border-white/5 bg-[#111827]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trade <span className="text-[#40ffa9]">Environmental Assets</span>
            </h2>
            <p className="text-[#9ca3af] max-w-2xl mx-auto">
              Access the world&apos;s first regulated marketplace for tokenized carbon credits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tradingPairs.map((pair, i) => (
              <div 
                key={i} 
                className="trading-card p-6 rounded-2xl bg-[#111827] border border-white/5 hover:border-[#40ffa9]/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#40ffa9]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <pair.icon className="w-6 h-6 text-[#40ffa9]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{pair.name}</h3>
                      <p className="text-sm text-[#6b7280]">{pair.symbol}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${pair.change >= 0 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>
                    {pair.change >= 0 ? '+' : ''}{pair.change}%
                  </span>
                </div>

                <p className="text-sm text-[#9ca3af] mb-4">{pair.desc}</p>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold font-mono">${pair.price.toFixed(2)}</p>
                    <p className="text-xs text-[#6b7280]">Current Price</p>
                  </div>
                </div>

                <Link to="/trade">
                  <Button className="w-full btn-primary">
                    Trade {pair.symbol}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-[#40ffa9]">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-xl bg-[#111827] border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#40ffa9] flex-shrink-0 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 text-[#9ca3af] animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Start <span className="text-[#40ffa9]">Trading?</span>
          </h2>
          <p className="text-lg text-[#9ca3af] mb-8 max-w-2xl mx-auto">
            Join the future of carbon credit trading. Connect your wallet and start trading RECs, TVERs, and more in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/trade">
              <Button className="btn-primary text-lg px-8 py-4">
                {isLoggedIn ? 'Go to Trading' : 'Connect Wallet'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/markets">
              <Button className="btn-secondary text-lg px-8 py-4">
                Explore Markets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#111827]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#40ffa9] to-[#0d7f54] flex items-center justify-center">
                  <span className="text-[#0a0e17] font-bold text-sm">C</span>
                </div>
                <span className="font-semibold">Carbon<span className="text-[#40ffa9]">X</span></span>
              </div>
              <p className="text-sm text-[#9ca3af]">
                The future of carbon trading. Tokenized environmental assets on the blockchain.
              </p>
            </div>
            
            {[
              { title: 'Platform', links: ['Markets', 'Trading', 'API', 'Fees'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] },
              { title: 'Legal', links: ['Terms', 'Privacy', 'Compliance'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-[#9ca3af] hover:text-[#40ffa9] transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#6b7280]">
              © 2026 CarbonX. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {['Twitter', 'Discord', 'Telegram'].map((social) => (
                <a key={social} href="#" className="text-sm text-[#6b7280] hover:text-[#40ffa9] transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
