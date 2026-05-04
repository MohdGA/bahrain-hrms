import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/authStore';
import i18n from '../../i18n';
import NotificationPanel from './NotificationPanel';
import MessagesPanel from './MessagesPanel';

export default function Header({ onMenuClick }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-10 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <Menu size={18} className="text-gray-600" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm md:text-base font-semibold text-gray-800 truncate">
          Hi {user?.name?.split(' ')[0] || 'there'}, {t('welcome')}! 👋
        </p>
      </div>

      {/* Lang toggle */}
      <button onClick={toggleLang}
        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0">
        {i18n.language === 'en' ? 'عربي' : 'EN'}
      </button>

      <MessagesPanel />
      <NotificationPanel />
    </header>
  );
}
