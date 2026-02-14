import { useState } from 'react';
import { Wallet, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onLogin();
  };

  const handleWalletConnect = async (walletType: string) => {
    setWalletConnecting(walletType);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setWalletConnecting(null);
    onLogin();
  };

  const wallets = [
    { name: 'MetaMask', icon: '🦊', color: '#E2761B' },
    { name: 'WalletConnect', icon: '🔗', color: '#3B99FC' },
    { name: 'Coinbase', icon: '🔵', color: '#0052FF' },
    { name: 'Phantom', icon: '👻', color: '#AB9FF2' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border border-white/10 text-white max-w-md p-0 overflow-hidden">
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#40ffa9]/5 via-transparent to-[#0d7f54]/5 pointer-events-none" />
          
          <DialogHeader className="p-6 pb-0 relative">
            <DialogTitle className="text-2xl font-bold text-center">
              Welcome to <span className="text-[#40ffa9]">CarbonX</span>
            </DialogTitle>
            <p className="text-center text-[#9ca3af] text-sm mt-2">
              Connect your wallet or sign in to start trading
            </p>
          </DialogHeader>

          <Tabs defaultValue="wallet" className="w-full relative">
            <TabsList className="grid w-full grid-cols-2 bg-[#0a0e17] mx-6 mt-6 w-[calc(100%-3rem)] border border-white/5">
              <TabsTrigger 
                value="wallet" 
                className="data-[state=active]:bg-[#40ffa9]/10 data-[state=active]:text-[#40ffa9] data-[state=active]:border-[#40ffa9]/30 border border-transparent rounded-md"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="data-[state=active]:bg-[#40ffa9]/10 data-[state=active]:text-[#40ffa9] data-[state=active]:border-[#40ffa9]/30 border border-transparent rounded-md"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="p-6 pt-4">
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleWalletConnect(wallet.name)}
                    disabled={walletConnecting !== null}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0a0e17] border border-white/5 hover:border-[#40ffa9]/30 hover:bg-[#40ffa9]/5 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{wallet.icon}</span>
                      <span className="font-medium">{wallet.name}</span>
                    </div>
                    {walletConnecting === wallet.name ? (
                      <div className="w-5 h-5 border-2 border-[#40ffa9] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-[#6b7280] group-hover:text-[#40ffa9] group-hover:translate-x-1 transition-all" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#40ffa9]/5 border border-[#40ffa9]/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#40ffa9] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-[#40ffa9] font-medium mb-1">Secure Connection</p>
                    <p className="text-[#9ca3af]">
                      Your wallet connection is encrypted and secure. We never store your private keys.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="p-6 pt-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#9ca3af]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[#0a0e17] border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#40ffa9]/50 focus:ring-0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#9ca3af]">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-[#0a0e17] border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#40ffa9]/50 focus:ring-0"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-[#9ca3af]">
                    <input type="checkbox" className="rounded border-white/20 bg-[#0a0e17] text-[#40ffa9]" />
                    Remember me
                  </label>
                  <button type="button" className="text-[#40ffa9] hover:underline">
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#0a0e17] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-[#9ca3af]">
                  Don&apos;t have an account?{' '}
                  <button type="button" className="text-[#40ffa9] hover:underline">
                    Sign up
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
