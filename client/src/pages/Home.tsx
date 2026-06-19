import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Code2, Zap, Shield, Smartphone, CreditCard, GitBranch } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              CyberPay
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">{user?.name}</span>
                {user?.role === "admin" && (
                  <Badge className="bg-purple-600 text-white">Admin</Badge>
                )}
              </div>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">Next-Gen Payment Gateway</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            CyberPay System
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            A powerful, API-first payment gateway supporting UPI, PhonePe, and static QR codes. Built for seamless integration with external applications.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 px-8 py-6 text-base">
              View API Docs
            </Button>
            <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-base">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: CreditCard,
              title: "Multi-Method Support",
              desc: "UPI Intent, PhonePe Merchant ID, and Static QR codes",
            },
            {
              icon: Zap,
              title: "Smart Auto-Routing",
              desc: "Intelligent payment method selection based on configuration",
            },
            {
              icon: Shield,
              title: "Secure & Reliable",
              desc: "Enterprise-grade security with transaction logging",
            },
            {
              icon: Smartphone,
              title: "Mobile-First",
              desc: "Responsive design optimized for all devices",
            },
            {
              icon: Code2,
              title: "Developer Friendly",
              desc: "Clean REST API with comprehensive documentation",
            },
            {
              icon: GitBranch,
              title: "Real-Time Updates",
              desc: "Live transaction status and owner notifications",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 p-6"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* API Documentation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-12 text-white">API Endpoints</h2>
        <div className="space-y-6">
          {[
            {
              method: "POST",
              endpoint: "/api/trpc/payment.initiatePayment",
              desc: "Initiate a new payment transaction",
              color: "from-green-500 to-emerald-600",
            },
            {
              method: "GET",
              endpoint: "/api/trpc/payment.verifyTransaction",
              desc: "Verify transaction status by reference ID",
              color: "from-blue-500 to-cyan-600",
            },
            {
              method: "GET",
              endpoint: "/api/trpc/payment.getConfig",
              desc: "Retrieve current payment configuration",
              color: "from-blue-500 to-cyan-600",
            },
            {
              method: "POST",
              endpoint: "/api/trpc/payment.updateConfig",
              desc: "Update payment configuration (admin only)",
              color: "from-orange-500 to-red-600",
            },
            {
              method: "GET",
              endpoint: "/api/trpc/payment.getTransactions",
              desc: "Get all transactions with pagination (admin only)",
              color: "from-blue-500 to-cyan-600",
            },
            {
              method: "POST",
              endpoint: "/api/trpc/payment.updateTransactionStatus",
              desc: "Update transaction status (admin only)",
              color: "from-orange-500 to-red-600",
            },
          ].map((api, idx) => (
            <Card
              key={idx}
              className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30 transition-all p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Badge
                    className={`bg-gradient-to-r ${api.color} text-white font-bold`}
                  >
                    {api.method}
                  </Badge>
                  <code className="text-cyan-300 font-mono text-sm break-all">
                    {api.endpoint}
                  </code>
                </div>
              </div>
              <p className="text-slate-400 text-sm">{api.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-12 text-white">Quick Start</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">1. Initiate Payment</h3>
            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs text-cyan-300 font-mono">
{`const response = await fetch('/api/trpc/payment.initiatePayment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 99.99,
    description: 'Product purchase',
    externalAppId: 'your-app-id'
  })
});
const data = await response.json();
console.log(data.result.data);`}
            </pre>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">2. Verify Status</h3>
            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs text-cyan-300 font-mono">
{`const response = await fetch(
  '/api/trpc/payment.verifyTransaction?input=' + 
  JSON.stringify({ referenceId: 'TXN_...' })
);
const data = await response.json();
console.log(data.result.data.status);`}
            </pre>
          </Card>
        </div>
      </section>

      {/* Admin Panel CTA */}
      {isAuthenticated && user?.role === "admin" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/30 p-8 text-center">
            <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Admin Panel</h2>
            <p className="text-slate-300 mb-6">
              Manage payment configuration, view transactions, and control your payment gateway
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 px-8 py-3">
              Go to Admin Panel
            </Button>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-slate-500 text-sm">
            <p>CyberPay System © 2026. Built for seamless payment integration.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
