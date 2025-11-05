import React from 'react';

type View = 'analyzer' | 'monitor' | 'checklist' | 'history';

interface HeaderProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    const baseClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-700 focus:ring-brand-gold";
    const activeClasses = "bg-brand-blue text-white";
    const inactiveClasses = "text-neutral-300 hover:bg-neutral-600 hover:text-white";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {label}
        </button>
    );
}


export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  return (
    <header className="bg-neutral-700 shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
                <h1 className="text-3xl font-bold text-white">
                AI Bid Analyzer for <span className="text-brand-gold">Satewave</span>
                </h1>
                <p className="text-neutral-300 mt-1 text-sm">
                Your intelligent assistant for procurement excellence.
                </p>
            </div>
            <nav className="mt-4 sm:mt-0 flex space-x-2 bg-neutral-800/50 p-1 rounded-lg">
                <NavButton label="Bid Analyzer" isActive={activeView === 'analyzer'} onClick={() => setActiveView('analyzer')} />
                <NavButton label="Tender Monitor" isActive={activeView === 'monitor'} onClick={() => setActiveView('monitor')} />
                <NavButton label="Checklist Gen" isActive={activeView === 'checklist'} onClick={() => setActiveView('checklist')} />
                <NavButton label="History" isActive={activeView === 'history'} onClick={() => setActiveView('history')} />
            </nav>
        </div>
      </div>
    </header>
  );
};
