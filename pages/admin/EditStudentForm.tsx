import React, { useState } from 'react';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';
import { User } from '../../types';

interface EditStudentFormProps {
  initialData: User;
  onSave: () => void;
  onClose: () => void;
}

const EditStudentForm: React.FC<EditStudentFormProps> = ({ initialData, onSave, onClose }) => {
    const [name, setName] = useState(initialData.name);
    const [phone, setPhone] = useState(initialData.phone || '');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);
        try {
            const updates: Partial<Omit<User, 'id' | 'role' | 'email'>> = { name, phone };
            if (password.trim()) {
                if (password.trim().length < 6) {
                    setError('A nova senha deve ter pelo menos 6 caracteres.');
                    setIsSaving(false);
                    return;
                }
                updates.password = password.trim();
            }
            await api.updateUser(initialData.id, updates);
            onSave();
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao atualizar o aluno.');
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
                <input type="email" value={initialData.email} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500" disabled />
                <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado.</p>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputStyle} placeholder="(XX) XXXXX-XXXX" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} placeholder="Deixe em branco para não alterar" />
                 <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres.</p>
            </div>
            
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            
            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center w-36">
                    {isSaving ? <Spinner/> : 'Salvar Alterações'}
                </button>
            </div>
        </form>
    );
};

export default EditStudentForm;
