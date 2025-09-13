import React, { useState } from 'react';
import { Course } from '../types';
import { ChevronDownIcon, DocumentTextIcon, FolderIcon } from './icons';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  buttonText?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect, buttonText = "Comprar Agora" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const hasContent = course.modules && course.modules.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      <img className="w-full h-48 object-cover" src={course.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'} alt={course.title} />
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm flex-grow">{course.description}</p>
        
        {hasContent && (
            <button 
                onClick={toggleExpansion} 
                className="w-full text-left mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between p-2 bg-blue-50 rounded-md"
                aria-expanded={isExpanded}
            >
                <span>Ver conteúdo do curso</span>
                <ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        )}

        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2">Estrutura do Curso</h4>
                <ul className="space-y-2 text-sm">
                    {course.modules.map(module => (
                        <li key={module.id}>
                            <div className="flex items-center font-semibold text-gray-800">
                                <FolderIcon className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                                <span>{module.title}</span>
                            </div>
                            <ul className="pl-7 mt-1 space-y-1">
                                {module.lessons.map(lesson => (
                                    <li key={lesson.id} className="flex items-center text-gray-600">
                                        <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                        <span>{lesson.title}</span>
                                    </li>
                                ))}
                                {module.lessons.length === 0 && (
                                     <li className="flex items-center text-gray-400 italic">
                                        <span>Nenhuma aula neste módulo.</span>
                                    </li>
                                )}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

      </div>
      
      <div className="p-6 mt-auto bg-gray-50 flex justify-between items-center">
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
  );
};

export default CourseCard;