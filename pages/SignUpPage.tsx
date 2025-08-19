

import React, { useState } from 'react';
import { api } from '../services/api';
import Spinner from '../components/Spinner';

interface SignUpPageProps {
  onSignUpSuccess: () => void;
  onNavigateToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUpSuccess, onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await api.createUser({ name, email, password, phone });
            onSignUpSuccess();
        } catch (err: any) {
            setError(err.message || 'Falha no cadastro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Crie sua conta</h2>
                <p className="text-center text-gray-500 mb-6">É rápido e fácil.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Nome Completo
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email-signup">
                            Email
                        </label>
                        <input
                            id="email-signup"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            required
                        />
                    </div>
                     <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone-signup">
                            Telefone (WhatsApp)
                        </label>
                        <input
                            id="phone-signup"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(XX) XXXXX-XXXX"
                            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password-signup">
                            Senha
                        </label>
                        <input
                            id="password-signup"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Pelo menos 6 caracteres"
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
                            {isLoading ? <Spinner /> : 'Cadastrar'}
                        </button>
                    </div>
                    <div className="mt-6 text-center text-sm text-gray-500">
                      <p>
                          Já tem uma conta?{' '}
                          <button type="button" onClick={onNavigateToLogin} className="font-semibold text-blue-600 hover:text-blue-500">
                              Faça Login
                          </button>
                      </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;