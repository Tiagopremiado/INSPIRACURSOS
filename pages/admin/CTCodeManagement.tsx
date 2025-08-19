import React, { useState, useEffect, useCallback } from 'react';
import { CTAccessCodeWithUserName } from '../../types';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';
import { PlusIcon, TrashIcon } from '../../components/icons';

const CTCodeManagement: React.FC = () => {
    const [codes, setCodes] = useState<CTAccessCodeWithUserName[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchCodes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getCTAccessCodes();
            setCodes(data);
        } catch (error) {
            console.error("Failed to fetch CT codes:", error);
            alert('Falha ao carregar códigos.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    const handleGenerateCode = async () => {
        setIsGenerating(true);
        try {
            await api.generateCTAccessCode();
            await fetchCodes();
        } catch (error) {
            alert('Falha ao gerar novo código.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleToggleStatus = async (code: CTAccessCodeWithUserName) => {
        const action = code.isUsed ? 'Reativar' : 'Revogar';
        const newStatus = !code.isUsed;
        if (window.confirm(`Tem certeza que deseja ${action.toLowerCase()} este código?`)) {
            try {
                await api.updateCTAccessCodeStatus(code.id, newStatus);
                await fetchCodes();
            } catch (error) {
                alert(`Falha ao ${action.toLowerCase()} o código.`);
            }
        }
    };

    const handleDeleteCode = async (codeId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este código permanentemente?')) {
            try {
                await api.deleteCTAccessCode(codeId);
                await fetchCodes();
            } catch (error) {
                alert('Falha ao excluir o código.');
            }
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Carregando códigos de acesso...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Códigos de Acesso CT</h2>
                <button
                    onClick={handleGenerateCode}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 w-44 disabled:bg-blue-400"
                >
                    {isGenerating ? <Spinner /> : <><PlusIcon className="h-5 w-5" /><span>Gerar Novo Código</span></>}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Utilizado Por</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {codes.map(code => (
                            <tr key={code.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-mono font-bold text-gray-900 tracking-widest">{code.code}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        code.isUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {code.isUsed ? 'Utilizado' : 'Disponível'}
                                    </span>
                                    {code.isUsed && code.usedByUserName && (
                                        <div className="text-xs text-gray-500 mt-1">{code.usedByUserName}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                     <button
                                        onClick={() => handleToggleStatus(code)}
                                        className={`px-3 py-1 text-sm rounded-full ${
                                            code.isUsed
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                        }`}
                                    >
                                        {code.isUsed ? 'Reativar' : 'Revogar'}
                                    </button>
                                    <button onClick={() => handleDeleteCode(code.id)} className="p-1 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {codes.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Nenhum código de acesso encontrado.</p>
                        <p className="text-sm">Clique em "Gerar Novo Código" para criar o primeiro.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CTCodeManagement;