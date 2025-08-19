
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import Spinner from '../components/Spinner';

interface CTStudentLoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToMainLogin: () => void;
}

const CTStudentLoginPage: React.FC<CTStudentLoginPageProps> = ({ onLoginSuccess, onNavigateToMainLogin }) => {
  const [formType, setFormType] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Shared state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register-only state
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await api.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    if (accessCode.length !== 6 || !/^\d{6}$/.test(accessCode)) {
        setError('O código de acesso deve conter exatamente 6 dígitos numéricos.');
        return;
    }

    setIsLoading(true);
    try {
      await api.registerCTStudent({ name, email, password, accessCode, phone: '' });
      alert('Cadastro realizado com sucesso! Faça o login para acessar sua conta.');
      // Reset fields and switch to login tab
      setName('');
      setEmail('');
      setPassword('');
      setAccessCode('');
      setFormType('LOGIN');
    } catch (err: any) {
      setError(err.message || 'Falha no cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = "shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400";
  
  const getTabClass = (tabName: 'LOGIN' | 'REGISTER') => {
    return `w-1/2 py-3 text-center font-semibold border-b-4 transition-colors ${
        formType === tabName
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-800'
    }`;
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">LOGIN DOS ALUNOS CT</h2>
        
        <div className="flex mb-6 border-b border-gray-200">
            <button onClick={() => setFormType('LOGIN')} className={getTabClass('LOGIN')}>
                Acessar Conta
            </button>
            <button onClick={() => setFormType('REGISTER')} className={getTabClass('REGISTER')}>
                Registrar com Código
            </button>
        </div>
        
        {formType === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-email">Email</label>
                    <input id="ct-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className={inputStyle} required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-password">Senha</label>
                    <input id="ct-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className={inputStyle} required />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full flex justify-center items-center transition-colors duration-300" disabled={isLoading}>
                        {isLoading ? <Spinner /> : 'Entrar'}
                    </button>
                </div>
            </form>
        )}

        {formType === 'REGISTER' && (
             <form onSubmit={handleRegisterSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-name">Nome Completo</label>
                    <input id="ct-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className={inputStyle} required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-email-reg">Email</label>
                    <input id="ct-email-reg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className={inputStyle} required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-password-reg">Senha</label>
                    <input id="ct-password-reg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Pelo menos 6 caracteres" className={inputStyle} required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-access-code">Código de Acesso</label>
                    <input id="ct-access-code" type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="Código de 6 dígitos" className={inputStyle} maxLength={6} required />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full flex justify-center items-center transition-colors duration-300" disabled={isLoading}>
                        {isLoading ? <Spinner /> : 'Registrar'}
                    </button>
                </div>
            </form>
        )}

        <div className="mt-8 text-center text-sm">
            <button onClick={onNavigateToMainLogin} className="font-medium text-blue-600 hover:text-blue-500">
                &laquo; Voltar para o login principal
            </button>
        </div>

      </div>
    </div>
  );
};

export default CTStudentLoginPage;
