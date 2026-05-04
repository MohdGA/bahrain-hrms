import { NavLink } from 'react-router-dom';
import Logo from '../Logo';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, UserPlus, TrendingUp, Calendar,
  BarChart2, FolderKanban, Settings, HelpCircle, Phone,
  UserCircle, FileCheck, Shield, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../store/authStore';

const navItems = [
  { to: '/',           icon: LayoutDashboard, key: 'dashboard' },
  { to: '/employees',  icon: Users,           key: 'employee' },
  { to: '/recruitment',icon: UserPlus,        key: 'recruitment' },
  { to: '/performance',icon: TrendingUp,      key: 'performance' },
  { to: '/schedule',   icon: Calendar,        key: 'schedule' },
  { to: '/analytics',  icon: BarChart2,       key: 'analytics' },
  { to: '/projects',   icon: FolderKanban,    key: 'projects' },
];

const personalItems = [
  { to: '/settings', icon: Settings,    key: 'settings' },
  { to: '/help',     icon: HelpCircle,  key: 'help' },
  { to: '/contact',  icon: Phone,       key: 'contact' },
  { to: '/account',  icon: UserCircle,  key: 'account' },
];

const complianceItems = [
  { to: '/wps',  icon: FileCheck, key: 'wps' },
  { to: '/sio',  icon: Shield,    key: 'sio' },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 shrink-0 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5">
        <Logo size={34} textClass="text-lg" />
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-1">General</p>
        {navItems.map(({ to, icon: Icon, key }) => (
          <NavLink key={key} to={to} end={to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={16} />
            {t(key)}
          </NavLink>
        ))}

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-4 pb-1">Compliance</p>
        {complianceItems.map(({ to, icon: Icon, key }) => (
          <NavLink key={key} to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={16} />
            {t(key)}
          </NavLink>
        ))}

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-4 pb-1">Personal</p>
        {personalItems.map(({ to, icon: Icon, key }) => (
          <NavLink key={key} to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={16} />
            {t(key)}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary font-semibold text-sm">
            {user?.name?.[0] || 'J'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'James Franklyn'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || 'james@company.com'}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 shrink-0" />
        </button>
      </div>
    </aside>
  );
}
