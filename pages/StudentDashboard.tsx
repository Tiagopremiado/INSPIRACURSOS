import React, { useState, useEffect, useCallback } from 'react';
// Fix: Imported CourseWithProgress from the central types file.
import { User, Course, CourseWithProgress } from '../types';
import { api } from '../services/api';
import CourseCard from '../components/CourseCard';
import { PlusIcon, CheckCircleIcon } from '../components/icons';
import NotesWidget from '../components/NotesWidget';

// Fix: Removed the local definition of CourseWithProgress as it's now imported.
// This resolves type errors related to properties like 'id' not being found.

interface StudentDashboardProps {
  user: User;
  onSelectCourse: (course: Course) => void;
  onBrowseCourses: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onSelectCourse, onBrowseCourses }) => {
  const [myCourses, setMyCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const courses = await api.getStudentCoursesWithProgress(user.id);
      setMyCourses(courses);
    } catch (error) {
      console.error("Failed to fetch student courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  if (isLoading) {
    return <div className="text-center p-10">Carregando seus cursos...</div>;
  }

  const activeCourses = myCourses.filter(c => c.progress < 100);
  const completedCourses = myCourses.filter(c => c.progress >= 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Meus Cursos</h1>
        <button
            onClick={onBrowseCourses}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
            <PlusIcon className="h-5 w-5"/>
            <span>Adquirir Novos Cursos</span>
        </button>
      </div>
      {activeCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onSelectCourse}
              buttonText="Continuar Curso"
            />
          ))}
        </div>
      ) : (
         myCourses.length === 0 && (
            <div className="text-center bg-white p-10 rounded-lg shadow">
                <h2 className="text-2xl font-semibold text-gray-700">Você ainda não está matriculado em nenhum curso.</h2>
                <p className="text-gray-500 mt-2">Clique em 'Adquirir Novos Cursos' para começar a aprender hoje mesmo!</p>
            </div>
         )
      )}

      {completedCourses.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Cursos Concluídos</h2>
          <div className="bg-white p-6 rounded-lg shadow">
              <ul className="divide-y divide-gray-200">
                  {completedCourses.map(course => (
                      <li key={course.id} className="py-4 flex items-center justify-between">
                          <div className="flex items-center">
                              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-4"/>
                              <span className="text-lg font-semibold text-gray-800">{course.title}</span>
                          </div>
                          <button 
                              onClick={() => onSelectCourse(course)}
                              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
                          >
                              Revisar Conteúdo
                          </button>
                      </li>
                  ))}
              </ul>
          </div>
        </div>
      )}

      <div className="mt-12">
        <NotesWidget />
      </div>
    </div>
  );
};

export default StudentDashboard;