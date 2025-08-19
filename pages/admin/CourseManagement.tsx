import React, { useState, useEffect, useCallback } from 'react';
import { Course } from '../../types';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { EditIcon, TrashIcon, PlusIcon } from '../../components/icons';
import CourseContentManager from './CourseContentManager';

interface CourseManagementProps {
  onCoursesUpdate: () => void;
}

const CourseForm: React.FC<{
  initialData?: Course | null;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}> = ({ initialData, onSave, onClose }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price || 0);
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || 'https://picsum.photos/seed/newcourse/600/400');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ title, description, price: Number(price), imageUrl });
        setIsSaving(false);
    };

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Título do Curso</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputStyle} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className={inputStyle} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={inputStyle} required />
            </div>
            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center w-24">
                    {isSaving ? <Spinner/> : 'Salvar'}
                </button>
            </div>
        </form>
    );
};


const CourseManagement: React.FC<CourseManagementProps> = ({ onCoursesUpdate }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [managingContentCourse, setManagingContentCourse] = useState<Course | null>(null);


  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    const data = await api.getCourses();
    setCourses(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenDetailsModal = (course?: Course) => {
    setEditingCourse(course || null);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setEditingCourse(null);
  };
  
  const handleOpenContentModal = (course: Course) => {
    setManagingContentCourse(course);
    setIsContentModalOpen(true);
  }

  const handleCloseContentModal = () => {
    setIsContentModalOpen(false);
    setManagingContentCourse(null);
    fetchCourses(); // Refetch courses as content might have changed (e.g., module count)
    onCoursesUpdate();
  }

  const handleSaveCourse = async (data: any) => {
    if (editingCourse) {
      await api.updateCourse(editingCourse.id, data);
    } else {
      await api.createCourse(data);
    }
    await fetchCourses();
    onCoursesUpdate(); // Notify parent
    handleCloseDetailsModal();
  };
  
  const handleDeleteCourse = async (courseId: string) => {
    if(window.confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita e removerá todas as matrículas associadas.')) {
        await api.deleteCourse(courseId);
        await fetchCourses();
        onCoursesUpdate();
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Carregando cursos...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Todos os Cursos</h2>
        <button onClick={() => handleOpenDetailsModal()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
            <PlusIcon className="h-5 w-5"/>
            <span>Novo Curso</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulos</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map(course => (
              <tr key={course.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">R$ {course.price.toFixed(2).replace('.', ',')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.modules.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleOpenContentModal(course)} className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200">Gerenciar Conteúdo</button>
                  <button onClick={() => handleOpenDetailsModal(course)} className="p-1 text-blue-600 hover:text-blue-900"><EditIcon className="h-5 w-5"/></button>
                  <button onClick={() => handleDeleteCourse(course.id)} className="p-1 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} title={editingCourse ? "Editar Curso" : "Criar Novo Curso"}>
        <CourseForm 
            initialData={editingCourse}
            onSave={handleSaveCourse}
            onClose={handleCloseDetailsModal}
        />
      </Modal>

      {managingContentCourse && (
        <CourseContentManager
          course={managingContentCourse}
          isOpen={isContentModalOpen}
          onClose={handleCloseContentModal}
        />
      )}
    </div>
  );
};

export default CourseManagement;