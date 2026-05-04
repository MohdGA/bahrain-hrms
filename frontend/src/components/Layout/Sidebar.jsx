import { NavLink } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import Logo from '../Logo';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, UserPlus, TrendingUp, Calendar,
  BarChart2, FolderKanban, Settings, HelpCircle, Phone,
  UserCircle, FileCheck, Shield,
} from 'lucide-react';
import { useAuth } from '../../store/authStore';

const navItems = [
  { to: '/',            icon: LayoutDashboard, key: 'dashboard',   roles: null },
  { to: '/employees',   icon: Users,           key: 'employee',    roles: ['admin','hr_officer'] },
  { to: '/recruitment', icon: UserPlus,        key: 'recruitment', roles: ['admin','hr_officer'] },
  { to: '/performance', icon: TrendingUp,      key: 'performance', roles: null },
  { to: '/schedule',    icon: Calendar,        key: 'schedule',    roles: null },
  { to: '/analytics',   icon: BarChart2,       key: 'analytics',   roles: ['admin','hr_officer','finance_manager'] },
  { to: '/projects',    icon: FolderKanban,    key: 'projects',    roles: null },
];

const personalItems = [
  { to: '/settings', icon: Settings,   key: 'settings' },
  { to: '/help',     icon: HelpCircle, key: 'help' },
  { to: '/contact',  icon: Phone,      key: 'contact' },
  { to: '/account',  icon: UserCircle, key: 'account' },
];

const complianceItems = [
  { to: '/wps', icon: FileCheck, key: 'wps' },
  { to: '/sio', icon: Shield,    key: 'sio' },
];

export default function Sidebar({ onClose }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const link = (to, end = false) => ({ isActive }) =>
    `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <aside className="w-64 md:w-56 h-screen bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
      {/* Logo + close button (mobile) */}
      <div className="px-5 py-5 flex items-center justify-between">
        <Logo size={34} textClass="text-lg" />
        <button
          onClick={onClose}
          className="md:hidden w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-0.5" onClick={onClose}>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-1">General</p>
        {navItems.filter(({ roles }) => !roles || roles.includes(user?.role)).map(({ to, icon: Icon, key }) => (
          <NavLink key={key} to={to} end={to === '/'} className={link(to, to === '/')}>
            <Icon size={16} />
            {t(key)}
          </NavLink>
        ))}

        {['admin','hr_officer','finance_manager','wrp'].includes(user?.role) && <>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-4 pb-1">Compliance</p>
          {complianceItems.map(({ to, icon: Icon, key }) => (
            <NavLink key={key} to={to} className={link(to)}>
              <Icon size={16} />
              {t(key)}
            </NavLink>
          ))}
        </>}

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-4 pb-1">Personal</p>
        {personalItems.map(({ to, icon: Icon, key }) => (
          <NavLink key={key} to={to} className={link(to)}>
            <Icon size={16} />
            {t(key)}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400">Sign out</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 shrink-0" />
        </button>
      </div>
    </aside>
  );
}
