import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import Spinner from '../components/Spinner';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await api.login(email, password);
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.message || 'Email ou senha inválidos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Bem-vindo(a) de volta!</h2>
                <p className="text-center text-gray-500 mb-6">Faça login para acessar seus cursos.</p>
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
                            placeholder="Sua senha"
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
                     <div className="mt-6 text-center text-sm text-gray-500">
                      <p>
                          Não tem uma conta?{' '}
                          <button type="button" onClick={onNavigateToSignUp} className="font-semibold text-blue-600 hover:text-blue-500">
                              Cadastre-se
                          </button>
                      </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
