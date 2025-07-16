import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Shield,
  Clock,
  ArrowRight,
  Star,
  Users,
  Zap,
  CheckCircle,
  Calendar,
  MapPin,
  Ticket,
  Music,
  Trophy,
  Theater,
  Mic,
  Bell,
  DollarSign,
  Headphones,
  Globe,
  TrendingUp,
  Flame,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Fingerprint,
  Cpu,
  Infinity as InfinityIcon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

export const HomePage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic hero slides with live events
  const heroSlides = [
    {
      id: 1,
      title: "Taylor Swift | Eras Tour",
      subtitle: "Experience the magic live",
      location: "MetLife Stadium, East Rutherford",
      date: "Tonight • 8:00 PM",
      price: "From $180",
      image: "🎤",
      gradient: "from-purple-600 via-pink-600 to-rose-600",
      category: "Concert",
      soldOut: false,
      trending: true,
      attendees: "65,000+",
    },
    {
      id: 2,
      title: "Lakers vs Warriors",
      subtitle: "NBA Finals Game 7",
      location: "Crypto.com Arena, Los Angeles",
      date: "Tomorrow • 7:30 PM",
      price: "From $95",
      image: "🏀",
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      category: "Sports",
      soldOut: false,
      trending: true,
      attendees: "20,000+",
    },
    {
      id: 3,
      title: "Beyoncé Renaissance",
      subtitle: "World Tour 2024",
      location: "Madison Square Garden, NYC",
      date: "This Weekend • 9:00 PM",
      price: "From $250",
      image: "👑",
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      category: "Concert",
      soldOut: true,
      trending: true,
      attendees: "50,000+",
    },
  ];

  // Dynamic stats with real-time updates
  const realTimeStats = [
    {
      number: "2.8M+",
      label: "Live Events",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      prefix: "",
      suffix: "+",
    },
    {
      number: "950K+",
      label: "Active Users",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      prefix: "",
      suffix: "+",
    },
    {
      number: "$47M+",
      label: "Transactions",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      prefix: "$",
      suffix: "M+",
    },
    {
      number: "99.9%",
      label: "Success Rate",
      icon: CheckCircle,
      color: "from-orange-500 to-red-500",
      prefix: "",
      suffix: "%",
    },
  ];

  // Advanced features showcase
  const advancedFeatures = [
    {
      icon: Cpu,
      title: "AI-Powered Matching",
      description:
        "Advanced machine learning algorithms match you with perfect events instantly.",
      color: "from-blue-500 to-cyan-500",
      highlight: "AI-Powered",
      stats: "340% faster matching",
    },
    {
      icon: Fingerprint,
      title: "Biometric Security",
      description:
        "Next-gen security with biometric verification and blockchain protection.",
      color: "from-green-500 to-emerald-500",
      highlight: "Ultra-Secure",
      stats: "99.99% fraud prevention",
    },
    {
      icon: Gauge,
      title: "Lightning Speed",
      description:
        "Sub-second ticket delivery with real-time inventory synchronization.",
      color: "from-purple-500 to-pink-500",
      highlight: "Ultra-Fast",
      stats: "<0.3s processing",
    },
    {
      icon: InfinityIcon,
      title: "Infinite Scale",
      description:
        "Handle millions of concurrent users with cloud-native architecture.",
      color: "from-orange-500 to-red-500",
      highlight: "Scalable",
      stats: "10M+ concurrent users",
    },
  ];

  // Trending events with dynamic data
  const trendingEvents = [
    {
      id: 1,
      title: "Ed Sheeran Mathematics Tour",
      venue: "Wembley Stadium",
      date: "Dec 20, 2024",
      location: "London, UK",
      image: "🎸",
      price: "From £89",
      category: "Concert",
      trending: true,
      boost: "+340%",
      attendees: "90,000",
      rating: 4.9,
    },
    {
      id: 2,
      title: "Manchester United vs Arsenal",
      venue: "Old Trafford",
      date: "Dec 22, 2024",
      location: "Manchester, UK",
      image: "⚽",
      price: "From £120",
      category: "Sports",
      trending: true,
      boost: "+280%",
      attendees: "75,000",
      rating: 4.8,
    },
    {
      id: 3,
      title: "Hamilton Musical",
      venue: "West End Theatre",
      date: "Dec 25, 2024",
      location: "London, UK",
      image: "🎭",
      price: "From £75",
      category: "Theater",
      trending: false,
      boost: "+120%",
      attendees: "2,500",
      rating: 4.9,
    },
    {
      id: 4,
      title: "Dave Chappelle Live",
      venue: "Apollo Theater",
      date: "Dec 28, 2024",
      location: "New York, NY",
      image: "😂",
      price: "From $85",
      category: "Comedy",
      trending: true,
      boost: "+200%",
      attendees: "1,800",
      rating: 4.7,
    },
    {
      id: 5,
      title: "NBA All-Star Game",
      venue: "Crypto.com Arena",
      date: "Feb 18, 2025",
      location: "Los Angeles, CA",
      image: "🏀",
      price: "From $200",
      category: "Sports",
      trending: true,
      boost: "+450%",
      attendees: "20,000",
      rating: 4.8,
    },
    {
      id: 6,
      title: "Coldplay World Tour",
      venue: "Rose Bowl",
      date: "Mar 15, 2025",
      location: "Pasadena, CA",
      image: "🌟",
      price: "From $95",
      category: "Concert",
      trending: true,
      boost: "+380%",
      attendees: "85,000",
      rating: 4.9,
    },
  ];

  // Event categories with dynamic counts
  const eventCategories = [
    {
      id: "all",
      name: "All Events",
      icon: Globe,
      count: "2.8M",
      color: "from-blue-500 to-indigo-500",
      growth: "+12%",
    },
    {
      id: "concerts",
      name: "Concerts",
      icon: Music,
      count: "847K",
      color: "from-purple-500 to-pink-500",
      growth: "+18%",
    },
    {
      id: "sports",
      name: "Sports",
      icon: Trophy,
      count: "623K",
      color: "from-green-500 to-emerald-500",
      growth: "+15%",
    },
    {
      id: "theater",
      name: "Theater",
      icon: Theater,
      count: "234K",
      color: "from-orange-500 to-red-500",
      growth: "+8%",
    },
    {
      id: "comedy",
      name: "Comedy",
      icon: Mic,
      count: "156K",
      color: "from-yellow-500 to-orange-500",
      growth: "+22%",
    },
  ];

  // Enhanced testimonials with more details
  const testimonials = [
    {
      name: "Alex Chen",
      role: "Event Organizer",
      company: "LiveNation",
      content:
        "AutoMatch revolutionized how I sell tickets. The AI matching increased my sales by 340% in just 3 months. The analytics are incredible.",
      avatar: "👨‍💼",
      rating: 5,
      verified: true,
      location: "San Francisco, CA",
      events: "127 events organized",
    },
    {
      name: "Sarah Rodriguez",
      role: "Concert Enthusiast",
      company: "Music Lover",
      content:
        "Found front-row seats to a sold-out show at face value! The platform's verification system is incredible. Never buying tickets elsewhere again.",
      avatar: "👩‍🎤",
      rating: 5,
      verified: true,
      location: "Nashville, TN",
      events: "89 events attended",
    },
    {
      name: "Mike Johnson",
      role: "Sports Fan",
      company: "Season Ticket Holder",
      content:
        "Last-minute playoff tickets? No problem! Got seats 2 hours before the game. Game-changer for spontaneous fans like me.",
      avatar: "⚽",
      rating: 5,
      verified: true,
      location: "Chicago, IL",
      events: "156 events attended",
    },
  ];

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const currentHeroSlide = heroSlides[currentSlide];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Advanced animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>

      {/* Particle effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Interactive cursor effect */}
      <div
        className="fixed pointer-events-none z-30 w-8 h-8 rounded-full blur-sm transition-all duration-300"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
          background: `radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(219,39,119,0.4) 100%)`,
          transform: "scale(1.2)",
        }}
      />

      {/* Dynamic Hero Slider */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentHeroSlide.gradient} transition-all duration-1000`}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Slider navigation */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20">
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">LIVE NOW</span>
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
          </div>

          {/* Event title */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
            {currentHeroSlide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-white/90 font-light mb-8">
            {currentHeroSlide.subtitle}
          </p>

          {/* Event details */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="flex items-center text-white/80">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-lg">{currentHeroSlide.location}</span>
            </div>
            <div className="flex items-center text-white/80">
              <Clock className="h-5 w-5 mr-2" />
              <span className="text-lg">{currentHeroSlide.date}</span>
            </div>
            <div className="flex items-center text-white/80">
              <Users className="h-5 w-5 mr-2" />
              <span className="text-lg">
                {currentHeroSlide.attendees} attending
              </span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="text-3xl font-bold text-white">
              {currentHeroSlide.price}
            </div>
            {currentHeroSlide.soldOut ? (
              <Button
                variant="secondary"
                size="xl"
                className="opacity-60 cursor-not-allowed"
              >
                <Ticket className="h-6 w-6 mr-3" />
                Sold Out
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="xl"
                className="group shadow-2xl"
              >
                <Ticket className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                Get Tickets Now
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>

          {/* Trending indicator */}
          {currentHeroSlide.trending && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30">
              <TrendingUp className="h-4 w-4 text-orange-400 mr-2" />
              <span className="text-orange-100 font-medium">
                Trending Event
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Real-time Stats Banner */}
      <section className="relative py-16 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Real-Time Platform Statistics
            </h2>
            <p className="text-xl text-white/70">
              Watch our numbers grow in real-time
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {realTimeStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 font-mono">
                    {stat.number}
                  </div>
                  <div className="text-white/70 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Explore by Category
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Discover millions of events across all categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {eventCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group relative p-8 rounded-2xl transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-white/20 border-2 border-white/30"
                      : "bg-white/5 hover:bg-white/10 border-2 border-white/10"
                  }`}
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-2xl font-black text-white mb-2">
                    {category.count}
                  </p>
                  <div className="flex items-center justify-center text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{category.growth}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Events */}
      <section className="relative py-20 bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Trending Events
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Don't miss out on the hottest events everyone's talking about
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingEvents.map((event) => (
              <Card
                key={event.id}
                className="group relative bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <CardContent className="p-6">
                  {event.trending && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-orange-500 rounded-full text-xs font-bold text-white">
                      🔥 TRENDING
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{event.image}</div>
                    <div className="text-right">
                      <div className="flex items-center text-green-400 text-sm mb-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>{event.boost}</span>
                      </div>
                      <div className="flex items-center text-white/60 text-sm">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        <span>{event.rating}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-white/70 text-sm mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">
                      {event.price}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="group-hover:scale-105 transition-transform"
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      Get Tickets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Next-Generation Technology
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Experience the future of event discovery with cutting-edge
              features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group relative bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-500"
                >
                  <CardContent className="p-8 text-center">
                    <div className="absolute top-4 right-4 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-bold text-white">
                      {feature.highlight}
                    </div>

                    <div
                      className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    <div className="text-sm text-green-400 font-medium">
                      {feature.stats}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Trusted by Millions Worldwide
            </h2>
            <p className="text-xl text-white/70">
              Join thousands of satisfied event-goers and organizers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      {testimonial.verified && (
                        <div className="flex items-center px-2 py-1 bg-green-500/20 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-xs font-medium">
                            Verified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-white/90 leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-white/60 text-sm">
                          {testimonial.role}
                        </div>
                        <div className="text-white/40 text-xs">
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-xs">
                        {testimonial.events}
                      </div>
                      <div className="text-white/40 text-xs">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-6xl font-bold text-white mb-8">
            Ready to Transform Your
            <span className="block text-yellow-300">Event Experience?</span>
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Join millions of event enthusiasts who trust AutoMatch for the
            ultimate event discovery and ticket trading experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
            <Link to="/register">
              <Button
                variant="secondary"
                size="xl"
                className="group shadow-2xl text-lg px-12 py-6"
              >
                <Users className="h-8 w-8 mr-3 group-hover:scale-110 transition-transform" />
                Get Started Free
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/events">
              <Button
                variant="outline"
                size="xl"
                className="group border-white/30 text-white text-lg px-12 py-6"
              >
                <Search className="h-8 w-8 mr-3 group-hover:rotate-12 transition-transform" />
                Explore Events
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white/80">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 mr-3" />
              <span className="text-lg">Free to Join</span>
            </div>
            <div className="flex items-center justify-center">
              <Shield className="h-6 w-6 mr-3" />
              <span className="text-lg">100% Secure</span>
            </div>
            <div className="flex items-center justify-center">
              <Zap className="h-6 w-6 mr-3" />
              <span className="text-lg">Instant Matching</span>
            </div>
            <div className="flex items-center justify-center">
              <Headphones className="h-6 w-6 mr-3" />
              <span className="text-lg">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width Footer */}
      <footer className="bg-slate-900 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800"></div>
        <div className="relative z-10">
          {/* Newsletter Section */}
          <div className="border-b border-white/10 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
                <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                  Get notified about the hottest events and exclusive deals
                  before anyone else.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button variant="gradient" size="lg" className="px-8">
                    <Bell className="h-5 w-5 mr-2" />
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer */}
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold">AutoMatch</span>
                  </div>
                  <p className="text-white/70 text-lg mb-6 max-w-md">
                    The world's most advanced event discovery platform.
                    Connecting millions of event enthusiasts with unforgettable
                    experiences.
                  </p>
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                      <span className="text-xl">📱</span>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                      <span className="text-xl">🐦</span>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                      <span className="text-xl">📘</span>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                      <span className="text-xl">📸</span>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <h4 className="text-lg font-bold mb-6">Platform</h4>
                  <ul className="space-y-4">
                    <li>
                      <Link
                        to="/events"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        Browse Events
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/sell"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        Sell Tickets
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/organizers"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        For Organizers
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/api"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        API
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-6">Company</h4>
                  <ul className="space-y-4">
                    <li>
                      <Link
                        to="/about"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/careers"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        Careers
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/press"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        Press
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-white/60 mb-4 md:mb-0">
                  © 2025 AutoMatch. All rights reserved.
                </div>
                <div className="flex space-x-6">
                  <Link
                    to="/privacy"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    to="/security"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Security
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
