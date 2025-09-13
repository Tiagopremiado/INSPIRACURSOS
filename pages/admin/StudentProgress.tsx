import React, { useState, useEffect, useCallback } from 'react';
import { User, Course } from '../../types';
import { api } from '../../services/api';

interface ProgressOverview {
    student: User;
    course: Course;
    progress: number;
}

const StudentProgress: React.FC = () => {
    const [progressData, setProgressData] = useState<ProgressOverview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProgress = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getStudentProgressOverview();
            // Sort by student name, then course title
            data.sort((a, b) => {
                if (a.student.name < b.student.name) return -1;
                if (a.student.name > b.student.name) return 1;
                if (a.course.title < b.course.title) return -1;
                if (a.course.title > b.course.title) return 1;
                return 0;
            });
            setProgressData(data);
        } catch (error) {
            console.error("Failed to fetch student progress", error);
            alert('Falha ao carregar o progresso dos alunos.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    const filteredData = progressData.filter(item => 
        item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="text-center p-10">Carregando progresso dos alunos...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Progresso dos Alunos</h2>
                <input
                    type="text"
                    placeholder="Buscar por aluno, email ou curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-72 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map(({ student, course, progress }, index) => (
                            <tr key={`${student.id}-${course.id}-${index}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-4 mr-3">
                                            <div
                                                className={`h-4 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700 w-12 text-right">{progress.toFixed(0)}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Nenhum progresso encontrado para os filtros aplicados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProgress;