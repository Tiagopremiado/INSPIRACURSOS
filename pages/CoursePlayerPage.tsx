import React, { useState } from 'react';
import { User, Course, Module, Lesson } from '../types';
import { ChevronDownIcon, PaperclipIcon } from '../components/icons';

interface CoursePlayerPageProps {
  user: User;
  course: Course;
  onBack: () => void;
}

const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
        let videoId: string | null = null;
        if (url.includes('youtu.be/')) {
            videoId = new URL(url.replace('youtu.be/', 'www.youtube.com/watch?v=')).pathname.split('/').pop() || null;
        } else if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v');
        }

        if (videoId) {
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url; // Fallback for general video urls
    } catch (e) {
        return url; // fallback if URL is not standard
    }
};


const CoursePlayerPage: React.FC<CoursePlayerPageProps> = ({ user, course, onBack }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    course.modules[0]?.lessons[0] || null
  );
  const [openModules, setOpenModules] = useState<Set<string>>(new Set([course.modules[0]?.id].filter(Boolean)));

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };
  
  const embedUrl = activeLesson?.videoUrl ? getYouTubeEmbedUrl(activeLesson.videoUrl) : null;

  return (
    <div>
      <button onClick={onBack} className="text-blue-600 hover:underline mb-6 font-semibold">&larr; Voltar para Meus Cursos</button>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-3/4 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{activeLesson?.title || 'Selecione uma aula'}</h1>
            <p className="text-sm text-gray-500 mb-6">Curso: {course.title}</p>
            
            {activeLesson ? (
              <div>
                {embedUrl && (
                  <div className="mb-6 bg-black rounded-lg overflow-hidden" style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
                    <iframe 
                      src={embedUrl}
                      title={activeLesson.title}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                    ></iframe>
                  </div>
                )}
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />

                {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Materiais para Download</h3>
                    <ul className="space-y-3">
                      {activeLesson.attachments.map((attachment, index) => (
                        <li key={index}>
                          <a 
                            href={attachment.url} 
                            download 
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center p-3 bg-blue-50 rounded-md transition-colors"
                          >
                            <PaperclipIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">{attachment.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
                <div className="text-center p-10">
                  <h2 className="text-2xl font-semibold">Bem-vindo(a), {user.name.split(' ')[0]}!</h2>
                  <p className="mt-2 text-gray-600">Selecione uma aula na barra lateral para começar a aprender.</p>
                </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 px-2">Conteúdo do Curso</h2>
            {course.modules.map((moduleItem) => (
              <div key={moduleItem.id} className="border-b last:border-b-0">
                <button
                  onClick={() => toggleModule(moduleItem.id)}
                  className="w-full flex justify-between items-center p-3 text-left font-semibold text-gray-700 hover:bg-gray-100"
                >
                  <span>{moduleItem.title}</span>
                  <ChevronDownIcon className={`h-5 w-5 transition-transform ${openModules.has(moduleItem.id) ? 'rotate-180' : ''}`} />
                </button>
                {openModules.has(moduleItem.id) && (
                  <ul className="pl-4 py-2">
                    {moduleItem.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <button
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full text-left p-2 rounded-md transition-colors ${activeLesson?.id === lesson.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {lesson.title}
                        </button>
                      </li>
                    ))}
                    {moduleItem.lessons.length === 0 && <li className="text-xs text-gray-400 p-2">Nenhuma aula neste módulo.</li>}
                  </ul>
                )}
              </div>
            ))}
             {course.modules.length === 0 && <p className="text-sm text-gray-500 p-3">Nenhum módulo cadastrado.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
