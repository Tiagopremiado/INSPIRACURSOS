import React, { useState } from 'react';
import { api } from '../services/api';
import Spinner from '../components/Spinner';

interface CTStudentLoginPageProps {
  onRegisterSuccess: () => void;
  onBack: () => void;
}

const CTStudentLoginPage: React.FC<CTStudentLoginPageProps> = ({ onRegisterSuccess, onBack }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
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
            await api.registerCTStudent({
                name,
                email,
                phone,
                password,
                accessCode
            });
            onRegisterSuccess();
        } catch (err: any) {
            setError(err.message || 'Falha no cadastro. Verifique seu código de acesso e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Acesso Aluno CT</h2>
                <p className="text-center text-gray-500 mb-6">Use seu código de acesso para criar sua conta e acessar seus cursos exclusivos.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-code">
                            Código de Acesso
                        </label>
                        <input
                            id="ct-code"
                            type="text"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            placeholder="Seu código de 6 dígitos"
                            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-name">
                            Nome Completo
                        </label>
                        <input
                            id="ct-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-email">
                            Email
                        </label>
                        <input
                            id="ct-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            required
                        />
                    </div>
                     <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-phone">
                            Telefone (WhatsApp)
                        </label>
                        <input
                            id="ct-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(XX) XXXXX-XXXX"
                            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ct-password">
                            Crie uma Senha
                        </label>
                        <input
                            id="ct-password"
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
                            {isLoading ? <Spinner /> : 'Registrar e Acessar'}
                        </button>
                    </div>
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <button type="button" onClick={onBack} className="font-semibold text-gray-600 hover:text-gray-800">
                          &larr; Voltar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CTStudentLoginPage;
