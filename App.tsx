
import React, { useState, useEffect, useCallback } from 'react';
import { User, Course, Role } from './types';
import { api } from './services/api';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CheckoutPage from './pages/CheckoutPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import CTStudentLoginPage from './pages/CTStudentLoginPage';

type View = 'HOME' | 'LOGIN' | 'SIGNUP' | 'ADMIN_DASHBOARD' | 'STUDENT_DASHBOARD' | 'CHECKOUT' | 'COURSE_PLAYER' | 'CT_STUDENT_LOGIN';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<View>('HOME');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const allCourses = await api.getCourses();
      setCourses(allCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    if (user.role === Role.PROGRAMADOR) {
      setView('ADMIN_DASHBOARD');
    } else {
      try {
        // Fetch student's courses to know what they already own
        const studentCourses = await api.getStudentCourses(user.id);
        setEnrolledCourseIds(new Set(studentCourses.map(c => c.id)));
      } catch (error) {
        console.error("Failed to fetch student courses on login:", error);
        setEnrolledCourseIds(new Set()); // Reset on error
      }
      setView('STUDENT_DASHBOARD');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedCourse(null);
    setEnrolledCourseIds(new Set()); // Clear enrolled courses on logout
    setView('HOME');
  };

  const handleSelectCourseToBuy = (course: Course) => {
    // Redirect to login if not authenticated
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

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-10">Carregando...</div>;
    }

    switch (view) {
      case 'LOGIN':
        return <LoginPage onLogin={handleLogin} onNavigateToSignUp={() => navigateTo('SIGNUP')} onNavigateToCTLogin={() => navigateTo('CT_STUDENT_LOGIN')} />;
      case 'CT_STUDENT_LOGIN':
        return <CTStudentLoginPage onLoginSuccess={handleLogin} onNavigateToMainLogin={() => navigateTo('LOGIN')} />;
      case 'SIGNUP':
        return <SignUpPage onSignUpSuccess={() => { alert('Cadastro realizado com sucesso! Faça o login para continuar.'); navigateTo('LOGIN'); }} onNavigateToLogin={() => navigateTo('LOGIN')} />;
      case 'ADMIN_DASHBOARD':
        return currentUser && <AdminDashboard user={currentUser} onCoursesUpdate={fetchCourses} />;
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
        return currentUser && selectedCourse && <CoursePlayerPage user={currentUser} course={selectedCourse} onBack={() => setView('STUDENT_DASHBOARD')} />;
      case 'HOME':
      default:
        // Filter out courses the user is already enrolled in
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
