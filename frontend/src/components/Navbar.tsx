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
        { label: 'Verified Skills', path: '/#verification' },
        { label: 'Flash Referrals', path: '/referrals' },
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
    <nav className="bg-[#151717] border-b border-[#125b63]/30 sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <span className="w-3 h-3 rounded-full bg-[#fd5800]" />
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold tracking-tight text-white">
                  Skill<span className="text-[#238480]">Bridge</span>
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#125b63] text-white font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-[#238480]" />}
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

                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* User Dropdown with Avatar */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2.5 p-1 pl-2.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#f2521d] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[#238480] capitalize leading-tight">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl bg-white text-slate-800 border border-slate-200 py-2 focus:outline-none z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#f2521d] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {user.name || user.email}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {user.email}
                          </p>
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-[#125b63] uppercase">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#125b63]"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile & Settings
                      </Link>

                      <Link
                        to="/consent"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#125b63]"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        Consent Settings
                      </Link>

                      <div className="border-t border-slate-100 my-1.5" />

                      {/* Quick Persona Switcher for Evaluation */}
                      <div className="px-4 py-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Switch Role View:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                          <button
                            type="button"
                            onClick={async () => {
                              setUserDropdownOpen(false);
                              await demoLogin('student');
                              window.location.href = '/dashboard/student';
                            }}
                            className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-50 hover:bg-[#125b63]/10 text-[#125b63] rounded-lg text-left transition border border-slate-200"
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
                            className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-50 hover:bg-[#238480]/10 text-[#238480] rounded-lg text-left transition border border-slate-200"
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
                            className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-50 hover:bg-[#fd5800]/10 text-[#fd5800] rounded-lg text-left transition border border-slate-200"
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
                            className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-50 hover:bg-[#8d5535]/10 text-[#8d5535] rounded-lg text-left transition border border-slate-200"
                          >
                            🛡️ Admin
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 my-1.5" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
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
                  Log in
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#fd5800] hover:bg-[#e04e00] rounded-xl shadow-md transition-all"
                >
                  Get started
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
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#125b63]/30 bg-[#151717] px-4 pt-3 pb-6 space-y-3">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#f2521d] text-white flex items-center justify-center font-bold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  {user.isDemo && <DemoBadge size="sm" />}
                </div>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#125b63] text-white rounded-md text-[10px] font-semibold uppercase">
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
                      ? 'bg-[#125b63] text-white font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-[#238480]" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {user ? (
            <div className="pt-3 border-t border-white/10 space-y-1">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <UserIcon className="w-4 h-4 text-[#238480]" />
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
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-xs font-semibold text-white bg-white/10 rounded-xl"
              >
                Log in
              </Link>
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-xs font-bold text-white bg-[#fd5800] rounded-xl shadow-md"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
