import React, { useState, useEffect, useCallback } from 'react';
import { Course, Module, Lesson, Quiz, Question } from '../../types';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, TrashIcon, ChevronDownIcon, PaperclipIcon, CheckCircleIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';

// --- Quiz Editor ---
const QuizEditor: React.FC<{
    quiz: Quiz | undefined;
    onQuizChange: (quiz: Quiz) => void;
}> = ({ quiz, onQuizChange }) => {
    const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);

    const handleQuestionTextChange = (qIndex: number, text: string) => {
        const updated = [...questions];
        updated[qIndex].text = text;
        setQuestions(updated);
        onQuizChange({ questions: updated });
    };

    const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = text;
        setQuestions(updated);
        onQuizChange({ questions: updated });
    };
    
    const handleCorrectOptionChange = (qIndex: number, oIndex: number) => {
        const updated = [...questions];
        updated[qIndex].correctOptionIndex = oIndex;
        setQuestions(updated);
        onQuizChange({ questions: updated });
    }

    const addQuestion = () => {
        const newQuestion: Question = {
            id: `q-${Date.now()}`,
            text: '',
            options: ['', ''],
            correctOptionIndex: 0
        };
        const updated = [...questions, newQuestion];
        setQuestions(updated);
        onQuizChange({ questions: updated });
    };
    
    const removeQuestion = (qIndex: number) => {
        const updated = questions.filter((_, index) => index !== qIndex);
        setQuestions(updated);
        onQuizChange({ questions: updated });
    };

    const addOption = (qIndex: number) => {
        const updated = [...questions];
        updated[qIndex].options.push('');
        setQuestions(updated);
        onQuizChange({ questions: updated });
    };
    
    const removeOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions];
        if (updated[qIndex].options.length <= 2) {
            alert('A questão deve ter no mínimo 2 opções.');
            return;
        }
        updated[qIndex].options = updated[qIndex].options.filter((_, index) => index !== oIndex);
        // Adjust correct option index if it was the removed one or after it
        if(updated[qIndex].correctOptionIndex === oIndex){
            updated[qIndex].correctOptionIndex = 0;
        } else if (updated[qIndex].correctOptionIndex > oIndex) {
            updated[qIndex].correctOptionIndex -= 1;
        }
        setQuestions(updated);
        onQuizChange({ questions: updated });
    }

    return (
        <div className="space-y-4 pt-3 mt-3 border-t">
            <h4 className="font-bold text-lg text-gray-800">Editor de Prova</h4>
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-3 bg-gray-100 border rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-700">Questão {qIndex + 1}</label>
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4"/></button>
                    </div>
                    <textarea value={q.text} onChange={e => handleQuestionTextChange(qIndex, e.target.value)} placeholder="Digite o enunciado da questão" rows={2} className="w-full text-sm p-2 border rounded-md"/>
                    <div className="space-y-2 pl-4">
                        {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                                <input type="radio" name={`correct-opt-${qIndex}`} checked={q.correctOptionIndex === oIndex} onChange={() => handleCorrectOptionChange(qIndex, oIndex)} title="Marcar como correta"/>
                                <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Opção ${oIndex+1}`} className="flex-grow w-full text-sm p-1.5 border rounded-md"/>
                                <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={() => addOption(qIndex)} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300">Adicionar Opção</button>
                </div>
            ))}
            <button type="button" onClick={addQuestion} className="w-full text-sm bg-blue-100 text-blue-800 p-2 rounded hover:bg-blue-200 font-semibold">Adicionar Questão</button>
        </div>
    )
}


// --- Lesson Form ---
const LessonForm: React.FC<{
    courseId: string;
    moduleId: string;
    lesson?: Lesson | null;
    onSave: () => void;
    onClose: () => void;
}> = ({ courseId, moduleId, lesson, onSave, onClose }) => {
    const [title, setTitle] = useState(lesson?.title || '');
    const [content, setContent] = useState(lesson?.content || '');
    const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || '');
    const [attachments, setAttachments] = useState(lesson?.attachments || []);
    const [quiz, setQuiz] = useState<Quiz | undefined>(lesson?.quiz);
    const [isEditingQuiz, setIsEditingQuiz] = useState(false);
    
    const [newAttachmentName, setNewAttachmentName] = useState('');
    const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddAttachment = () => {
        if (newAttachmentName && newAttachmentUrl) {
            setAttachments([...attachments, { name: newAttachmentName, url: newAttachmentUrl }]);
            setNewAttachmentName('');
            setNewAttachmentUrl('');
        }
    };

    const handleRemoveAttachment = (indexToRemove: number) => {
        setAttachments(attachments.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const lessonData = { title, content, videoUrl, attachments, quiz };
        if (lesson) {
            await api.updateLesson(courseId, moduleId, lesson.id, lessonData);
        } else {
            await api.addLesson(courseId, moduleId, lessonData);
        }
        setIsSaving(false);
        onSave();
    };
    
    const handleQuizChange = (newQuiz: Quiz) => {
        // Remove quiz if it has no questions
        if(newQuiz.questions.length === 0) {
            setQuiz(undefined);
            setIsEditingQuiz(false);
        } else {
            setQuiz(newQuiz);
        }
    }

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";
    const attachmentInputStyle = "mt-1 block w-full px-2 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg mt-2 border border-gray-200">
            <h4 className="font-bold text-lg text-gray-800">{lesson ? 'Editar Aula' : 'Adicionar Nova Aula'}</h4>
            <div>
                <label className="block text-sm font-medium text-gray-700">Título da Aula</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Conteúdo (HTML permitido)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} className={inputStyle} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">URL do Vídeo (YouTube)</label>
                <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={`${inputStyle} placeholder-gray-500`} />
            </div>
            
            <div className="space-y-3">
                 <label className="block text-sm font-medium text-gray-700">Anexos</label>
                 <div className="space-y-2">
                     {attachments.map((att, index) => (
                         <div key={index} className="flex items-center justify-between bg-white p-2 border rounded-md">
                            <div className="flex items-center">
                               <PaperclipIcon className="h-4 w-4 mr-2 text-gray-500" />
                               <span className="text-sm font-medium text-gray-800">{att.name}</span>
                            </div>
                           <button type="button" onClick={() => handleRemoveAttachment(index)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4"/></button>
                         </div>
                     ))}
                 </div>
                 <div className="flex gap-2 items-end p-2 bg-white border rounded-md">
                    <div className="flex-grow">
                        <label className="text-xs text-gray-600">Nome do Anexo</label>
                        <input type="text" value={newAttachmentName} onChange={e => setNewAttachmentName(e.target.value)} placeholder="Ex: Material de Apoio" className={attachmentInputStyle}/>
                    </div>
                    <div className="flex-grow">
                        <label className="text-xs text-gray-600">URL do Arquivo</label>
                        <input type="text" value={newAttachmentUrl} onChange={e => setNewAttachmentUrl(e.target.value)} placeholder="https://..." className={attachmentInputStyle}/>
                    </div>
                    <button type="button" onClick={handleAddAttachment} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 text-sm font-semibold">Adicionar</button>
                 </div>
            </div>

            <div>
                <button type="button" onClick={() => setIsEditingQuiz(!isEditingQuiz)} className="w-full mt-2 bg-yellow-100 text-yellow-800 text-sm px-3 py-2 rounded-md hover:bg-yellow-200 flex items-center justify-center space-x-2">
                    <span>{isEditingQuiz ? 'Fechar Editor de Prova' : 'Gerenciar Prova'} ({quiz?.questions.length || 0} questões)</span>
                </button>
                {isEditingQuiz && <QuizEditor quiz={quiz} onQuizChange={handleQuizChange} />}
            </div>

            <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-28 flex justify-center">
                    {isSaving ? <Spinner /> : 'Salvar Aula'}
                </button>
            </div>
        </form>
    );
};


// --- Main Content Manager ---
const CourseContentManager: React.FC<{
    course: Course;
    isOpen: boolean;
    onClose: () => void;
}> = ({ course: initialCourse, isOpen, onClose }) => {
    const [course, setCourse] = useState<Course>(initialCourse);
    const [isLoading, setIsLoading] = useState(false);
    const [openModules, setOpenModules] = useState<Set<string>>(new Set());
    
    const [editingModule, setEditingModule] = useState<{ id: string; title: string } | null>(null);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    const [editingLessonInfo, setEditingLessonInfo] = useState<{moduleId: string, lesson: Lesson | null} | null>(null);

    const refreshCourse = useCallback(async () => {
        setIsLoading(true);
        const updatedCourse = await api.getCourse(initialCourse.id);
        setCourse(updatedCourse);
        setIsLoading(false);
    }, [initialCourse.id]);

    useEffect(() => {
        if(isOpen) {
          setCourse(initialCourse);
          setOpenModules(new Set(initialCourse.modules.map(m => m.id)));
          setIsAddingModule(false);
          setEditingModule(null);
          setEditingLessonInfo(null);
        }
    }, [initialCourse, isOpen]);

    const toggleModule = (moduleId: string) => {
        setOpenModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) newSet.delete(moduleId);
            else newSet.add(moduleId);
            return newSet;
        });
    };

    const handleSaveModule = async (id: string, title: string) => {
        if (title.trim()) {
            await api.updateModule(course.id, id, { title });
            setEditingModule(null);
            refreshCourse();
        }
    };

    const handleAddModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newModuleTitle.trim()) {
            await api.addModule(course.id, { title: newModuleTitle });
            setIsAddingModule(false);
            setNewModuleTitle('');
            refreshCourse();
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este módulo e todas as suas aulas?')) {
            await api.deleteModule(course.id, moduleId);
            refreshCourse();
        }
    };
    
    const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
         if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
            await api.deleteLesson(course.id, moduleId, lessonId);
            refreshCourse();
        }
    }
    
    const handleLessonSave = () => {
        setEditingLessonInfo(null);
        refreshCourse();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Gerenciar Conteúdo: ${course.title}`}>
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                    <h3 className="text-xl font-bold">Módulos do Curso</h3>
                </div>
                
                {isLoading && <div className="text-center p-4">Atualizando...</div>}

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {course.modules.map(module => (
                        <div key={module.id} className="bg-gray-50 rounded-lg border border-gray-200">
                           {editingModule?.id === module.id ? (
                                <form className="p-3 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); handleSaveModule(editingModule.id, editingModule.title)}}>
                                    <input 
                                        type="text" 
                                        value={editingModule.title} 
                                        onChange={(e) => setEditingModule({...editingModule, title: e.target.value})}
                                        className="flex-grow px-3 py-2 bg-white text-gray-900 border border-blue-400 rounded-md shadow-sm"
                                        autoFocus
                                    />
                                    <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm">Salvar</button>
                                    <button type="button" onClick={() => setEditingModule(null)} className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm">Cancelar</button>
                                </form>
                           ) : (
                               <div className="p-3 flex justify-between items-center border-b">
                                    <button onClick={() => toggleModule(module.id)} className="flex items-center space-x-2 text-left w-full">
                                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${openModules.has(module.id) ? 'rotate-180' : ''}`} />
                                        <span className="font-semibold text-lg">{module.title}</span>
                                    </button>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => setEditingModule({id: module.id, title: module.title})} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDeleteModule(module.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                               </div>
                           )}

                           {openModules.has(module.id) && (
                               <div className="p-3 space-y-3">
                                   {module.lessons.map(lesson => (
                                       <div key={lesson.id} className="p-3 bg-white rounded-md border flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span>{lesson.title}</span>
                                                {lesson.quiz && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Prova</span>
                                                )}
                                            </div>
                                           <div className="flex items-center space-x-2">
                                               <button onClick={() => setEditingLessonInfo({moduleId: module.id, lesson})} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                               <button onClick={() => handleDeleteLesson(module.id, lesson.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                                           </div>
                                       </div>
                                   ))}
                                   {module.lessons.length === 0 && <p className="text-sm text-gray-500 p-2">Nenhuma aula neste módulo.</p>}
                                   
                                   {editingLessonInfo?.moduleId === module.id ? (
                                        <LessonForm
                                            courseId={course.id}
                                            moduleId={module.id}
                                            lesson={editingLessonInfo.lesson}
                                            onSave={handleLessonSave}
                                            onClose={() => setEditingLessonInfo(null)}
                                        />
                                   ) : (
                                       <button onClick={() => setEditingLessonInfo({moduleId: module.id, lesson: null})} className="w-full mt-2 bg-green-100 text-green-800 text-sm px-3 py-2 rounded-md hover:bg-green-200 flex items-center justify-center space-x-2">
                                           <PlusIcon className="h-4 w-4" />
                                           <span>Adicionar Aula</span>
                                       </button>
                                   )}
                               </div>
                           )}
                        </div>
                    ))}

                    {isAddingModule ? (
                        <form onSubmit={handleAddModule} className="p-3 flex items-center gap-2 bg-gray-100 border rounded-lg">
                           <input 
                                type="text" 
                                value={newModuleTitle}
                                onChange={e => setNewModuleTitle(e.target.value)}
                                placeholder="Título do novo módulo"
                                className="flex-grow px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm"
                                autoFocus
                            />
                            <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm">Criar Módulo</button>
                            <button type="button" onClick={() => setIsAddingModule(false)} className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm">Cancelar</button>
                        </form>
                    ) : (
                        <button onClick={() => setIsAddingModule(true)} className="w-full mt-4 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-2 rounded-md hover:bg-blue-200 flex items-center justify-center space-x-2">
                            <PlusIcon className="h-4 w-4" />
                            <span>Adicionar Módulo</span>
                        </button>
                    )}
                    {course.modules.length === 0 && !isAddingModule && !isLoading && <p className="text-center text-gray-500 py-6">Nenhum módulo cadastrado. Clique em 'Adicionar Módulo' para começar.</p>}
                </div>
            </div>
        </Modal>
    );
};

export default CourseContentManager;