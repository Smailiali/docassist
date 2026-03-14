import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';

export default function Header({ onMenuToggle, user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 shrink-0 gap-3">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
      <span className="text-[#2E75B6] font-bold text-lg">DocAssist</span>

      {user && (
        <div ref={ref} className="ml-auto relative flex items-center">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2E75B6] flex items-center justify-center text-white text-sm font-medium">
                {user.display_name?.[0] ?? user.email?.[0] ?? '?'}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user.display_name}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <LogOut size={14} className="text-gray-400" />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
