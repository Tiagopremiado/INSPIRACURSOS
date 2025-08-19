
import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  buttonText?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect, buttonText = "Comprar Agora" }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      <img className="w-full h-48 object-cover" src={course.imageUrl} alt={course.title} />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm flex-grow">{course.description}</p>
        <div className="mt-6 flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            R$ {course.price.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={() => onSelect(course)}
            className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
