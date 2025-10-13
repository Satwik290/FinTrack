import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: '💰',
      title: 'Smart Budgeting',
      description: 'Set personalized budgets and track your spending with intelligent alerts and recommendations.'
    },
    {
      icon: '📊',
      title: 'Visual Analytics',
      description: 'Beautiful charts and graphs that make understanding your finances simple and intuitive.'
    },
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description: 'Set financial goals and watch your progress with motivating milestones and achievements.'
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Get timely alerts about bills, budgets, and unusual spending patterns.'
    },
    {
      icon: '🏦',
      title: 'Bank Integration',
      description: 'Connect your accounts for automatic transaction imports and real-time balance updates.'
    },
    {
      icon: '🔒',
      title: 'Bank-Level Security',
      description: 'Your financial data is protected with enterprise-grade encryption and security.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      avatar: '👩‍💼',
      text: 'FinTrack helped me save 30% more each month. The budgeting tools are incredibly intuitive!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      avatar: '👨‍💻',
      text: 'Best finance app I\'ve used. The analytics are powerful yet easy to understand.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Teacher',
      avatar: '👩‍🏫',
      text: 'Finally achieved my savings goal! The goal tracking feature kept me motivated.',
      rating: 5
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '$10M+', label: 'Money Managed' },
    { value: '4.9/5', label: 'User Rating' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white shadow-lg backdrop-blur-lg bg-opacity-90' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FinTrack
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Pricing
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="px-6 py-2.5 text-gray-700 font-medium hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-gray-700 hover:text-indigo-600 font-medium">
                Features
              </a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-indigo-600 font-medium">
                How It Works
              </a>
              <a href="#testimonials" className="block text-gray-700 hover:text-indigo-600 font-medium">
                Testimonials
              </a>
              <a href="#pricing" className="block text-gray-700 hover:text-indigo-600 font-medium">
                Pricing
              </a>
              <div className="pt-4 space-y-3">
                <Link
                  to="/login"
                  className="block text-center px-6 py-3 text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeIn} className="inline-block mb-4">
                <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                  🎉 Trusted by 50,000+ users
                </span>
              </motion.div>
              
              <motion.h1
                variants={fadeIn}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              >
                Take Control of Your{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Financial Future
                </span>
              </motion.h1>
              
              <motion.p
                variants={fadeIn}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                The smartest way to manage your money. Track expenses, create budgets, and achieve your financial goals with ease.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <span>→</span>
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <span>▶</span>
                  Watch Demo
                </a>
              </motion.div>

              <motion.div variants={fadeIn} className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {['👨‍💼', '👩‍💻', '👨‍🎨', '👩‍🔬'].map((avatar, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg border-2 border-white">
                      {avatar}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-yellow-500">
                    {'★★★★★'.split('').map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Rated 4.9/5 by users</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <img 
                  src="https://via.placeholder.com/600x400/6366f1/ffffff?text=Dashboard+Previw" 
                  alt="Dashboard" 
                  className="rounded-lg w-full"
                />
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Savings</p>
                    <p className="text-xl font-bold text-green-600">+₹15,000</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Goal Progress</p>
                    <p className="text-xl font-bold text-blue-600">75%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeIn} className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
              Features
            </motion.span>
            <motion.h2 variants={fadeIn} className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Everything You Need to Manage Your Money
            </motion.h2>
            <motion.p variants={fadeIn} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make financial management simple, intuitive, and effective.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeIn} className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
              How It Works
            </motion.span>
            <motion.h2 variants={fadeIn} className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Get Started in 3 Simple Steps
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up in seconds with your email. No credit card required.', icon: '📝' },
              { step: '02', title: 'Connect Accounts', desc: 'Link your bank accounts or add transactions manually.', icon: '🔗' },
              { step: '03', title: 'Track & Save', desc: 'Watch your finances grow with smart insights and budgets.', icon: '📈' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
                  <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="text-5xl mb-4 mt-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeIn} className="text-indigo-200 font-semibold text-sm uppercase tracking-wide">
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeIn} className="text-4xl font-bold text-white mt-2 mb-4">
              Loved by Thousands of Users
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-1 text-yellow-500 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Financial Life?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of users who are already saving more and stressing less.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg"
            >
              Get Started for Free
              <span>→</span>
            </Link>
            <p className="text-sm text-gray-500 mt-4">No credit card required • Free forever</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <span className="text-xl font-bold">FinTrack</span>
              </div>
              <p className="text-gray-400 text-sm">
                Smart personal finance management for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 FinTrack. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                📷
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;