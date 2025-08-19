import React, { useState } from 'react';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';

interface CreateStudentFormProps {
  onSave: () => void;
  onClose: () => void;
}

const CreateStudentForm: React.FC<CreateStudentFormProps> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);
        try {
            await api.createUser({ name, email, password, phone });
            onSave();
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao criar o aluno.');
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
                <label className="block text-sm font-medium text-gray-700">Telefone (opcional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputStyle} placeholder="(XX) XXXXX-XXXX" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} required />
            </div>
            
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            
            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center w-32">
                    {isSaving ? <Spinner/> : 'Criar Aluno'}
                </button>
            </div>
        </form>
    );
};

export default CreateStudentForm;
