import React, { useState, useEffect, useCallback } from 'react';
import { User, Course } from '../types';
import { api } from '../services/api';
import CourseCard from '../components/CourseCard';
import { PlusIcon } from '../components/icons';
import NotesWidget from '../components/NotesWidget';

interface StudentDashboardProps {
  user: User;
  onSelectCourse: (course: Course) => void;
  onBrowseCourses: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onSelectCourse, onBrowseCourses }) => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const courses = await api.getStudentCourses(user.id);
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
      {myCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onSelectCourse}
              buttonText="Acessar Curso"
            />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-10 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-700">Você ainda não está matriculado em nenhum curso.</h2>
          <p className="text-gray-500 mt-2">Clique em 'Adquirir Novos Cursos' para começar a aprender hoje mesmo!</p>
        </div>
      )}
      <div className="mt-12">
        <NotesWidget />
      </div>
    </div>
  );
};

export default StudentDashboard;
