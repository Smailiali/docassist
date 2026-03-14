import { Menu } from 'lucide-react';

export default function Header({ onMenuToggle }) {
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
    </header>
  );
}
