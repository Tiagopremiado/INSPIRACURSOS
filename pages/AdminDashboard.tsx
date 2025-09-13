import React, { useState } from 'react';
import { User } from '../types';
import CourseManagement from './admin/CourseManagement';
import StudentManagement from './admin/StudentManagement';
import OffersAndCouponsManagement from './admin/OffersAndCouponsManagement';
import CTCodeManagement from './admin/CTCodeManagement';
import AdminManagement from './admin/AdminManagement';
import StudentProgress from './admin/StudentProgress';

interface AdminDashboardProps {
  user: User;
  onCoursesUpdate: () => void;
}

type AdminTab = 'courses' | 'students' | 'student_progress' | 'offers' | 'ct_codes' | 'admins';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onCoursesUpdate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('courses');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return <CourseManagement onCoursesUpdate={onCoursesUpdate} />;
      case 'students':
        return <StudentManagement />;
      case 'student_progress':
        return <StudentProgress />;
      case 'offers':
        return <OffersAndCouponsManagement />;
      case 'ct_codes':
        return <CTCodeManagement />;
      case 'admins':
        return <AdminManagement currentUser={user} />;
      default:
        return null;
    }
  };

  const getTabClass = (tabName: AdminTab) => {
    return `px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${
      activeTab === tabName
        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
        : 'bg-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-100'
    }`;
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Painel do Programador</h1>
      <p className="text-lg text-gray-600 mb-8">Gerencie cursos, alunos, matrículas e ofertas especiais.</p>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          <button onClick={() => setActiveTab('courses')} className={getTabClass('courses')}>
            Gerenciar Cursos
          </button>
          <button onClick={() => setActiveTab('students')} className={getTabClass('students')}>
            Gerenciar Alunos
          </button>
          <button onClick={() => setActiveTab('student_progress')} className={getTabClass('student_progress')}>
            Progresso dos Alunos
          </button>
           <button onClick={() => setActiveTab('offers')} className={getTabClass('offers')}>
            Ofertas e Cupons
          </button>
          <button onClick={() => setActiveTab('ct_codes')} className={getTabClass('ct_codes')}>
            Gerenciar Códigos CT
          </button>
           <button onClick={() => setActiveTab('admins')} className={getTabClass('admins')}>
            Gerenciar Admins
          </button>
        </nav>
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;