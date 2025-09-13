import React, { useState, useEffect, useCallback } from 'react';
import { User, Course, Role } from './types';
import { api } from './services/api';
import { supabase } from './services/supabaseClient';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CheckoutPage from './pages/CheckoutPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import CTStudentLoginPage from './pages/CTStudentLoginPage';
import CourseCompletionPage from './pages/CourseCompletionPage';

type View = 'HOME' | 'LOGIN' | 'SIGNUP' | 'ADMIN_DASHBOARD' | 'STUDENT_DASHBOARD' | 'CHECKOUT' | 'COURSE_PLAYER' | 'CT_STUDENT_LOGIN' | 'COURSE_COMPLETION';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<View>('HOME');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [courseCompletionData, setCourseCompletionData] = useState<{ course: Course; performance: number } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const user = await api.getSession();
      await handleLogin(user);
      setIsLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const user = session?.user ? await api.getSession() : null;
        await handleLogin(user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchCoursesAndEnrollments = useCallback(async (user: User | null) => {
    try {
      const allCourses = await api.getCourses();
      setCourses(allCourses);
      
      if (user) {
        const studentCourses = await api.getStudentCourses(user.id);
        setEnrolledCourseIds(new Set(studentCourses.map(c => c.id)));
      } else {
        setEnrolledCourseIds(new Set());
      }

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleLogin = async (user: User | null) => {
    setCurrentUser(user);
    await fetchCoursesAndEnrollments(user);

    if (user) {
      setView(user.role === Role.PROGRAMADOR ? 'ADMIN_DASHBOARD' : 'STUDENT_DASHBOARD');
    } else {
      setView('HOME');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setSelectedCourse(null);
    setEnrolledCourseIds(new Set());
    setView('HOME');
  };

  const handleSelectCourseToBuy = (course: Course) => {
    if (!currentUser) {
        alert('Por favor, faça login ou cadastre-se para comprar um curso.');
        setView('LOGIN');
        return;
    }
    setSelectedCourse(course);
    setView('CHECKOUT');
  };
  
  const handleSelectCourseToView = (course: Course) => {
    setSelectedCourse(course);
    setView('COURSE_PLAYER');
  };

  const navigateTo = (newView: View) => {
    setView(newView);
  }

  const handleCourseComplete = (course: Course, performance: number) => {
    setCourseCompletionData({ course, performance });
    setView('COURSE_COMPLETION');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-10">Carregando...</div>;
    }

    switch (view) {
      case 'LOGIN':
        return <LoginPage onLoginSuccess={() => {}} onNavigateToSignUp={() => navigateTo('SIGNUP')} onNavigateToCTLogin={() => navigateTo('CT_STUDENT_LOGIN')} />;
      case 'CT_STUDENT_LOGIN':
        return <CTStudentLoginPage onLoginSuccess={() => {}} onNavigateToMainLogin={() => navigateTo('LOGIN')} />;
      case 'SIGNUP':
        return <SignUpPage onSignUpSuccess={() => { alert('Cadastro realizado com sucesso! Faça o login para continuar.'); navigateTo('LOGIN'); }} onNavigateToLogin={() => navigateTo('LOGIN')} />;
      case 'ADMIN_DASHBOARD':
        return currentUser && <AdminDashboard user={currentUser} onCoursesUpdate={() => fetchCoursesAndEnrollments(currentUser)} />;
      case 'STUDENT_DASHBOARD':
        return currentUser && <StudentDashboard user={currentUser} onSelectCourse={handleSelectCourseToView} onBrowseCourses={() => navigateTo('HOME')} />;
      case 'CHECKOUT':
        return selectedCourse && currentUser && (
            <CheckoutPage 
                course={selectedCourse}
                user={currentUser}
                onBack={() => setView('HOME')} 
            />
        );
      case 'COURSE_PLAYER':
        return currentUser && selectedCourse && <CoursePlayerPage user={currentUser} course={selectedCourse} onBack={() => setView('STUDENT_DASHBOARD')} onCourseComplete={handleCourseComplete} />;
      case 'COURSE_COMPLETION':
        return currentUser && courseCompletionData && <CourseCompletionPage user={currentUser} course={courseCompletionData.course} performance={courseCompletionData.performance} onBack={() => setView('STUDENT_DASHBOARD')} />;
      case 'HOME':
      default:
        const coursesForSale = courses.filter(course => !enrolledCourseIds.has(course.id));
        return <HomePage courses={coursesForSale} onSelectCourse={handleSelectCourseToBuy} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onNavigateToLogin={() => navigateTo('LOGIN')}
        onNavigateHome={() => {
          if(currentUser) {
            setView(currentUser.role === Role.PROGRAMADOR ? 'ADMIN_DASHBOARD' : 'STUDENT_DASHBOARD');
          } else {
            setView('HOME');
          }
        }}
      />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;