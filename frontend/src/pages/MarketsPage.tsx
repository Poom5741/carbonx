import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  TrendingUp, TrendingDown, Search, Star, 
  ArrowUpDown, BarChart3, Activity, Volume2, 
  Wallet, Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface MarketsPageProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

interface Market {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: string;
  high24h: number;
  low24h: number;
  marketCap: string;
}

const MarketsPage = ({ isLoggedIn, onLoginClick }: MarketsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'price' | 'change'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'gainers' | 'losers'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  const markets: Market[] = [
    { symbol: 'REC/USDT', name: 'Renewable Energy Certificate', price: 45.20, change24h: 2.4, volume24h: '1.2M', high24h: 46.80, low24h: 43.50, marketCap: '$45.2M' },
    { symbol: 'TVER/USDT', name: 'Thailand Voluntary Emission', price: 12.80, change24h: 5.1, volume24h: '890K', high24h: 13.50, low24h: 12.10, marketCap: '$25.6M' },
    { symbol: 'TVER-P/USDT', name: 'TVER Premium', price: 18.50, change24h: 3.2, volume24h: '456K', high24h: 19.20, low24h: 17.80, marketCap: '$18.5M' },
    { symbol: 'I-REC/USDT', name: 'International REC', price: 52.40, change24h: -0.5, volume24h: '345K', high24h: 53.80, low24h: 51.90, marketCap: '$62.1M' },
    { symbol: 'CER/USDT', name: 'Certified Emission Reduction', price: 8.35, change24h: -1.2, volume24h: '234K', high24h: 8.60, low24h: 8.15, marketCap: '$12.3M' },
    { symbol: 'VCU/USDT', name: 'Verified Carbon Unit', price: 6.75, change24h: 0.8, volume24h: '178K', high24h: 6.90, low24h: 6.60, marketCap: '$8.9M' },
  ];

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'favorites') return matchesSearch && favorites.includes(market.symbol);
    if (activeTab === 'gainers') return matchesSearch && market.change24h > 0;
    if (activeTab === 'losers') return matchesSearch && market.change24h < 0;
    return matchesSearch;
  });

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'volume': comparison = parseFloat(a.volume24h) - parseFloat(b.volume24h); break;
      case 'price': comparison = a.price - b.price; break;
      case 'change': comparison = a.change24h - b.change24h; break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  useEffect(() => {
    // Kill any existing animation before creating new one
    if (animationRef.current) {
      animationRef.current.kill();
    }

    // Create new animation with proper cleanup
    const ctx = gsap.context(() => {
      animationRef.current = gsap.to('.market-row', {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power3.out',
        overwrite: true
      });
    });

    return () => {
      ctx.revert();
    };
  }, [sortedMarkets]);

  const globalStats = [
    { label: '24h Volume', value: '$4.2M', icon: Volume2 },
    { label: 'Active Traders', value: '1,247', icon: Activity },
    { label: 'Trading Pairs', value: '6', icon: BarChart3 },
    { label: 'Trading Fee', value: '0.1%', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] pt-16">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#111827]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-1">
                Markets <span className="text-[#40ffa9]">Overview</span>
              </h1>
              <p className="text-sm text-[#9ca3af]">
                Explore all available carbon credit and renewable energy trading pairs
              </p>
            </div>
            {!isLoggedIn && (
              <Button onClick={onLoginClick} className="btn-primary w-fit">
                <Wallet className="w-4 h-4 mr-2" />
                Start Trading
              </Button>
            )}
          </div>

          {/* Global Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 lg:mt-8">
            {globalStats.map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#111827] border border-white/5">
                <div className="flex items-center gap-2 text-[#6b7280] mb-1">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { id: 'all', label: 'All Markets', count: markets.length },
              { id: 'favorites', label: 'Favorites', count: favorites.length },
              { id: 'gainers', label: 'Gainers', count: markets.filter(m => m.change24h > 0).length },
              { id: 'losers', label: 'Losers', count: markets.filter(m => m.change24h < 0).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#40ffa9]/10 text-[#40ffa9] border border-[#40ffa9]/30'
                    : 'bg-[#111827] text-[#9ca3af] border border-white/5 hover:border-white/10'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
              <Input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111827] border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Markets Table */}
        <div className="rounded-xl border border-white/5 bg-[#111827] overflow-hidden">
          {/* Table Header - Desktop */}
          <div className="hidden lg:grid grid-cols-12 gap-4 p-4 text-sm text-[#6b7280] border-b border-white/5 bg-[#0a0e17]">
            <div className="col-span-3">
              <button onClick={() => { setSortBy('price'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 hover:text-white">
                Market <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-2 text-right">
              <button onClick={() => { setSortBy('price'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center justify-end gap-1 hover:text-white w-full">
                Price <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-2 text-right">
              <button onClick={() => { setSortBy('change'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center justify-end gap-1 hover:text-white w-full">
                24h Change <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-2 text-right">
              <button onClick={() => { setSortBy('volume'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center justify-end gap-1 hover:text-white w-full">
                24h Volume <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-2 text-right">Market Cap</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {sortedMarkets.map((market) => (
              <div 
                key={market.symbol}
                className="market-row grid grid-cols-2 lg:grid-cols-12 gap-2 lg:gap-4 p-4 items-center hover:bg-[#1f2937] transition-colors"
              >
                {/* Market Info */}
                <div className="col-span-2 lg:col-span-3 flex items-center gap-3">
                  <button
                    onClick={() => toggleFavorite(market.symbol)}
                    className={`p-1.5 rounded hover:bg-white/5 ${
                      favorites.includes(market.symbol) ? 'text-yellow-400' : 'text-[#6b7280]'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${favorites.includes(market.symbol) ? 'fill-current' : ''}`} />
                  </button>
                  <Link to="/trading" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#40ffa9]/20 to-[#0d7f54]/20 flex items-center justify-center">
                      <span className="text-[#40ffa9] font-bold text-sm">{market.symbol[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-[#40ffa9] transition-colors">{market.symbol}</p>
                      <p className="text-xs text-[#6b7280] hidden sm:block">{market.name}</p>
                    </div>
                  </Link>
                </div>

                {/* Price */}
                <div className="lg:col-span-2 text-right">
                  <p className="font-mono font-medium">${market.price.toFixed(2)}</p>
                  <p className="text-xs text-[#6b7280] lg:hidden">Price</p>
                </div>

                {/* Change */}
                <div className="lg:col-span-2 text-right">
                  <p className={`font-mono font-medium flex items-center justify-end gap-1 ${market.change24h >= 0 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>
                    {market.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {market.change24h >= 0 ? '+' : ''}{market.change24h}%
                  </p>
                  <p className="text-xs text-[#6b7280] lg:hidden">24h Change</p>
                </div>

                {/* Volume */}
                <div className="lg:col-span-2 text-right hidden lg:block">
                  <p className="font-mono">{market.volume24h}</p>
                </div>

                {/* Market Cap */}
                <div className="lg:col-span-2 text-right hidden lg:block">
                  <p className="font-mono text-[#9ca3af]">{market.marketCap}</p>
                </div>

                {/* Action */}
                <div className="col-span-2 lg:col-span-1 text-right">
                  <Link to="/trading">
                    <Button size="sm" className="btn-primary text-xs px-3 py-1.5">
                      Trade
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {sortedMarkets.length === 0 && (
          <div className="p-12 text-center text-[#6b7280]">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No markets found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Categories */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {[
            { title: 'Renewable Energy', desc: 'Trade RECs and I-RECs', pairs: ['REC/USDT', 'I-REC/USDT'], color: '#40ffa9' },
            { title: 'Carbon Offsets', desc: 'Buy and sell verified credits', pairs: ['TVER/USDT', 'TVER-P/USDT', 'CER/USDT'], color: '#0d7f54' },
            { title: 'Voluntary Markets', desc: 'Access global VCU markets', pairs: ['VCU/USDT'], color: '#0891b2' },
          ].map((cat, i) => (
            <div key={i} className="p-6 rounded-xl bg-[#111827] border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                <BarChart3 className="w-5 h-5" style={{ color: cat.color }} />
              </div>
              <h3 className="font-semibold mb-1">{cat.title}</h3>
              <p className="text-sm text-[#9ca3af] mb-4">{cat.desc}</p>
              <div className="flex flex-wrap gap-2">
                {cat.pairs.map((pair) => (
                  <Link key={pair} to="/trading" className="px-2 py-1 text-xs bg-[#0a0e17] rounded text-[#9ca3af] hover:text-white">
                    {pair}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
