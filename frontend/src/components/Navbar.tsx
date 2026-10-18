import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Briefcase,
  PlusCircle,
  FileText,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import DemoBadge from './DemoBadge';

interface NavLinkItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Dynamic navigation links based on user role
  const getNavLinks = (): NavLinkItem[] => {
    if (!user) {
      return [
        { label: 'How it Works', path: '/#how-it-works' },
        { label: 'Verification', path: '/#verification' },
        { label: 'Flash Referrals', path: '/#referrals' },
      ];
    }

    switch (user.role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/dashboard/student', icon: Layers },
          { label: 'Code-DNA', path: '/profile/code-dna', icon: Sparkles },
          { label: 'Referrals', path: '/referrals', icon: Briefcase },
          { label: 'GitHub Sync', path: '/github/connect', icon: GitBranch },
          { label: 'Consent', path: '/consent', icon: ShieldCheck },
        ];
      case 'alumni':
        return [
          { label: 'Dashboard', path: '/dashboard/alumni', icon: Layers },
          { label: 'Referrals', path: '/referrals', icon: Briefcase },
          { label: 'Post Referral', path: '/referrals/new', icon: PlusCircle },
          { label: 'Profile', path: '/profile', icon: UserIcon },
        ];
      case 'recruiter':
        return [
          { label: 'Dashboard', path: '/dashboard/recruiter', icon: Layers },
          { label: 'Outcomes', path: '/dashboard/recruiter', icon: FileText },
          { label: 'Referrals', path: '/referrals', icon: Briefcase },
        ];
      case 'founder':
        return [
          { label: 'Dashboard', path: '/dashboard/founder', icon: Layers },
        ];
      case 'admin':
        return [
          { label: 'Admin Panel', path: '/dashboard/admin', icon: Sliders },
          { label: 'Referrals', path: '/referrals', icon: Briefcase },
        ];
      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: Layers },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-[#0a191e]/95 backdrop-blur-md border-b border-teal-900/50 sticky top-0 z-40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-copper-600 flex items-center justify-center text-white shadow-md shadow-teal-950 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-300 transition-colors">
                  Skill<span className="text-brand-400">Bridge</span>
                </span>
              </div>
            </Link>

            {user?.isDemo && (
              <div className="ml-2">
                <DemoBadge />
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-teal-950/80 text-brand-300 border border-teal-800/60 shadow-inner font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-teal-950/40'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-brand-400" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {user ? (
              <>
                <NotificationBell />

                <div className="h-6 w-px bg-teal-900/50 mx-1" />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full hover:bg-teal-950/60 transition-colors border border-teal-900/40 hover:border-teal-700/60"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-900/80 text-brand-300 flex items-center justify-center font-bold text-xs ring-1 ring-teal-700">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-brand-400 capitalize leading-tight">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl bg-[#0a1f24] border border-teal-900/80 py-2 focus:outline-none z-50 text-slate-200">
                      <div className="px-4 py-2.5 border-b border-teal-900/50">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Signed in as</p>
                        <p className="text-xs font-bold text-white truncate">
                          {user.email}
                        </p>
                        {user.institution && (
                          <p className="text-[11px] text-brand-400 font-medium mt-0.5 truncate">
                            {user.institution.name}
                          </p>
                        )}
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-teal-950/60 hover:text-white"
                      >
                        <UserIcon className="w-4 h-4 text-brand-400" />
                        My Profile & Settings
                      </Link>

                      <Link
                        to="/consent"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-teal-950/60 hover:text-white"
                      >
                        <ShieldCheck className="w-4 h-4 text-brand-400" />
                        Consent Settings
                      </Link>

                      <div className="border-t border-teal-900/50 my-1.5" />

                      {/* Quick Persona Switcher for Evaluation */}
                      <div className="px-4 py-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400/90">
                          Switch Persona Role:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                          <button
                            type="button"
                            onClick={async () => {
                              setUserDropdownOpen(false);
                              await demoLogin('student');
                              window.location.href = '/dashboard/student';
                            }}
                            className="px-2 py-1.5 text-[11px] font-semibold bg-[#061013] hover:bg-teal-950 text-brand-300 rounded-lg text-left transition border border-teal-900/60"
                          >
                            🎓 Student
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setUserDropdownOpen(false);
                              await demoLogin('alumni');
                              window.location.href = '/dashboard/alumni';
                            }}
                            className="px-2 py-1.5 text-[11px] font-semibold bg-[#061013] hover:bg-teal-950 text-emerald-300 rounded-lg text-left transition border border-teal-900/60"
                          >
                            🤝 Alumni
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setUserDropdownOpen(false);
                              await demoLogin('recruiter');
                              window.location.href = '/dashboard/recruiter';
                            }}
                            className="px-2 py-1.5 text-[11px] font-semibold bg-[#061013] hover:bg-teal-950 text-copper-300 rounded-lg text-left transition border border-teal-900/60"
                          >
                            💼 Recruiter
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setUserDropdownOpen(false);
                              await demoLogin('admin');
                              window.location.href = '/dashboard/admin';
                            }}
                            className="px-2 py-1.5 text-[11px] font-semibold bg-[#061013] hover:bg-teal-950 text-amber-300 rounded-lg text-left transition border border-teal-900/60"
                          >
                            🛡️ Admin
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-teal-900/50 my-1.5" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-white bg-copper-600 hover:bg-copper-500 rounded-xl shadow-lg shadow-copper-900/40 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            {user && <NotificationBell />}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-teal-950"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-teal-900/50 bg-[#0a1f24] px-4 pt-3 pb-6 space-y-3">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-[#061013] rounded-2xl border border-teal-900/60 mb-3">
              <div className="w-10 h-10 rounded-full bg-teal-900 text-brand-300 flex items-center justify-center font-bold text-sm ring-1 ring-teal-700">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  {user.isDemo && <DemoBadge size="sm" />}
                </div>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-teal-950 text-brand-300 border border-teal-800 rounded-md text-[10px] font-semibold uppercase">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-teal-950 text-brand-300 font-bold border border-teal-800'
                      : 'text-slate-300 hover:bg-teal-950/60 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-brand-400" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {user ? (
            <div className="pt-3 border-t border-teal-900/50 space-y-1">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-teal-950/60 hover:text-white"
              >
                <UserIcon className="w-4 h-4 text-brand-400" />
                Profile Settings
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-teal-900/50 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-xs font-semibold text-brand-300 bg-teal-950 rounded-xl border border-teal-800"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-xs font-bold text-white bg-copper-600 rounded-xl shadow-lg shadow-copper-900/40"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
