import React from 'react';
import {
  ShoppingCart,
  Mail,
  Twitter,
  Sparkles,
  Shield,
  Zap,
  Heart,
  ArrowRight,
  Facebook,
  Linkedin
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white mt-auto overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 md:py-12">
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-4 md:gap-8 mb-6 md:mb-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-1.5 md:p-2 rounded-xl md:rounded-2xl">
                  <ShoppingCart className="w-4 h-4 md:w-6 md:h-6" />
                </div>
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                DealHawk
              </span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-6 leading-relaxed">
              Compare prices across multiple platforms and save money on every purchase. Smart shopping made simple.
            </p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <FeatureBadge icon={<Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />} text="Smart Search" />
              <FeatureBadge icon={<Shield className="w-2.5 h-2.5 md:w-3 md:h-3" />} text="Secure" />
              <FeatureBadge icon={<Zap className="w-2.5 h-2.5 md:w-3 md:h-3" />} text="Fast" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:contents">
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-6 flex items-center gap-2">
                <div className="w-0.5 md:w-1 h-4 md:h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                Quick Links
              </h3>
              <ul className="space-y-2 md:space-y-3">
                <FooterLink href="/about" icon={<ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}>About Us</FooterLink>
                <FooterLink href="/how-it-works" icon={<ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}>How It Works</FooterLink>
                <FooterLink href="/faq" icon={<ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}>FAQ</FooterLink>
                <FooterLink href="/pricing" icon={<ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}>Pricing</FooterLink>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-6 flex items-center gap-2">
                <div className="w-0.5 md:w-1 h-4 md:h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                Support
              </h3>
              <ul className="space-y-2 md:space-y-3">
                <FooterLink href="/contact" icon={<ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}>Contact Us</FooterLink>
                <FooterLink href="/privacy" icon={<ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}>Privacy Policy</FooterLink>
                <FooterLink href="/terms" icon={<ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}>Terms of Service</FooterLink>
                <FooterLink href="/help" icon={<ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}>Help Center</FooterLink>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-6 flex items-center gap-2">
              <div className="w-0.5 md:w-1 h-4 md:h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              Stay Connected
            </h3>
            <div className="flex gap-2 md:gap-3 mb-4 md:mb-6">
              <SocialLink href="mailto:contact@dealhawk.com" icon={<Mail />} label="Email" />
              <SocialLink href="https://twitter.com" icon={<Twitter />} label="Twitter" />
              <SocialLink href="https://facebook.com" icon={<Facebook />} label="Facebook" />
              <SocialLink href="https://linkedin.com" icon={<Linkedin />} label="LinkedIn" />
            </div>

            <div className="mt-4 md:mt-6">
              <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">Get the best deals in your inbox</p>
              <div className="flex gap-1.5 md:gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 md:px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-xs md:text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-500"
                />
                <button className="px-3 md:px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:shadow-lg transition-all hover:scale-105">
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-12 p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10">
          <StatItem number="6+" label="Platforms" />
          <StatItem number="24/7" label="Monitoring" />
          <StatItem number="100%" label="Free" />
        </div>

        <div className="pt-4 md:pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            <p className="text-xs md:text-sm text-gray-400 text-center md:text-left">
              &copy; {currentYear} DealHawk. All rights reserved. Made with{' '}
              <Heart className="w-3 h-3 md:w-4 md:h-4 inline text-red-500 fill-current animate-pulse" /> in India by Shiva
            </p>
            <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
              <a href="/sitemap" className="hover:text-white transition-colors">Sitemap</a>
              <a href="/accessibility" className="hover:text-white transition-colors">Accessibility</a>
              <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </footer>
  );
};

/* ------------------ Reusable Components ------------------ */

const FooterLink = ({ href, icon, children }) => (
  <li>
    <a
      href={href}
      className="group flex items-center gap-1.5 md:gap-2 text-gray-400 hover:text-white transition-all hover:translate-x-1"
    >
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        {icon}
      </span>
      <span className="text-xs md:text-sm">{children}</span>
    </a>
  </li>
);

const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all hover:scale-110 group"
  >
    {React.cloneElement(icon, {
      className: "w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors"
    })}
  </a>
);

const FeatureBadge = ({ icon, text }) => (
  <div className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-white/10 rounded-full text-[10px] md:text-xs text-gray-300 border border-white/20">
    {icon}
    <span>{text}</span>
  </div>
);

const StatItem = ({ number, label }) => (
  <div className="text-center">
    <p className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-0.5 md:mb-1">
      {number}
    </p>
    <p className="text-[10px] md:text-xs text-gray-400">{label}</p>
  </div>
);

export default Footer;