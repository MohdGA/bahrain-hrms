import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/authStore';
import i18n from '../../i18n';
import NotificationPanel from './NotificationPanel';
import MessagesPanel from './MessagesPanel';

export default function Header() {
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
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-10">
      <div className="flex-1">
        <p className="text-base font-semibold text-gray-800">
          Hi {user?.name?.split(' ')[0] || 'there'}, {t('welcome')}! 👋
        </p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search something..."
          className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Lang toggle */}
      <button onClick={toggleLang}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
        {i18n.language === 'en' ? 'عربي' : 'EN'}
      </button>

      {/* Live Messages Panel */}
      <MessagesPanel />

      {/* Live Notifications Panel */}
      <NotificationPanel />
    </header>
  );
}
