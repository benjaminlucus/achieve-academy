import Image from "next/image";
import Link from "next/link";
import {  Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';


export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark-navy text-off-white py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Achieve Academy Logo"
                width={32}
                height={32}
                className="w-8 h-8 invert brightness-0"
              />
              <span className="text-xl font-bold tracking-tight">
                Achieve Academy
              </span>
            </Link>
            <p className="text-steel-blue font-medium">
              Empowering students globally with personalized, expert-led education for a brighter future.
            </p>
            <div className="flex items-center gap-4">
              <Link href="https://facebook.com" target="_blank" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-steel-blue hover:text-off-white">
                <FaFacebook size={20} />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-steel-blue hover:text-off-white">
                <FaTwitter size={20} />
              </Link>
              <Link href="https://instagram.com" target="_blank" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-steel-blue hover:text-off-white">
                <FaInstagram size={20} />
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-steel-blue hover:text-off-white">
                <FaLinkedin size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 text-coral uppercase tracking-widest text-sm">Platform</h4>
            <ul className="flex flex-col gap-4 text-steel-blue font-medium">
              <li><Link href="/#features" className="hover:text-off-white transition-colors">Features</Link></li>
              <li><Link href="/tutors" className="hover:text-off-white transition-colors">Find Tutors</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-off-white transition-colors">How it works</Link></li>
              <li><Link href="/#testimonials" className="hover:text-off-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 text-coral uppercase tracking-widest text-sm">Support</h4>
            <ul className="flex flex-col gap-4 text-steel-blue font-medium">
              <li><Link href="/help" className="hover:text-off-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-off-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-off-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-off-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-6">
            <h4 className="text-lg font-bold text-coral uppercase tracking-widest text-sm">Contact</h4>
            <div className="flex flex-col gap-4 text-steel-blue font-medium">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-coral" />
                <span>hello@achieveacademy.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-coral" />
                <span>+1 (555) 000-0000</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-coral" />
                <span>123 Education St, San Francisco</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-steel-blue text-sm font-medium">
          <p>© {currentYear} Achieve Academy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-off-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-off-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-off-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
