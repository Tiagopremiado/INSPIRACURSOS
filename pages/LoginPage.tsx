import React, { useState } from 'react';
import { api } from '../services/api';
import Spinner from '../components/Spinner';

interface LoginPageProps {
  onLoginSuccess: () => void; // A navegação agora é gerenciada pelo listener do App.tsx
  onNavigateToSignUp: () => void;
  onNavigateToCTLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToSignUp, onNavigateToCTLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.login(email, password);
      // onLoginSuccess é chamado, mas a mudança de estado global agora é via onAuthStateChange
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappSupportLink = "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20esqueci%20minha%20senha%20e%20preciso%20de%20ajuda%20para%20recuperar%20o%20acesso.";

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Acesse sua conta</h2>
        <p className="text-center text-gray-500 mb-6">Bem-vindo de volta!</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 mb-3 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full flex justify-center items-center transition-colors duration-300"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : 'Entrar'}
            </button>
          </div>
           <div className="text-center text-sm">
            <a href={whatsappSupportLink} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500">
                Esqueceu a senha?
            </a>
          </div>
           <div className="mt-6 text-center text-sm text-gray-500">
            <p>
                Não tem uma conta?{' '}
                <button type="button" onClick={onNavigateToSignUp} className="font-semibold text-blue-600 hover:text-blue-500">
                    Cadastre-se
                </button>
            </p>
          </div>
          
          <div className="my-6 border-t border-gray-200"></div>

          <div className="text-center">
            <button
              type="button"
              onClick={onNavigateToCTLogin}
              className="w-full text-center py-3 px-4 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sou aluno CT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
