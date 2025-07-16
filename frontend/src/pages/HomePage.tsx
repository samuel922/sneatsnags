import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  Shield, 
  Clock, 
  ArrowRight, 
  Play, 
  Star, 
  Users, 
  Zap, 
  CheckCircle, 
  Sparkles,
  Calendar,
  MapPin,
  Ticket,
  Music,
  Trophy,
  Theater,
  Mic,
  Filter,
  Bell,
  DollarSign,
  Target,
  BarChart3,
  Headphones,
  Globe,
  Smartphone
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const HomePage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const eventCategories = [
    { id: 'all', name: 'All Events', icon: Globe, count: '10K+' },
    { id: 'concerts', name: 'Concerts', icon: Music, count: '3.2K' },
    { id: 'sports', name: 'Sports', icon: Trophy, count: '2.8K' },
    { id: 'theater', name: 'Theater', icon: Theater, count: '1.5K' },
    { id: 'comedy', name: 'Comedy', icon: Mic, count: '890' },
  ];

  const features = [
    {
      icon: Search,
      title: 'Smart Event Discovery',
      description: 'AI-powered search finds exactly what you\'re looking for with personalized recommendations.',
      color: 'from-blue-500 to-cyan-500',
      highlight: 'New',
    },
    {
      icon: Zap,
      title: 'Instant Ticket Matching',
      description: 'Get matched with sellers in real-time. No more waiting or missing out on sold-out events.',
      color: 'from-yellow-500 to-orange-500',
      highlight: 'Popular',
    },
    {
      icon: Shield,
      title: 'Verified Tickets Only',
      description: 'Every ticket is verified for authenticity. 100% secure transactions with buyer protection.',
      color: 'from-green-500 to-emerald-500',
      highlight: 'Trusted',
    },
    {
      icon: DollarSign,
      title: 'Dynamic Pricing',
      description: 'Fair market pricing with real-time adjustments. Get the best deals on premium events.',
      color: 'from-purple-500 to-pink-500',
      highlight: 'Smart',
    },
  ];

  const liveEvents = [
    {
      title: 'Taylor Swift | Eras Tour',
      venue: 'MetLife Stadium',
      date: 'Tonight 8:00 PM',
      location: 'East Rutherford, NJ',
      image: '🎤',
      price: 'From $180',
      category: 'Concert',
      isLive: true,
    },
    {
      title: 'Lakers vs Warriors',
      venue: 'Crypto.com Arena',
      date: 'Tomorrow 7:30 PM',
      location: 'Los Angeles, CA',
      image: '🏀',
      price: 'From $95',
      category: 'Sports',
      isLive: false,
    },
    {
      title: 'The Lion King',
      venue: 'Minskoff Theatre',
      date: 'Dec 15, 2:00 PM',
      location: 'New York, NY',
      image: '🎭',
      price: 'From $89',
      category: 'Theater',
      isLive: false,
    },
  ];

  const stats = [
    { number: '2.5M+', label: 'Events Listed', icon: Calendar },
    { number: '850K+', label: 'Happy Customers', icon: Users },
    { number: '99.8%', label: 'Success Rate', icon: CheckCircle },
    { number: '24/7', label: 'Live Support', icon: Headphones },
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Event Organizer',
      content: 'AutoMatch revolutionized how I sell tickets. The AI matching increased my sales by 340% in just 3 months.',
      avatar: '👨‍💼',
      rating: 5,
      verified: true,
    },
    {
      name: 'Sarah Rodriguez',
      role: 'Concert Enthusiast',
      content: 'Found front-row seats to a sold-out show at face value! The platform\'s verification system is incredible.',
      avatar: '👩‍🎤',
      rating: 5,
      verified: true,
    },
    {
      name: 'Mike Johnson',
      role: 'Sports Fan',
      content: 'Last-minute playoff tickets? No problem! Got seats 2 hours before the game. Game-changer for spontaneous fans.',
      avatar: '⚽',
      rating: 5,
      verified: true,
    },
  ];

  const organizer_features = [
    {
      icon: Target,
      title: 'Smart Audience Targeting',
      description: 'Reach the right buyers with AI-powered audience matching.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track sales performance and optimize pricing strategies.',
    },
    {
      icon: Bell,
      title: 'Automated Notifications',
      description: 'Keep attendees informed with smart communication tools.',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Management',
      description: 'Manage your events anywhere with our mobile app.',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
      
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
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-blob floating"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full opacity-20 animate-blob floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full opacity-20 animate-blob floating" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Hero Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-white/30 mb-8 animate-scale-in">
            <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
            <span className="text-sm font-semibold text-gray-800">✨ The Future of Event Discovery</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 animate-slide-up">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight block">
              Discover
            </span>
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent block">
              Live Events
            </span>
            <span className="text-gray-900 block text-4xl md:text-5xl lg:text-6xl mt-4">
              Like Never Before
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Connect with millions of events worldwide. Buy, sell, and trade tickets with 
            <span className="font-semibold text-blue-700"> AI-powered matching</span>, 
            <span className="font-semibold text-purple-700"> verified authenticity</span>, and 
            <span className="font-semibold text-pink-700"> instant delivery</span>.
          </p>

          {/* Event Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events, artists, venues, or teams..."
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <Button variant="primary" className="rounded-xl px-6 py-2">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up mobile-stack" style={{ animationDelay: '0.6s' }}>
            <Link to="/events">
              <Button variant="gradient" size="xl" className="group shadow-2xl hover:shadow-3xl mobile-full">
                <Calendar className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                Browse Events
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="glass" size="xl" className="group border-white/30 mobile-full">
                <Play className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                Start Selling
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.9s' }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group p-2">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-700 font-medium text-sm md:text-base">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Events Ticker */}
      <section className="py-8 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
              <h3 className="text-xl font-bold text-white">Live Events Right Now</h3>
            </div>
            <Link to="/events">
              <Button variant="glass" size="sm" className="border-white/30 text-white">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {liveEvents.map((event, index) => (
              <Card key={index} variant="glass" className="border-white/30 hover:border-white/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{event.image}</div>
                    <div className="flex items-center gap-2">
                      {event.isLive && (
                        <div className="flex items-center px-2 py-1 bg-red-500 rounded-full">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                          <span className="text-white text-xs font-medium">LIVE</span>
                        </div>
                      )}
                      <span className="text-white/80 text-sm">{event.category}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-white mb-2">{event.title}</h4>
                  <div className="space-y-1 text-blue-100 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 mr-2" />
                      <span className="font-semibold text-white">{event.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Explore by Category
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Find exactly what you're looking for from millions of events worldwide
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {eventCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-full transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <span className="font-medium">{category.name}</span>
                  <span className="ml-2 text-sm opacity-75">({category.count})</span>
                </button>
              );
            })}
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
              Advanced technology meets seamless user experience for the ultimate event discovery platform
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
                  className="group border-white/30 hover:border-white/50 transition-all duration-500 relative"
                >
                  <CardContent className="p-6 md:p-8 text-center">
                    {feature.highlight && (
                      <div className="absolute top-4 right-4 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-bold text-white">
                        {feature.highlight}
                      </div>
                    )}
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

      {/* Event Organizer Features */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Built for Event Organizers
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Powerful tools to manage, promote, and sell your events with professional-grade features
              </p>
              
              <div className="space-y-6">
                {organizer_features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-700">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <Button variant="gradient" size="lg" className="mr-4">
                  Start Selling Events
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Event Dashboard</h3>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total Sales</span>
                      <span className="text-2xl font-bold text-blue-600">$47,230</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Tickets Sold</span>
                      <span className="text-2xl font-bold text-green-600">1,247</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Active Events</span>
                      <span className="text-2xl font-bold text-purple-600">12</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 left-4 w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Trusted by Millions
            </h2>
            <p className="text-xl text-gray-700">
              Join thousands of satisfied event-goers and organizers worldwide
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    {testimonial.verified && (
                      <div className="flex items-center px-2 py-1 bg-green-100 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600 text-xs font-medium">Verified</span>
                      </div>
                    )}
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

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Ready to Experience
            <span className="block text-yellow-300">Events Like Never Before?</span>
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
            Join millions of event enthusiasts who trust AutoMatch for seamless ticket discovery and secure transactions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mobile-stack">
            <Link to="/register">
              <Button variant="secondary" size="xl" className="group shadow-2xl mobile-full">
                <Users className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                Get Started Free
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

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-indigo-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Free to Join</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span>Secure & Verified</span>
            </div>
            <div className="flex items-center">
              <Headphones className="h-5 w-5 mr-2" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              <span>Instant Matching</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};