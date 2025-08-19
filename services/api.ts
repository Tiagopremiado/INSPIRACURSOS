
import { User, Course, Role, Enrollment, Module, Lesson, Coupon, CTAccessCode, CTAccessCodeWithUserName } from '../types';

// --- MOCK DATABASE ---

let users: User[] = [
  { id: 'user-1', name: 'Admin Programador', email: 'admin@inspira.com', password: 'admin123', role: Role.PROGRAMADOR, phone: '11987654321' },
  { id: 'user-2', name: 'Aluno Exemplo', email: 'aluno@inspira.com', password: 'aluno123', role: Role.ALUNO, phone: '11912345678' },
  { id: 'user-3', name: 'Maria Silva', email: 'maria@email.com', password: 'password', role: Role.ALUNO, isCTStudent: true },
  { id: 'user-4', name: 'João Santos', email: 'joao@email.com', password: 'password', role: Role.ALUNO },
];

let courses: Course[] = [
  {
    id: 'course-1',
    title: 'Desenvolvimento Web Completo 2024',
    description: 'Aprenda a criar aplicações web modernas do zero com as tecnologias mais requisitadas do mercado.',
    price: 499.90,
    imageUrl: 'https://picsum.photos/seed/webdev/600/400',
    modules: [
      { 
        id: 'mod-1-1',
        title: 'Módulo 1: Fundamentos do HTML5 e CSS3',
        lessons: [
          { id: 'les-1-1-1', title: 'Introdução ao HTML', content: '<h1>Bem-vindo ao HTML!</h1><p>Este é o conteúdo da aula.</p>', attachments: [{ name: 'Código Fonte da Aula.zip', url: '#' }] },
          { id: 'les-1-1-2', title: 'Estilizando com CSS', content: '<h1>Estilizando com CSS</h1><p>Vamos aprender sobre seletores e propriedades.</p>', videoUrl: 'https://www.youtube.com/watch?v=O_9u1P5YjVc' },
        ]
      },
      {
        id: 'mod-1-2',
        title: 'Módulo 2: JavaScript Moderno (ES6+)',
        lessons: [
          { id: 'les-1-2-1', title: 'Variáveis e Tipos de Dados', content: '<h1>JavaScript Moderno</h1><p>Conteúdo sobre let, const, arrow functions, etc.</p>' },
        ]
      }
    ]
  },
  {
    id: 'course-2',
    title: 'React.js: Do Básico ao Avançado',
    description: 'Domine a biblioteca frontend mais popular do mundo e crie interfaces de usuário reativas e poderosas.',
    price: 599.90,
    imageUrl: 'https://picsum.photos/seed/react/600/400',
    modules: [
       { 
        id: 'mod-2-1',
        title: 'Módulo 1: Introdução ao React',
        lessons: [
          { id: 'les-2-1-1', title: 'O que é React?', content: '<h1>O que é React?</h1><p>Entendendo a biblioteca.</p>' },
          { id: 'les-2-1-2', title: 'Componentes e Props', content: '<h1>Componentes</h1><p>A base de tudo.</p>' },
        ]
      },
    ]
  },
  {
    id: 'course-3',
    title: 'Design de UI/UX para Desenvolvedores',
    description: 'Aprenda os princípios de design para criar interfaces bonitas, funcionais e que encantam os usuários.',
    price: 349.90,
    imageUrl: 'https://picsum.photos/seed/uiux/600/400',
    modules: []
  },
];

let enrollments: Enrollment[] = [
  { userId: 'user-2', courseId: 'course-1' },
];

let coupons: Coupon[] = [
    { id: 'coupon-1', code: 'PROMO10', discountPercentage: 10, expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), isActive: true },
    { id: 'coupon-2', code: 'REACT20', discountPercentage: 20, expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), isActive: true, courseId: 'course-2' },
    { id: 'coupon-3', code: 'EXPIRED50', discountPercentage: 50, expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isActive: true },
]

let ctAccessCodes: CTAccessCode[] = [
    { id: 'code-1', code: '123456', isUsed: false },
    { id: 'code-2', code: '654321', isUsed: true, usedByUserId: 'user-3' }, // Already used for testing
    { id: 'code-3', code: '112233', isUsed: false },
    { id: 'code-4', code: '445566', isUsed: false },
];

// --- MOCK API FUNCTIONS ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const findCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error('Curso não encontrado.');
    return course;
}
const findModule = (course: Course, moduleId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) throw new Error('Módulo não encontrado.');
    return module;
}
const findLesson = (module: Module, lessonId: string) => {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (!lesson) throw new Error('Aula não encontrada.');
    return lesson;
}


export const api = {
  login: async (email: string, pass: string): Promise<User> => {
    await simulateDelay(500);
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      // In a real app, never send the password back
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    throw new Error('Credenciais inválidas.');
  },

  getCourses: async (): Promise<Course[]> => {
    await simulateDelay(300);
    return JSON.parse(JSON.stringify(courses));
  },
  
  getCourse: async (courseId: string): Promise<Course> => {
    await simulateDelay(100);
    return JSON.parse(JSON.stringify(findCourse(courseId)));
  },

  getStudentCourses: async (userId: string): Promise<Course[]> => {
    await simulateDelay(300);
    const studentEnrollments = enrollments.filter(e => e.userId === userId);
    const studentCourseIds = new Set(studentEnrollments.map(e => e.courseId));
    return JSON.parse(JSON.stringify(courses.filter(c => studentCourseIds.has(c.id))));
  },

  createCourse: async (courseData: Omit<Course, 'id' | 'modules'>): Promise<Course> => {
    await simulateDelay(500);
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      modules: [],
    };
    courses.push(newCourse);
    return newCourse;
  },

  updateCourse: async (courseId: string, updates: Partial<Course>): Promise<Course> => {
    await simulateDelay(500);
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) throw new Error('Curso não encontrado.');
    courses[courseIndex] = { ...courses[courseIndex], ...updates };
    return courses[courseIndex];
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await simulateDelay(500);
    courses = courses.filter(c => c.id !== courseId);
    enrollments = enrollments.filter(e => e.courseId !== courseId);
  },

  getStudents: async(): Promise<User[]> => {
    await simulateDelay(300);
    return users.filter(u => u.role === Role.ALUNO).map(({password, ...user}) => user);
  },
  
  createUser: async(userData: Omit<User, 'id' | 'role'>): Promise<User> => {
    await simulateDelay(500);
    const emailExists = users.some(u => u.email === userData.email);
    if (emailExists) {
        throw new Error('Este e-mail já está em uso.');
    }
    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        role: Role.ALUNO,
    };
    users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  registerCTStudent: async(userData: Omit<User, 'id' | 'role'> & { accessCode: string }): Promise<User> => {
    await simulateDelay(600);
    
    // 1. Validate Access Code
    const codeEntry = ctAccessCodes.find(c => c.code === userData.accessCode);
    if (!codeEntry || codeEntry.isUsed) {
        throw new Error('Código de acesso inválido ou já utilizado.');
    }
    
    // 2. Check if email exists
    const emailExists = users.some(u => u.email === userData.email);
    if (emailExists) {
        throw new Error('Este e-mail já está em uso.');
    }

    // 3. Create user
    const newUser: User = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        id: `user-ct-${Date.now()}`,
        role: Role.ALUNO,
        isCTStudent: true,
    };
    users.push(newUser);

    // 4. Mark code as used
    codeEntry.isUsed = true;
    codeEntry.usedByUserId = newUser.id;
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  updateUser: async(userId: string, updates: Partial<Omit<User, 'id' | 'role' | 'email'>>): Promise<User> => {
    await simulateDelay(500);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error('Usuário não encontrado.');
    }
    users[userIndex] = { ...users[userIndex], ...updates };
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await simulateDelay(500);
    const userExists = users.some(u => u.id === userId);
    if (!userExists) {
      throw new Error('Usuário não encontrado.');
    }
    users = users.filter(u => u.id !== userId);
    enrollments = enrollments.filter(e => e.userId !== userId);
  },

  enrollStudent: async(userId: string, courseId: string): Promise<Enrollment> => {
    await simulateDelay(500);
    const existingEnrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if(existingEnrollment) {
      throw new Error('Aluno já matriculado neste curso.');
    }
    const newEnrollment = { userId, courseId };
    enrollments.push(newEnrollment);
    return newEnrollment;
  },

  // --- Module and Lesson Management ---

  addModule: async(courseId: string, moduleData: { title: string }): Promise<Module> => {
    await simulateDelay(400);
    const course = findCourse(courseId);
    const newModule: Module = {
      id: `mod-${courseId}-${Date.now()}`,
      title: moduleData.title,
      lessons: []
    };
    course.modules.push(newModule);
    return JSON.parse(JSON.stringify(newModule));
  },
  
  updateModule: async(courseId: string, moduleId: string, updates: { title: string }): Promise<Module> => {
    await simulateDelay(400);
    const course = findCourse(courseId);
    const module = findModule(course, moduleId);
    module.title = updates.title;
    return JSON.parse(JSON.stringify(module));
  },
  
  deleteModule: async(courseId: string, moduleId: string): Promise<void> => {
    await simulateDelay(400);
    const course = findCourse(courseId);
    course.modules = course.modules.filter(m => m.id !== moduleId);
  },

  addLesson: async(courseId: string, moduleId: string, lessonData: Omit<Lesson, 'id'>): Promise<Lesson> => {
    await simulateDelay(400);
    const course = findCourse(courseId);
    const module = findModule(course, moduleId);
    const newLesson: Lesson = {
      ...lessonData,
      id: `les-${moduleId}-${Date.now()}`,
    };
    module.lessons.push(newLesson);
    return JSON.parse(JSON.stringify(newLesson));
  },

  updateLesson: async(courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>): Promise<Lesson> => {
    await simulateDelay(400);
    const course = findCourse(courseId);
    const module = findModule(course, moduleId);
    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
    if(lessonIndex === -1) throw new Error('Aula não encontrada.');
    module.lessons[lessonIndex] = { ...module.lessons[lessonIndex], ...updates };
    return JSON.parse(JSON.stringify(module.lessons[lessonIndex]));
  },
  
  deleteLesson: async(courseId: string, moduleId: string, lessonId: string): Promise<void> => {
    await simulateDelay(400);
    const course = findCourse(courseId);
    const module = findModule(course, moduleId);
    module.lessons = module.lessons.filter(l => l.id !== lessonId);
  },

  // --- Coupon Management ---
  getCoupons: async(): Promise<Coupon[]> => {
    await simulateDelay(300);
    return JSON.parse(JSON.stringify(coupons));
  },

  createCoupon: async(couponData: Omit<Coupon, 'id'>): Promise<Coupon> => {
    await simulateDelay(400);
    if (coupons.some(c => c.code.toUpperCase() === couponData.code.toUpperCase())) {
      throw new Error('Este código de cupom já existe.');
    }
    const newCoupon: Coupon = {
      ...couponData,
      id: `coupon-${Date.now()}`,
    };
    coupons.push(newCoupon);
    return JSON.parse(JSON.stringify(newCoupon));
  },

  updateCoupon: async(couponId: string, updates: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> => {
    await simulateDelay(400);
    const couponIndex = coupons.findIndex(c => c.id === couponId);
    if (couponIndex === -1) throw new Error('Cupom não encontrado.');
    // Check for duplicate code on update
    if (updates.code && coupons.some(c => c.code.toUpperCase() === updates.code!.toUpperCase() && c.id !== couponId)) {
        throw new Error('Este código de cupom já existe.');
    }
    coupons[couponIndex] = { ...coupons[couponIndex], ...updates };
    return JSON.parse(JSON.stringify(coupons[couponIndex]));
  },

  deleteCoupon: async(couponId: string): Promise<void> => {
    await simulateDelay(400);
    coupons = coupons.filter(c => c.id !== couponId);
  },

  validateCoupon: async(code: string, courseId: string): Promise<{isValid: boolean, discountPercentage: number}> => {
    await simulateDelay(500);
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
      throw new Error('Cupom inválido ou não encontrado.');
    }
    if (!coupon.isActive) {
      throw new Error('Este cupom não está mais ativo.');
    }
    if (new Date(coupon.expiresAt) < new Date()) {
      throw new Error('Este cupom expirou.');
    }
    if (coupon.courseId && coupon.courseId !== courseId) {
      throw new Error('Este cupom não é válido para este curso.');
    }

    return { isValid: true, discountPercentage: coupon.discountPercentage };
  },

  // --- CT Access Code Management ---
  getCTAccessCodes: async(): Promise<CTAccessCodeWithUserName[]> => {
    await simulateDelay(300);
    const codesWithUsers = ctAccessCodes.map(code => {
        let usedByUserName: string | undefined = undefined;
        if (code.isUsed && code.usedByUserId) {
            const user = users.find(u => u.id === code.usedByUserId);
            if (user) {
                usedByUserName = user.name;
            }
        }
        return { ...code, usedByUserName };
    });
    return JSON.parse(JSON.stringify(codesWithUsers));
  },

  generateCTAccessCode: async(): Promise<CTAccessCode> => {
      await simulateDelay(400);
      let newCodeStr: string;
      do {
          newCodeStr = Math.floor(100000 + Math.random() * 900000).toString();
      } while (ctAccessCodes.some(c => c.code === newCodeStr));
      
      const newCode: CTAccessCode = {
          id: `code-${Date.now()}`,
          code: newCodeStr,
          isUsed: false,
      };
      ctAccessCodes.push(newCode);
      return JSON.parse(JSON.stringify(newCode));
  },

  updateCTAccessCodeStatus: async(codeId: string, isUsed: boolean): Promise<CTAccessCode> => {
      await simulateDelay(400);
      const codeIndex = ctAccessCodes.findIndex(c => c.id === codeId);
      if (codeIndex === -1) throw new Error('Código não encontrado.');
      ctAccessCodes[codeIndex].isUsed = isUsed;
      return JSON.parse(JSON.stringify(ctAccessCodes[codeIndex]));
  },

  deleteCTAccessCode: async(codeId: string): Promise<void> => {
      await simulateDelay(400);
      ctAccessCodes = ctAccessCodes.filter(c => c.id !== codeId);
  },
};