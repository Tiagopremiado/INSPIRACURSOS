
import React from 'react';
import { User } from '../types';
import { LogoIcon } from './icons';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onNavigateToLogin: () => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigateToLogin, onNavigateHome }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={onNavigateHome}
        >
          <LogoIcon className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-800 tracking-tight">
            INSPIRA
            <span className="text-blue-600">.CURSOS</span>
          </span>
        </div>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-600">
                Olá, <span className="font-semibold">{user.name.split(' ')[0]}</span>
              </span>
              <button
                onClick={onLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
              >
                Sair
              </button>
            </>
          ) : (
            <button
              onClick={onNavigateToLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
