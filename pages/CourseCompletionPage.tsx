import React from 'react';
import { User, Course } from '../types';

interface CourseCompletionPageProps {
    user: User;
    course: Course;
    performance: number;
    onBack: () => void;
}

const CourseCompletionPage: React.FC<CourseCompletionPageProps> = ({ user, course, performance, onBack }) => {
    
    const motivationalText = `
        Que jornada incrível! Você não apenas cruzou a linha de chegada, mas o fez com excelência, demonstrando um comprometimento que é verdadeiramente inspirador.
        Cada módulo concluído, cada desafio superado, foi um tijolo a mais na construção do seu conhecimento. Este certificado que você está prestes a receber é mais do que um documento; é um símbolo da sua dedicação, da sua curiosidade e da sua capacidade de ir além.
        Lembre-se que o aprendizado é um caminho contínuo, uma aventura que nunca termina. As habilidades que você adquiriu aqui são ferramentas poderosas. Use-as para construir novas pontes, para inovar em sua carreira e para transformar ideias em realidade.
        O mercado de trabalho valoriza profissionais que, como você, buscam constantemente o aprimoramento. Você provou que tem a disciplina e a paixão necessárias para se destacar.
        Continue com essa sede de conhecimento. Explore novos cursos, leia, converse com outros profissionais, nunca pare de se questionar. A jornada do saber é o que nos mantém vivos, relevantes e prontos para o futuro.
        A equipe INSPIRA se orgulha de ter feito parte da sua trajetória e estamos ansiosos para ver os frutos do seu esforço florescerem. Você é a prova de que com foco e determinação, não há limites para o que se pode alcançar.
        Celebre esta conquista! Você merece todo o reconhecimento.
        Para solicitar a emissão do seu certificado oficial, basta entrar em contato com nossa equipe de suporte pelo WhatsApp. Estaremos prontos para te atender.
    `;

    const whatsappMessage = encodeURIComponent(`Olá! Concluí o curso "${course.title}" e gostaria de solicitar meu certificado. Meu nome é ${user.name}.`);
    const whatsappLink = `https://wa.me/5553991152051?text=${whatsappMessage}`;

    return (
        <div className="max-w-4xl mx-auto text-center py-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-4">
                Parabéns {user.name.split(' ')[0]} por completar o {course.title} com {performance.toFixed(0)}% de aproveitamento!
            </h1>
            <div className="bg-white p-8 rounded-xl shadow-lg text-left my-8">
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {motivationalText.trim()}
                </p>
                 <div className="text-center mt-8">
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-green-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-600 transition-colors duration-300 text-lg"
                    >
                       Solicitar Certificado via WhatsApp
                    </a>
                </div>
            </div>
            <button
                onClick={onBack}
                className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-300"
            >
                Voltar para INSPIRA.CURSOS
            </button>
        </div>
    );
};

export default CourseCompletionPage;
