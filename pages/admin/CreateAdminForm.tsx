
import React, { useState } from 'react';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';

interface CreateAdminFormProps {
  onSave: () => void;
  onClose: () => void;
}

const CreateAdminForm: React.FC<CreateAdminFormProps> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        setIsSaving(true);
        try {
            await api.createAdmin({ name, email, password });
            onSave();
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao criar o administrador.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} required placeholder="Mínimo de 6 caracteres" />
            </div>
            
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            
            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center w-36">
                    {isSaving ? <Spinner/> : 'Criar Admin'}
                </button>
            </div>
        </form>
    );
};

export default CreateAdminForm;
