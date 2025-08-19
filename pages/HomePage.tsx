
import React from 'react';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';

interface HomePageProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

const HomePage: React.FC<HomePageProps> = ({ courses, onSelectCourse }) => {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Nossos Cursos
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Invista em seu futuro. Encontre o curso perfeito para impulsionar sua carreira.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} onSelect={onSelectCourse} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
