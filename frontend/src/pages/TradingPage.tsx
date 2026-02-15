import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Search, Star, CandlestickChart, BarChart3, Activity, Layers,
  History, FileText, PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { createChart, CandlestickSeries, HistogramSeries, type CandlestickData, type HistogramData } from 'lightweight-charts';
import { useTrading } from '@/hooks/useTrading';
import { useRealtimePrices } from '@/hooks/useRealtimePrices';
import { useOrderBook } from '@/hooks/useOrderBook';

interface TradingPageProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const TradingPage = ({ isLoggedIn, onLoginClick }: TradingPageProps) => {
  // useTrading hook for real order management with localStorage
  const { orders, portfolio, placeOrder, isPlacingOrder, cancelOrder } = useTrading();

  // Window width state for SSR-safe responsive checks
  const [windowWidth, setWindowWidth] = useState(1024);

  // useRealtimePrices hook for dynamic market prices with real-time updates
  const markets = useRealtimePrices(2000);

  const [selectedPair, setSelectedPair] = useState('REC/USDT');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMarketTab, setActiveMarketTab] = useState('all');
  const [bottomTab, setBottomTab] = useState('orders');
  const [mobileActiveView, setMobileActiveView] = useState<'chart' | 'book' | 'trade'>('chart');

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null);
  const volumeSeriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null);
  const chartAnimationRef = useRef<gsap.core.Tween | null>(null);

  // Favorite markets state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Set window width after hydration to avoid SSR crash
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Set initial width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Find current market from real-time prices
  const currentMarket = markets.find(m => m.symbol === selectedPair) || markets[0];

  // useOrderBook hook for order book generation with real-time updates
  const orderBook = useOrderBook(currentMarket?.price || 0, 12, 2000);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(64, 255, 169, 0.5)',
          labelBackgroundColor: '#40ffa9',
        },
        horzLine: {
          color: 'rgba(64, 255, 169, 0.5)',
          labelBackgroundColor: '#40ffa9',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    // Candlestick Series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#40ffa9',
      downColor: '#ff6b6b',
      borderUpColor: '#40ffa9',
      borderDownColor: '#ff6b6b',
      wickUpColor: '#40ffa9',
      wickDownColor: '#ff6b6b',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#40ffa9',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // Generate sample data
    const generateData = () => {
      const candleData: CandlestickData[] = [];
      const volumeData: HistogramData[] = [];
      const basePrice = currentMarket.price;
      let currentPrice = basePrice * 0.85;
      const now = new Date();
      
      for (let i = 100; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const open = currentPrice;
        const change = (Math.random() - 0.45) * basePrice * 0.05;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * basePrice * 0.02;
        const low = Math.min(open, close) - Math.random() * basePrice * 0.02;
        const volume = Math.random() * 1000000;
        
        candleData.push({
          time: time.toISOString().split('T')[0],
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
        });
        
        volumeData.push({
          time: time.toISOString().split('T')[0],
          value: volume,
          color: close >= open ? 'rgba(64, 255, 169, 0.5)' : 'rgba(255, 107, 107, 0.5)',
        });
        
        currentPrice = close;
      }
      
      return { candleData, volumeData };
    };

    const { candleData, volumeData } = generateData();
    candlestickSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Kill any existing chart animation before creating new one
    if (chartAnimationRef.current) {
      chartAnimationRef.current.kill();
    }

    // Animate chart entrance
    chartAnimationRef.current = gsap.to(chartContainerRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.2,
      overwrite: true
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [selectedPair, currentMarket?.price]);

  // Calculate max sizes for order book depth visualization
  const maxAskSize = orderBook.asks.length > 0 ? Math.max(...orderBook.asks.map(a => a.size)) : 1;
  const maxBidSize = orderBook.bids.length > 0 ? Math.max(...orderBook.bids.map(b => b.size)) : 1;

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      onLoginClick();
      return;
    }
    if (!amount || (orderType !== 'market' && !price)) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    const priceNum = orderType === 'market' ? currentMarket.price : parseFloat(price || '0');

    if (isNaN(amountNum) || isNaN(priceNum) || amountNum <= 0 || (orderType !== 'market' && priceNum <= 0)) {
      toast.error('Please enter valid amounts');
      return;
    }

    const result = await placeOrder({
      pair: selectedPair,
      type: orderType,
      side,
      price: priceNum,
      amount: amountNum,
    });

    if (result.success) {
      toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} ${orderType} order placed for ${amountNum} ${selectedPair.split('/')[0]} at ${priceNum.toFixed(2)} USDT`);
      setAmount('');
      if (orderType !== 'market') {
        setPrice('');
      }
    } else {
      toast.error(result.error || 'Failed to place order');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    cancelOrder(orderId);
    toast.success('Order cancelled');
  };

  const filteredMarkets = markets.filter(m => 
    m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Use real orders from useTrading hook instead of mock data

  return (
    <div className="min-h-screen bg-[#0a0e17] flex flex-col pt-14 lg:pt-16">
      {/* Mobile View Toggle */}
      <div className="lg:hidden flex border-b border-white/5">
        {[
          { id: 'chart', label: 'Chart', icon: CandlestickChart },
          { id: 'book', label: 'Order Book', icon: BarChart3 },
          { id: 'trade', label: 'Trade', icon: Activity },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setMobileActiveView(view.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              mobileActiveView === view.id 
                ? 'text-[#40ffa9] border-b-2 border-[#40ffa9]' 
                : 'text-[#9ca3af]'
            }`}
          >
            <view.icon className="w-4 h-4" />
            {view.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Markets Sidebar - Desktop */}
        <aside className="hidden lg:flex w-[280px] flex-col border-r border-white/5 bg-[#111827]">
          {/* Search */}
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
              <Input
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#0a0e17] border-white/10 text-sm h-9"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {['All', 'Fav', 'Spot'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMarketTab(tab.toLowerCase())}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  activeMarketTab === tab.toLowerCase()
                    ? 'text-[#40ffa9] border-b-2 border-[#40ffa9]'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Market List Header */}
          <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-[#6b7280] border-b border-white/5">
            <span>Symbol</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h</span>
          </div>

          {/* Market List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredMarkets.map((market, index) => (
              <div
                key={market.symbol}
                onClick={() => setSelectedPair(market.symbol)}
                className={`grid grid-cols-3 gap-2 px-3 py-3 cursor-pointer transition-all hover:bg-[#1f2937] ${
                  selectedPair === market.symbol ? 'bg-[#40ffa9]/5 border-l-2 border-[#40ffa9]' : ''
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-2">
                  <button
                    className="text-[#6b7280] hover:text-yellow-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      const newFavorites = new Set(favorites)
                      if (newFavorites.has(market.symbol)) {
                        newFavorites.delete(market.symbol)
                      } else {
                        newFavorites.add(market.symbol)
                      }
                      setFavorites(newFavorites)
                    }}
                  >
                    <Star className={`w-3 h-3 ${favorites.has(market.symbol) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </button>
                  <div>
                    <p className="text-sm font-medium">{market.symbol}</p>
                    <p className="text-xs text-[#6b7280]">Vol {market.volume24h}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{market.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-mono ${market.change24h >= 0 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>
                    {market.change24h >= 0 ? '+' : ''}{market.change24h}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Pair Header */}
          <div className="flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 border-b border-white/5 bg-[#111827]/50">
            <div className="flex items-center gap-3 lg:gap-6">
              {/* Mobile Pair Selector */}
              <div className="lg:hidden relative">
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="bg-[#1a2234] border border-white/10 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {markets.map(m => (
                    <option key={m.symbol} value={m.symbol}>{m.symbol}</option>
                  ))}
                </select>
              </div>

              {/* Desktop Pair Info */}
              <div className="hidden lg:block">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{selectedPair}</span>
                  <span className="text-xs px-2 py-0.5 bg-[#40ffa9]/10 text-[#40ffa9] rounded">Spot</span>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:gap-6 text-sm">
                <div>
                  <p className={`text-lg lg:text-xl font-mono font-semibold ${currentMarket.change24h >= 0 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>
                    {currentMarket.price.toFixed(2)}
                  </p>
                  <p className={`text-xs ${currentMarket.change24h >= 0 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>
                    {currentMarket.change24h >= 0 ? '+' : ''}{currentMarket.change24h}%
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-[#6b7280]">24h High</p>
                  <p className="font-mono">{currentMarket.high24h.toFixed(2)}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-[#6b7280]">24h Low</p>
                  <p className="font-mono">{currentMarket.low24h.toFixed(2)}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-xs text-[#6b7280]">24h Volume</p>
                  <p className="font-mono">{currentMarket.volume24h}</p>
                </div>
              </div>
            </div>

            {/* Timeframe Selector - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {['1m', '5m', '15m', '1H', '4H', '1D', '1W'].map((tf) => (
                <button
                  key={tf}
                  className="px-2 py-1 text-xs text-[#9ca3af] hover:text-white hover:bg-white/5 rounded transition-colors"
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Area */}
          {(mobileActiveView === 'chart' || windowWidth >= 1024) && (
            <div className="flex-1 min-h-[300px] lg:min-h-0 relative">
              <div ref={chartContainerRef} className="absolute inset-0 chart-container" />
            </div>
          )}

          {/* Mobile Order Book */}
          {mobileActiveView === 'book' && (
            <div className="lg:hidden flex-1 overflow-auto p-3">
              {/* Asks */}
              <div className="space-y-0.5 mb-2">
                {orderBook.asks.slice(0, 8).map((ask, i) => (
                  <div key={`ask-${i}`} className="relative grid grid-cols-3 gap-2 py-1 text-sm">
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#ff6b6b]/10"
                      style={{ width: `${(ask.size / maxAskSize) * 100}%` }}
                    />
                    <span className="relative text-[#ff6b6b] font-mono">{ask.price.toFixed(2)}</span>
                    <span className="relative text-right font-mono">{ask.size.toFixed(2)}</span>
                    <span className="relative text-right font-mono text-[#6b7280]">{ask.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>
              
              {/* Current Price */}
              <div className="py-3 text-center border-y border-white/5">
                <span className={`text-xl font-mono font-semibold ${currentMarket.change24h >= 0 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>
                  {currentMarket.price.toFixed(2)}
                </span>
              </div>
              
              {/* Bids */}
              <div className="space-y-0.5 mt-2">
                {orderBook.bids.slice(0, 8).map((bid, i) => (
                  <div key={`bid-${i}`} className="relative grid grid-cols-3 gap-2 py-1 text-sm">
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#40ffa9]/10"
                      style={{ width: `${(bid.size / maxBidSize) * 100}%` }}
                    />
                    <span className="relative text-[#40ffa9] font-mono">{bid.price.toFixed(2)}</span>
                    <span className="relative text-right font-mono">{bid.size.toFixed(2)}</span>
                    <span className="relative text-right font-mono text-[#6b7280]">{bid.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Trade Form */}
          {mobileActiveView === 'trade' && (
            <div className="lg:hidden p-3 space-y-4">
              {/* Buy/Sell Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSide('buy')}
                  className={`py-3 rounded-lg font-semibold transition-all ${
                    side === 'buy' ? 'bg-[#40ffa9] text-[#0a0e17]' : 'bg-[#1a2234] text-[#9ca3af]'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setSide('sell')}
                  className={`py-3 rounded-lg font-semibold transition-all ${
                    side === 'sell' ? 'bg-[#ff6b6b] text-white' : 'bg-[#1a2234] text-[#9ca3af]'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Order Type */}
              <div className="flex gap-2">
                {['market', 'limit', 'stop'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type as any)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                      orderType === type ? 'bg-white/10 text-white' : 'text-[#6b7280]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                {orderType !== 'market' && (
                  <div>
                    <label className="text-xs text-[#6b7280] mb-1 block">Price (USDT)</label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="input-trade"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-[#6b7280] mb-1 block">Amount ({selectedPair.split('/')[0]})</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-trade"
                  />
                </div>
              </div>

              {/* Percentage Buttons */}
              <div className="flex gap-2">
                {['25%', '50%', '75%', '100%'].map((pctLabel) => (
                  <button
                    key={pctLabel}
                    onClick={() => {
                      const pctValue = parseInt(pctLabel) / 100
                      const maxAmount = side === 'buy'
                        ? (portfolio.balance / (currentMarket?.price || 1))
                        : (portfolio.holdings[selectedPair.split('/')[0]]?.amount || 0)
                      setAmount((maxAmount * pctValue || 0).toFixed(2))
                    }}
                    className="flex-1 py-2 text-xs bg-[#1a2234] rounded-lg text-[#9ca3af] hover:bg-[#252d3d]"
                  >
                    {pctLabel}
                  </button>
                ))}
              </div>

              {/* Submit */}
              <Button
                onClick={handlePlaceOrder}
                className={`w-full py-4 text-lg font-semibold ${
                  side === 'buy' ? 'bg-[#40ffa9] text-[#0a0e17] hover:brightness-110' : 'bg-[#ff6b6b] text-white hover:brightness-110'
                }`}
              >
                {side === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
              </Button>
            </div>
          )}

          {/* Bottom Panel - Desktop */}
          <div className="hidden lg:block border-t border-white/5 bg-[#111827]">
            <Tabs value={bottomTab} onValueChange={setBottomTab}>
              <TabsList className="bg-transparent border-b border-white/5 rounded-none h-10 px-4">
                {[
                  { id: 'orders', label: 'Open Orders' },
                  { id: 'positions', label: 'Positions' },
                  { id: 'assets', label: 'Assets' },
                  { id: 'history', label: 'Order History' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:text-[#40ffa9] data-[state=active]:border-b-2 data-[state=active]:border-[#40ffa9] rounded-none px-4 py-2 text-sm text-[#9ca3af]"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="orders" className="m-0 p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#6b7280] border-b border-white/5">
                        <th className="text-left px-4 py-2 font-medium">Pair</th>
                        <th className="text-left px-4 py-2 font-medium">Type</th>
                        <th className="text-left px-4 py-2 font-medium">Side</th>
                        <th className="text-right px-4 py-2 font-medium">Price</th>
                        <th className="text-right px-4 py-2 font-medium">Amount</th>
                        <th className="text-right px-4 py-2 font-medium">Filled</th>
                        <th className="text-right px-4 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-[#6b7280]">
                            No open orders
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="border-b border-white/5 hover:bg-[#1f2937]">
                            <td className="px-4 py-3">{order.pair}</td>
                            <td className="px-4 py-3 capitalize">{order.type}</td>
                            <td className={`px-4 py-3 ${order.side === 'buy' ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>{order.side}</td>
                            <td className="px-4 py-3 text-right font-mono">{order.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-mono">{order.amount}</td>
                            <td className="px-4 py-3 text-right">{order.filled > 0 ? `${((order.filled / order.amount) * 100).toFixed(0)}%` : '0%'}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-[#ff6b6b] hover:underline text-xs"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="positions" className="m-0 p-8 text-center text-[#6b7280]">
                <div className="flex flex-col items-center gap-2">
                  <Layers className="w-12 h-12 opacity-30" />
                  <p>No open positions</p>
                </div>
              </TabsContent>

              <TabsContent value="assets" className="m-0 p-8 text-center text-[#6b7280]">
                <div className="flex flex-col items-center gap-2">
                  <PieChart className="w-12 h-12 opacity-30" />
                  <p>Connect wallet to view assets</p>
                </div>
              </TabsContent>

              <TabsContent value="history" className="m-0 p-8 text-center text-[#6b7280]">
                <div className="flex flex-col items-center gap-2">
                  <History className="w-12 h-12 opacity-30" />
                  <p>No order history</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Right Panel - Desktop */}
        <aside className="hidden lg:flex w-[320px] xl:w-[360px] flex-col border-l border-white/5 bg-[#111827]">
          {/* Order Book */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Order Book Tabs */}
            <div className="flex border-b border-white/5">
              <button className="flex-1 py-2 text-sm font-medium text-[#40ffa9] border-b-2 border-[#40ffa9]">Order Book</button>
              <button className="flex-1 py-2 text-sm font-medium text-[#6b7280] hover:text-white">Trades</button>
            </div>

            {/* Order Book Header */}
            <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-[#6b7280]">
              <span>Price (USDT)</span>
              <span className="text-right">Size</span>
              <span className="text-right">Total</span>
            </div>

            {/* Asks */}
            <div className="flex-1 overflow-hidden">
              <div className="space-y-0">
                {orderBook.asks.map((ask, i) => (
                  <div key={`ask-${i}`} className="relative grid grid-cols-3 gap-2 px-3 py-0.5 text-sm hover:bg-white/5 cursor-pointer group">
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#ff6b6b]/20 to-transparent"
                      style={{ width: `${(ask.size / maxAskSize) * 60}%` }}
                    />
                    <span className="relative text-[#ff6b6b] font-mono group-hover:brightness-125">{ask.price.toFixed(2)}</span>
                    <span className="relative text-right font-mono">{ask.size.toFixed(2)}</span>
                    <span className="relative text-right font-mono text-[#6b7280]">{(ask.total / 1000).toFixed(1)}K</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Price */}
            <div className="py-3 text-center border-y border-white/5 bg-[#0a0e17]">
              <span className={`text-2xl font-mono font-bold ${currentMarket.change24h >= 0 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>
                {currentMarket.price.toFixed(2)}
              </span>
              <span className={`ml-2 text-sm ${currentMarket.change24h >= 0 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>
                {currentMarket.change24h >= 0 ? '↑' : '↓'} {Math.abs(currentMarket.change24h)}%
              </span>
            </div>

            {/* Bids */}
            <div className="flex-1 overflow-hidden">
              <div className="space-y-0">
                {orderBook.bids.map((bid, i) => (
                  <div key={`bid-${i}`} className="relative grid grid-cols-3 gap-2 px-3 py-0.5 text-sm hover:bg-white/5 cursor-pointer group">
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#40ffa9]/20 to-transparent"
                      style={{ width: `${(bid.size / maxBidSize) * 60}%` }}
                    />
                    <span className="relative text-[#40ffa9] font-mono group-hover:brightness-125">{bid.price.toFixed(2)}</span>
                    <span className="relative text-right font-mono">{bid.size.toFixed(2)}</span>
                    <span className="relative text-right font-mono text-[#6b7280]">{(bid.total / 1000).toFixed(1)}K</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="border-t border-white/5 p-4">
            {/* Buy/Sell Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSide('buy')}
                className={`py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  side === 'buy' 
                    ? 'bg-[#40ffa9] text-[#0a0e17]' 
                    : 'bg-[#1a2234] text-[#9ca3af] hover:bg-[#252d3d]'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide('sell')}
                className={`py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  side === 'sell' 
                    ? 'bg-[#ff6b6b] text-white' 
                    : 'bg-[#1a2234] text-[#9ca3af] hover:bg-[#252d3d]'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Order Type */}
            <div className="flex gap-1 mb-4">
              {['market', 'limit', 'stop'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type as any)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                    orderType === type 
                      ? 'bg-white/10 text-white' 
                      : 'text-[#6b7280] hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="space-y-3 mb-4">
              {orderType !== 'market' && (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-[#6b7280]">Price</label>
                    <span className="text-xs text-[#6b7280]">USDT</span>
                  </div>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="input-trade text-right font-mono"
                  />
                </div>
              )}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-[#6b7280]">Amount</label>
                  <span className="text-xs text-[#6b7280]">{selectedPair.split('/')[0]}</span>
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-trade text-right font-mono"
                />
              </div>
            </div>

            {/* Percentage Slider */}
            <div className="flex gap-1 mb-4">
              {['0%', '25%', '50%', '75%', '100%'].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    const pctValue = parseInt(pct) / 100
                    const maxAmount = side === 'buy'
                      ? (portfolio.balance / (currentMarket?.price || 1))
                      : (portfolio.holdings[selectedPair.split('/')[0]]?.amount || 0)
                    setAmount((maxAmount * pctValue || 0).toFixed(2))
                  }}
                  className="flex-1 py-1.5 text-xs bg-[#0a0e17] rounded text-[#9ca3af] hover:bg-[#1a2234] transition-colors"
                >
                  {pct}
                </button>
              ))}
            </div>

            {/* Available Balance */}
            <div className="flex justify-between text-xs mb-4">
              <span className="text-[#6b7280]">Available</span>
              <span className="font-mono">{isLoggedIn ? `${portfolio.balance.toFixed(2)} USDT` : '--'}</span>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className={`w-full py-3 font-semibold transition-all ${
                side === 'buy'
                  ? 'bg-[#40ffa9] text-[#0a0e17] hover:brightness-110 disabled:opacity-50'
                  : 'bg-[#ff6b6b] text-white hover:brightness-110 disabled:opacity-50'
              }`}
            >
              {isPlacingOrder ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Placing...
                </div>
              ) : (
                `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedPair.split('/')[0]}`
              )}
            </Button>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-white/5 flex justify-around py-2 z-50">
        {[
          { id: 'markets', icon: BarChart3, label: 'Markets' },
          { id: 'chart', icon: CandlestickChart, label: 'Chart' },
          { id: 'trade', icon: Activity, label: 'Trade' },
          { id: 'orders', icon: FileText, label: 'Orders' },
          { id: 'portfolio', icon: PieChart, label: 'Portfolio' },
        ].map((item) => (
          <button
            key={item.id}
            className="flex flex-col items-center gap-0.5 p-2 text-[#6b7280] hover:text-white"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Bottom Padding */}
      <div className="lg:hidden h-16" />
    </div>
  );
};

export default TradingPage;
