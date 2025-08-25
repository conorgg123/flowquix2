import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Users,
  Calendar,
  MessageSquare,
  Clock,
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart2,
  Globe2,
  Workflow,
  Brain,
  GitBranch,
  Bell,
  Search,
  Kanban,
  LineChart,
  Settings,
  Share2,
  Lock,
  Cloud,
  Smartphone,
  Award,
  CreditCard,
  Package,
  Briefcase,
  Building2
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Real-time collaboration with team members, including live editing and instant updates.',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered calendar management with conflict detection and optimal meeting suggestions.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MessageSquare,
      title: 'Unified Communication',
      description: 'Centralized chat, video calls, and team discussions in one seamless platform.',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Clock,
      title: 'Time Analytics',
      description: 'Advanced time tracking with detailed insights and productivity metrics.',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Intelligent document organization with version control and collaborative editing.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Military-grade encryption and advanced access controls for your data.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Brain,
      title: 'AI Assistance',
      description: 'Smart automation and AI-powered suggestions to optimize your workflow.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: GitBranch,
      title: 'Version Control',
      description: 'Track changes and maintain history for all your project assets.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Intelligent alerts and reminders to keep your team in sync.',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: Search,
      title: 'Global Search',
      description: 'Powerful search capabilities across all your workspace content.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Kanban,
      title: 'Project Management',
      description: 'Flexible project views with Kanban boards, lists, and timelines.',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: LineChart,
      title: 'Performance Analytics',
      description: 'Comprehensive insights into team and project performance.',
      gradient: 'from-violet-500 to-indigo-500'
    },
    {
      icon: Settings,
      title: 'Customization',
      description: "Tailor the platform to match your team's unique workflow.",
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: Share2,
      title: 'Seamless Sharing',
      description: 'Easy file sharing and collaboration with external stakeholders.',
      gradient: 'from-teal-500 to-green-500'
    },
    {
      icon: Lock,
      title: 'Access Control',
      description: 'Granular permissions and role-based access management.',
      gradient: 'from-rose-500 to-red-500'
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'Secure cloud storage with automatic backup and syncing.',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Access',
      description: 'Full-featured mobile apps for iOS and Android devices.',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      icon: Award,
      title: 'Achievements',
      description: 'Gamified productivity with team achievements and rewards.',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      icon: BarChart2,
      title: 'Resource Planning',
      description: 'Optimize resource allocation and capacity planning.',
      gradient: 'from-pink-500 to-purple-500'
    },
    {
      icon: Globe2,
      title: 'Global Accessibility',
      description: 'Access your workspace from anywhere in the world.',
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      icon: Sparkles,
      title: 'Automation',
      description: 'Workflow automation to eliminate repetitive tasks.',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      icon: CheckCircle,
      title: 'Task Management',
      description: 'Comprehensive task tracking with dependencies and priorities.',
      gradient: 'from-indigo-500 to-violet-500'
    },
    {
      icon: MessageSquare,
      title: 'Team Chat',
      description: 'Real-time messaging with channels and direct messages.',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Accurate time tracking with detailed reporting.',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Compliance',
      description: 'Built-in compliance tools for regulatory requirements.',
      gradient: 'from-blue-500 to-purple-500'
    }
  ];

  const testimonials = [
    {
      quote: "Flowquix has revolutionized our workflow. The interface is beautiful and the features are powerful.",
      author: "Sarah Chen",
      role: "CTO at TechFlow",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      quote: "The most intuitive and comprehensive solution for modern teams. A game-changer for productivity.",
      author: "Michael Rodriguez",
      role: "Product Manager at InnovateCo",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      gradient: "from-cyan-500 to-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <div className="flex justify-center items-center mb-8">
                  <Workflow className="h-16 w-16 text-blue-400" />
                  <h1 className="ml-4 text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Flowquix
                  </h1>
                </div>
                <p className="mt-3 text-3xl text-white sm:mt-5 sm:text-4xl md:mt-5 md:text-5xl font-bold">
                  <span className="block">Transform Your Workflow</span>
                  <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Into a Symphony of Success
                  </span>
                </p>
                <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
                  Experience the next evolution in team collaboration. Streamline your workflow, boost productivity, and achieve more together.
                </p>
                <div className="mt-8 sm:mt-12 sm:flex sm:justify-center">
                  <div className="rounded-md shadow">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="#features"
                      className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-white bg-opacity-10 backdrop-blur-lg hover:bg-opacity-20 transition-all duration-200"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:text-center mb-16">
            <h2 className="text-base font-semibold text-blue-400 tracking-wide uppercase">25 Powerful Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold text-white sm:text-4xl">
              Everything You Need to Succeed
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
              A comprehensive suite of tools designed for the modern workspace, bringing together all the features you need for seamless collaboration and productivity.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="relative bg-white bg-opacity-5 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-200 hover:bg-opacity-10 group"
                >
                  <div className={`absolute h-12 w-12 rounded-xl bg-gradient-to-r ${feature.gradient} text-white flex items-center justify-center transform -translate-y-1/2 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-16 pt-2">
                    <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm text-gray-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Trusted Globally
            </h2>
            <p className="mt-3 text-xl text-gray-300 sm:mt-4">
              Join thousands of teams already using Flowquix to transform their workflow
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-300">
                Teams
              </dt>
              <dd className="order-1 text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                100,000+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-300">
                Users
              </dt>
              <dd className="order-1 text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                1M+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-300">
                Countries
              </dt>
              <dd className="order-1 text-5xl font-extrabold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                150+
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-blue-400 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold text-white sm:text-4xl">
              Loved by Teams Everywhere
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-5 backdrop-blur-lg rounded-2xl overflow-hidden transform transition-all hover:scale-105 hover:bg-opacity-10"
              >
                <div className="p-8">
                  <div className="flex items-center">
                    <img
                      className="h-12 w-12 rounded-full ring-2 ring-blue-400"
                      src={testimonial.image}
                      alt={testimonial.author}
                    />
                    <div className="ml-4">
                      <div className="text-lg font-bold text-white">{testimonial.author}</div>
                      <div className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-gray-300 italic">"{testimonial.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-blue-400 font-semibold tracking-wide uppercase">Pricing Plans</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold text-white sm:text-4xl">
              Choose the Perfect Plan for Your Team
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
              Flexible pricing options designed to scale with your needs. All plans include core features with premium add-ons available.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Starter Plan */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Starter</h3>
                <Package className="h-8 w-8 text-blue-400" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$20</span>
                <span className="text-gray-300 ml-2">/month</span>
              </div>
              <p className="mt-2 text-gray-300">Perfect for freelancers and small teams</p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Task Management
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Kanban Boards
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  File Storage (5GB)
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Team Chat
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Mobile Access
                </li>
              </ul>
              <button className="mt-8 w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 border border-indigo-400/30 transform hover:scale-105 transition-all duration-200 shadow-xl relative">
              <div className="absolute -top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Professional</h3>
                <Briefcase className="h-8 w-8 text-indigo-200" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$50</span>
                <span className="text-indigo-200 ml-2">/month</span>
              </div>
              <p className="mt-2 text-indigo-200">Ideal for growing businesses</p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Everything in Starter
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Real-Time Collaboration
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Time Tracking
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Calendar Integration
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Advanced Permissions
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Priority Support
                </li>
              </ul>
              <button className="mt-8 w-full bg-white text-indigo-600 py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                <Building2 className="h-8 w-8 text-purple-400" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$150</span>
                <span className="text-gray-300 ml-2">/month</span>
              </div>
              <p className="mt-2 text-gray-300">For large organizations</p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Everything in Professional
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Unlimited Users
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Advanced Analytics
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Custom Integrations
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  24/7 Premium Support
                </li>
              </ul>
              <button className="mt-8 w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Optional Add-ons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'Collaboration Pack',
                  price: '$10/month',
                  features: ['Real-Time Collaboration', 'Team Communication'],
                  icon: Users
                },
                {
                  name: 'Productivity Pack',
                  price: '$10/month',
                  features: ['Time Tracking', 'Calendar', 'Dashboards'],
                  icon: Clock
                },
                {
                  name: 'Business Pack',
                  price: '$15/month',
                  features: ['CRM', 'Billing', 'Email Integration'],
                  icon: Briefcase
                }
              ].map((addon, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">{addon.name}</h4>
                    <addon.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-4">{addon.price}</p>
                  <ul className="space-y-2">
                    {addon.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors">
                    Add to Plan
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  q: "Can I switch plans anytime?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes, we offer a 14-day free trial of our Professional plan to help you explore all features."
                },
                {
                  q: "Do you offer discounts?",
                  a: "Yes, we offer discounts for annual billing (10% off) and special rates for nonprofits and educational institutions."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-2">{faq.q}</h4>
                  <p className="text-gray-300">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl"></div>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            <span className="block">Ready to transform your workflow?</span>
            <span className="block mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Start your journey today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                Get started
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}