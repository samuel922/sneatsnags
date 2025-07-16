import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Shield, Clock, ArrowRight, Play, Star, Users, Zap, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const HomePage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Matching',
      description: 'Our advanced AI instantly connects buyers with sellers for optimal deals.',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: TrendingUp,
      title: 'Dynamic Pricing',
      description: 'Real-time market analysis ensures you get the best possible prices.',
      color: 'from-green-400 to-blue-500',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Bank-level security with verified tickets and protected payments.',
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: Clock,
      title: 'Instant Processing',
      description: 'Lightning-fast matching so you never miss your favorite events.',
      color: 'from-blue-400 to-indigo-500',
    },
  ];

  const stats = [
    { number: '1M+', label: 'Tickets Sold', icon: '🎫' },
    { number: '500K+', label: 'Happy Users', icon: '😊' },
    { number: '99.9%', label: 'Uptime', icon: '⚡' },
    { number: '24/7', label: 'Support', icon: '🛟' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Music Lover',
      content: 'Found amazing concert tickets at 40% below market price! The AI matching is incredible.',
      avatar: '👩‍💼',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      role: 'Event Organizer',
      content: 'Sold out my entire venue in 2 hours. AutoMatch makes selling tickets effortless.',
      avatar: '👨‍💻',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Sports Fan',
      content: 'Secure, fast, and reliable. Got playoff tickets when everywhere else was sold out.',
      avatar: '👩‍🎓',
      rating: 5,
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      
      {/* Interactive Cursor Effect */}
      <div 
        className="fixed pointer-events-none z-10 w-6 h-6 bg-blue-500/20 rounded-full blur-xl transition-all duration-300"
        style={{ 
          left: mousePosition.x - 12, 
          top: mousePosition.y - 12,
          transform: 'scale(1.5)'
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-blob floating"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-20 animate-blob floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-blob floating" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Hero Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-white/30 mb-8 animate-scale-in">
            <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
            <span className="text-sm font-semibold text-gray-700">✨ The Future of Ticket Trading</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 animate-slide-up">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight block">
              Buy & Sell
            </span>
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent block">
              Tickets
            </span>
            <span className="text-gray-800 block text-4xl md:text-5xl lg:text-6xl mt-4">
              The Smart Way
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Experience the next generation of ticket trading with 
            <span className="font-semibold text-blue-700"> AI-powered matching</span>, 
            <span className="font-semibold text-purple-700"> secure payments</span>, and 
            <span className="font-semibold text-pink-700"> instant processing</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up mobile-stack" style={{ animationDelay: '0.6s' }}>
            <Link to="/events">
              <Button variant="gradient" size="xl" className="group shadow-2xl hover:shadow-3xl mobile-full">
                <Search className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                Explore Events
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="glass" size="xl" className="group border-white/30 mobile-full">
                <Play className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.9s' }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center group p-2">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Why Choose AutoMatch?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Revolutionizing ticket trading with cutting-edge technology and user-focused innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  variant="glass"
                  hover
                  className="group border-white/30 hover:border-white/50 transition-all duration-500"
                >
                  <CardContent className="p-6 md:p-8 text-center">
                    <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 group-hover:text-blue-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Get your tickets in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Browse or Post',
                description: 'Discover amazing events or list your tickets with our intuitive interface.',
                icon: '🔍',
              },
              {
                step: '02',
                title: 'AI Matching',
                description: 'Our smart system instantly connects buyers and sellers for optimal deals.',
                icon: '🤖',
              },
              {
                step: '03',
                title: 'Secure Transaction',
                description: 'Complete your purchase with bank-level security and instant delivery.',
                icon: '🔒',
              },
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-blue-100 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-700">
              See what our users are saying about AutoMatch
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                variant="glass"
                hover
                className="border-white/30"
              >
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-800 mb-6 leading-relaxed italic text-sm md:text-base">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-700 to-purple-700 rounded-full flex items-center justify-center text-2xl mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-700 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Ready to Transform
            <span className="block text-yellow-300">Your Ticket Experience?</span>
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
            Join thousands of users who trust AutoMatch for seamless ticket trading.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mobile-stack">
            <Link to="/register">
              <Button variant="secondary" size="xl" className="group shadow-2xl mobile-full">
                <Users className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                Start Trading Now
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="glass" size="xl" className="group border-white/30 text-white mobile-full">
                <Search className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                Browse Events
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-indigo-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Free to Join</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};