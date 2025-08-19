import React, { useState, useEffect, useCallback } from 'react';
import { User, Course } from '../../types';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons';
import CreateStudentForm from './CreateStudentForm';
import EditStudentForm from './EditStudentForm';

const EnrollStudentForm: React.FC<{
    student: User;
    onEnrolled: () => void;
    onClose: () => void;
}> = ({ student, onEnrolled, onClose }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getCourses().then(setCourses);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedCourseId) {
            setError('Por favor, selecione um curso.');
            return;
        }
        setError('');
        setIsSaving(true);
        try {
            await api.enrollStudent(student.id, selectedCourseId);
            onEnrolled();
        } catch(err: any) {
            setError(err.message || 'Ocorreu um erro ao matricular o aluno.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p>Matriculando aluno: <span className="font-semibold">{student.name} ({student.email})</span></p>
            <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">Selecione o Curso</label>
                <select 
                    id="course" 
                    value={selectedCourseId} 
                    onChange={e => setSelectedCourseId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="" disabled>-- Escolha um curso --</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                </select>
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
             <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center w-36">
                    {isSaving ? <Spinner/> : 'Liberar Acesso'}
                </button>
            </div>
        </form>
    )
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    const data = await api.getStudents();
    setStudents(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);
  
  const handleOpenEnrollModal = (student: User) => {
    setSelectedStudent(student);
    setIsEnrollModalOpen(true);
  }
  
  const handleOpenEditModal = (student: User) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  }
  
  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno? Esta ação removerá o usuário e todas as suas matrículas.')) {
        try {
            await api.deleteUser(studentId);
            alert('Aluno excluído com sucesso.');
            fetchStudents();
        } catch (error: any) {
            alert(`Falha ao excluir aluno: ${error.message}`);
        }
    }
  }

  const handleCloseModals = () => {
    setSelectedStudent(null);
    setIsEnrollModalOpen(false);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
  }
  
  const handleSuccess = (message: string) => {
    alert(message);
    handleCloseModals();
    fetchStudents();
  }

  if (isLoading) {
    return <div className="text-center p-10">Carregando alunos...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Todos os Alunos</h2>
         <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
            <PlusIcon className="h-5 w-5"/>
            <span>Novo Aluno</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{student.name}</span>
                      {student.isCTStudent && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">CT</span>
                      )}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                    <button onClick={() => handleOpenEnrollModal(student)} title="Matricular" className="p-2 text-green-600 hover:text-green-900 rounded-full hover:bg-green-100 transition-colors">
                      <PlusIcon className="h-5 w-5"/>
                    </button>
                    <button onClick={() => handleOpenEditModal(student)} title="Editar" className="p-2 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-100 transition-colors">
                      <EditIcon className="h-5 w-5"/>
                    </button>
                     <button onClick={() => handleDeleteStudent(student.id)} title="Excluir" className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-100 transition-colors">
                      <TrashIcon className="h-5 w-5"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedStudent && (
        <Modal isOpen={isEnrollModalOpen} onClose={handleCloseModals} title="Matricular Aluno em Curso">
            <EnrollStudentForm student={selectedStudent} onEnrolled={() => handleSuccess('Aluno matriculado com sucesso!')} onClose={handleCloseModals} />
        </Modal>
      )}

      {selectedStudent && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} title="Editar Aluno">
            <EditStudentForm initialData={selectedStudent} onSave={() => handleSuccess('Aluno atualizado com sucesso!')} onClose={handleCloseModals} />
        </Modal>
      )}

      <Modal isOpen={isCreateModalOpen} onClose={handleCloseModals} title="Criar Novo Aluno">
        <CreateStudentForm onSave={() => handleSuccess('Novo aluno criado com sucesso!')} onClose={handleCloseModals} />
      </Modal>

    </div>
  );
};

export default StudentManagement;