
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import { PlusIcon, TrashIcon } from '../../components/icons';
import CreateAdminForm from './CreateAdminForm';

interface AdminManagementProps {
  currentUser: User;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ currentUser }) => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
        const data = await api.getAdmins();
        setAdmins(data);
    } catch (error) {
        alert('Falha ao carregar administradores.');
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);
  
  const handleDeleteAdmin = async (adminId: string) => {
    if (adminId === currentUser.id) {
        alert('Você não pode excluir sua própria conta.');
        return;
    }
    if (window.confirm('Tem certeza que deseja excluir este administrador? Esta ação é irreversível.')) {
        try {
            await api.deleteUser(adminId);
            alert('Administrador excluído com sucesso.');
            fetchAdmins();
        } catch (error: any) {
            alert(`Falha ao excluir administrador: ${error.message}`);
        }
    }
  }

  const handleSuccess = (message: string) => {
    alert(message);
    setIsCreateModalOpen(false);
    fetchAdmins();
  }

  if (isLoading) {
    return <div className="text-center p-10">Carregando administradores...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Administradores</h2>
         <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
            <PlusIcon className="h-5 w-5"/>
            <span>Novo Admin</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map(admin => {
              const isCurrentUser = admin.id === currentUser.id;
              return (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{admin.name}</span>
                      {isCurrentUser && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Você</span>
                      )}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                     <button 
                        onClick={() => handleDeleteAdmin(admin.id)} 
                        title={isCurrentUser ? "Você não pode se excluir" : "Excluir"}
                        disabled={isCurrentUser}
                        className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-100 transition-colors disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                      <TrashIcon className="h-5 w-5"/>
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Criar Novo Administrador">
        <CreateAdminForm onSave={() => handleSuccess('Novo administrador criado com sucesso!')} onClose={() => setIsCreateModalOpen(false)} />
      </Modal>

    </div>
  );
};

export default AdminManagement;
