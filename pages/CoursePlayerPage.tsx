import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Course, Module, Lesson, Quiz } from '../types';
import { api } from '../services/api';
import { ChevronDownIcon, PaperclipIcon, CheckCircleIcon } from '../components/icons';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

interface CoursePlayerPageProps {
  user: User;
  course: Course;
  onBack: () => void;
  onCourseComplete: (course: Course, performance: number) => void;
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

const QuizModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  courseId: string;
  userId: string;
  onQuizPass: () => void;
}> = ({ isOpen, onClose, lesson, courseId, userId, onQuizPass }) => {
    const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; passed: boolean; correctAnswers: { [qId: string]: number } } | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setAnswers({});
            setResult(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);
    
    if (!lesson.quiz) return null;

    const handleAnswerChange = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const quizResult = await api.submitQuiz(userId, courseId, lesson.id, answers);
            setResult(quizResult);
            if (quizResult.passed) {
                onQuizPass();
            }
        } catch (error) {
            console.error(error);
            alert('Falha ao enviar a prova. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const allQuestionsAnswered = lesson.quiz.questions.length === Object.keys(answers).length;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Prova: ${lesson.title}`}>
            {!result ? (
                <div>
                    {lesson.quiz.questions.map((q, qIndex) => (
                        <div key={q.id} className="mb-6 pb-4 border-b last:border-b-0">
                            <p className="font-semibold text-lg">{qIndex + 1}. {q.text}</p>
                            <div className="mt-3 space-y-2">
                                {q.options.map((option, oIndex) => (
                                    <label key={oIndex} className="flex items-center p-3 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                                        <input
                                            type="radio"
                                            name={q.id}
                                            checked={answers[q.id] === oIndex}
                                            onChange={() => handleAnswerChange(q.id, oIndex)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="ml-3 text-gray-800">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSubmit} disabled={isSubmitting || !allQuestionsAnswered} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center w-48">
                            {isSubmitting ? <Spinner /> : 'Finalizar e Corrigir'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <h3 className="text-3xl font-bold mb-3">Resultado</h3>
                    {result.passed ? (
                        <div className="text-green-600">
                            <CheckCircleIcon className="h-16 w-16 mx-auto" />
                            <p className="text-2xl mt-2">Parabéns, você foi aprovado!</p>
                        </div>
                    ) : (
                        <div className="text-red-600">
                             <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-2xl mt-2">Não foi desta vez.</p>
                        </div>
                    )}
                    <p className="text-xl text-gray-700 mt-4">Sua pontuação: <span className="font-bold">{result.score.toFixed(0)}%</span></p>
                    <p className="text-gray-500">A pontuação mínima para aprovação é 70%.</p>
                    
                    {!result.passed && <p className="mt-4 font-semibold text-gray-800">Por favor, revise o conteúdo da aula e tente novamente.</p>}

                    <div className="mt-8">
                        <button onClick={onClose} className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors duration-300 ${result.passed ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                            {result.passed ? 'Continuar para Próxima Aula' : 'Revisar Aula'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    )
};


const CoursePlayerPage: React.FC<CoursePlayerPageProps> = ({ user, course, onBack, onCourseComplete }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    course.modules[0]?.lessons[0] || null
  );
  const [openModules, setOpenModules] = useState<Set<string>>(new Set([course.modules[0]?.id].filter(Boolean)));
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [performancePercentage, setPerformancePercentage] = useState(0);

  const fetchProgress = useCallback(async () => {
    try {
      const completedIds = await api.getStudentProgress(user.id, course.id);
      setCompletedLessons(new Set(completedIds));
    } catch (error) {
      console.error("Failed to fetch student progress:", error);
    }
  }, [user.id, course.id]);

  const fetchPerformance = useCallback(async () => {
    try {
        const { averageScore } = await api.getStudentPerformance(user.id, course.id);
        setPerformancePercentage(averageScore);
    } catch (error) {
        console.error("Failed to fetch student performance:", error);
    }
  }, [user.id, course.id]);

  useEffect(() => {
    fetchProgress();
    fetchPerformance();
  }, [fetchProgress, fetchPerformance]);

  const allLessonsFlat = useMemo(() => course.modules.flatMap(m => m.lessons), [course.modules]);
  
  const totalLessons = allLessonsFlat.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;

  useEffect(() => {
    // Using a small buffer to avoid floating point issues and repeated calls
    if (progressPercentage >= 100 && totalLessons > 0) {
        onCourseComplete(course, performancePercentage);
    }
  }, [progressPercentage, onCourseComplete, course, performancePercentage, totalLessons]);


  const advanceToNextLesson = () => {
      if (!activeLesson) return;
      const currentIndex = allLessonsFlat.findIndex(l => l.id === activeLesson.id);
      if (currentIndex !== -1 && currentIndex < allLessonsFlat.length - 1) {
        const nextLesson = allLessonsFlat[currentIndex + 1];
        setActiveLesson(nextLesson);
      }
  }


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

  const handleToggleComplete = async () => {
    if (!activeLesson || activeLesson.quiz) return;
    setIsUpdatingProgress(true);
    try {
      const updatedCompletedIds = await api.toggleLessonCompletion(user.id, course.id, activeLesson.id);
      setCompletedLessons(new Set(updatedCompletedIds));

      if (new Set(updatedCompletedIds).has(activeLesson.id)) {
        advanceToNextLesson();
      }
    } catch (error: any) {
      console.error("Failed to update lesson completion:", error);
      alert(`Não foi possível atualizar o progresso: ${error.message}`);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleQuizPass = () => {
      fetchProgress();
      fetchPerformance();
  }
  
  const handleCloseQuizModal = () => {
      setIsQuizModalOpen(false);
      // If the lesson is now completed (meaning the quiz was passed), advance
      if (activeLesson && completedLessons.has(activeLesson.id)) {
          advanceToNextLesson();
      }
  }

  const embedUrl = activeLesson?.videoUrl ? getYouTubeEmbedUrl(activeLesson.videoUrl) : null;
  const isLessonCompleted = activeLesson ? completedLessons.has(activeLesson.id) : false;

  const getActionButton = () => {
      if (!activeLesson) return null;

      if(activeLesson.quiz) {
          if (isLessonCompleted) {
              return (
                   <button disabled className="w-full py-3 px-6 rounded-lg font-bold text-lg flex items-center justify-center bg-gray-400 text-white cursor-not-allowed">
                      <CheckCircleIcon className="h-6 w-6 mr-2"/>
                      Prova Concluída
                  </button>
              )
          }
          return (
               <button onClick={() => setIsQuizModalOpen(true)} className="w-full py-3 px-6 rounded-lg font-bold text-lg flex items-center justify-center transition-colors duration-300 bg-blue-600 text-white hover:bg-blue-700">
                  Iniciar Prova
              </button>
          )
      }

      // No quiz, standard completion button
       return (
           <button
              onClick={handleToggleComplete}
              disabled={isUpdatingProgress}
              className={`w-full py-3 px-6 rounded-lg font-bold text-lg flex items-center justify-center transition-colors duration-300 ${isLessonCompleted ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
              {isLessonCompleted ? (
                  <>
                      <CheckCircleIcon className="h-6 w-6 mr-2"/>
                      Aula Concluída (Desmarcar)
                  </>
              ) : 'Marcar como Concluída'}
          </button>
       )
  }

  return (
    <div>
      <button onClick={onBack} className="text-blue-600 hover:underline mb-6 font-semibold">&larr; Voltar para Meus Cursos</button>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-3/4 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 sm:p-8 flex-grow">
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
           {activeLesson && (
                <div className="mt-auto p-6 bg-gray-50 border-t">
                    {getActionButton()}
                </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 px-2">Conteúdo do Curso</h2>
            <div className="px-2 mb-4">
                <span className="text-sm font-semibold text-gray-600">Progresso: {progressPercentage.toFixed(0)}%</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
            <div className="px-2 mb-4">
                <span className="text-sm font-semibold text-gray-600">Aproveitamento: {performancePercentage.toFixed(0)}%</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${performancePercentage}%` }}></div>
                </div>
            </div>

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
                  <ul className="py-2">
                    {moduleItem.lessons.map((lesson) => {
                      const isCompleted = completedLessons.has(lesson.id);
                      return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full text-left p-2.5 rounded-md transition-colors flex items-center space-x-3 ${activeLesson?.id === lesson.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {isCompleted ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0"/>
                          ) : (
                            <div className="w-5 h-5 flex-shrink-0 border-2 border-gray-300 rounded-full"></div>
                          )}
                          <span className={`${isCompleted && activeLesson?.id !== lesson.id ? 'text-gray-400 line-through' : ''}`}>{lesson.title}</span>
                        </button>
                      </li>
                    )})}
                    {moduleItem.lessons.length === 0 && <li className="text-xs text-gray-400 p-2">Nenhuma aula neste módulo.</li>}
                  </ul>
                )}
              </div>
            ))}
             {course.modules.length === 0 && <p className="text-sm text-gray-500 p-3">Nenhum módulo cadastrado.</p>}
          </div>
        </div>
      </div>
      {activeLesson && activeLesson.quiz && (
        <QuizModal
            isOpen={isQuizModalOpen}
            onClose={handleCloseQuizModal}
            lesson={activeLesson}
            courseId={course.id}
            userId={user.id}
            onQuizPass={handleQuizPass}
        />
      )}
    </div>
  );
};

export default CoursePlayerPage;