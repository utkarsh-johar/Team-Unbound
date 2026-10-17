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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Skill<span className="text-indigo-600">Bridge</span>
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
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

                <div className="h-6 w-px bg-slate-200 mx-1" />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 capitalize leading-tight">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-slate-900/10 py-1.5 focus:outline-none z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user.email}
                        </p>
                        {user.institution && (
                          <p className="text-[11px] text-indigo-600 font-medium mt-0.5 truncate">
                            {user.institution.name}
                          </p>
                        )}
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/consent"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        Consent Settings
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      {/* Quick Persona Switcher for Evaluation */}
                      <div className="px-4 py-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Switch Demo Role:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              setUserDropdownOpen(false);
                              await demoLogin('student');
                              window.location.href = '/dashboard/student';
                            }}
                            className="px-2 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-left transition"
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
                            className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-left transition"
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
                            className="px-2 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md text-left transition"
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
                            className="px-2 py-1 text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-left transition"
                          >
                            🛡️ Admin
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
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
                  className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
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
              className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  {user.isDemo && <DemoBadge size="sm" />}
                </div>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-semibold uppercase">
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <UserIcon className="w-5 h-5 text-slate-400" />
                Profile Settings
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm"
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
