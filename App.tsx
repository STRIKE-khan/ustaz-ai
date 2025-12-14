import React, { useState, useEffect } from 'react';
import { AppView, ClassGroup, Notice, Homework } from './types';
import Sidebar from './components/Sidebar';
import ClassManager from './components/ClassManager';
import TestGenerator from './components/TestGenerator';
import ExamGenerator from './components/ExamGenerator';
import AttendanceManager from './components/AttendanceManager';
import NoticeBoard from './components/NoticeBoard';
import HomeworkDiary from './components/HomeworkDiary';
import { Menu, X, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [teacherName, setTeacherName] = useState<string>('');
  const [view, setView] = useState<AppView>('LOGIN');
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClasses = localStorage.getItem('ustaz_classes');
    const savedName = localStorage.getItem('ustaz_name');
    const savedNotices = localStorage.getItem('ustaz_notices');
    const savedHomework = localStorage.getItem('ustaz_homework');
    if (savedClasses) setClasses(JSON.parse(savedClasses));
    if (savedNotices) setNotices(JSON.parse(savedNotices));
    if (savedHomework) setHomework(JSON.parse(savedHomework));
    if (savedName) {
      setTeacherName(savedName);
      setView('DASHBOARD');
    }
  }, []);

  // Save data whenever they change
  useEffect(() => {
    if (classes.length > 0) localStorage.setItem('ustaz_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('ustaz_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('ustaz_homework', JSON.stringify(homework));
  }, [homework]);

  const handleLogin = (name: string) => {
    setTeacherName(name);
    localStorage.setItem('ustaz_name', name);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setTeacherName('');
    localStorage.removeItem('ustaz_name');
    setView('LOGIN');
  };

  const addClass = (newClass: ClassGroup) => {
    setClasses([...classes, newClass]);
  };

  const updateClass = (updatedClass: ClassGroup) => {
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const deleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const addNotice = (notice: Notice) => setNotices([...notices, notice]);
  const deleteNotice = (id: string) => setNotices(notices.filter(n => n.id !== id));
  const addHomework = (hw: Homework) => setHomework([...homework, hw]);
  const deleteHomework = (id: string) => setHomework(homework.filter(h => h.id !== id));

  // Mobile Sidebar toggle
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (view === 'LOGIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
              <span><span className="text-yellow-500">Ustaz</span>.AI</span>
              <span className="text-sm text-indigo-400 font-normal border border-indigo-300 px-1.5 py-0.5 rounded-md">RWS</span>
            </h1>
            <p className="text-gray-500">Your Intelligent Classroom Assistant</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher's Name</label>
              <input
                id="teacherNameInput"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 bg-white placeholder-gray-400"
                placeholder="Enter your name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin(e.currentTarget.value);
                }}
              />
            </div>
            <button
              onClick={() => {
                const input = document.getElementById('teacherNameInput') as HTMLInputElement;
                if (input.value) handleLogin(input.value);
              }}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar
        currentView={view}
        setView={setView}
        onLogout={handleLogout}
        teacherName={teacherName}
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-indigo-900 text-white z-20 flex justify-between items-center p-4 shadow-md">
        <h1 className="font-bold text-lg flex items-center gap-2">
          Ustaz.AI <span className="text-xs border border-white px-1 rounded">RWS</span>
        </h1>
        <button onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" onClick={toggleMobileMenu}>
          <div className="bg-white h-full w-3/4 p-4" onClick={e => e.stopPropagation()}>
            <nav className="space-y-4 mt-12">
              <button onClick={() => { setView('DASHBOARD'); setIsMobileMenuOpen(false); }} className="block w-full text-left p-2 font-bold text-gray-800">Dashboard</button>
              <button onClick={() => { setView('ADD_CLASS'); setIsMobileMenuOpen(false); }} className="block w-full text-left p-2 font-bold text-gray-800">Manage Classes</button>
              <button onClick={() => { setView('CREATE_TEST'); setIsMobileMenuOpen(false); }} className="block w-full text-left p-2 font-bold text-gray-800">Class Test</button>
              <button onClick={() => { setView('PAPER_RESULT'); setIsMobileMenuOpen(false); }} className="block w-full text-left p-2 font-bold text-gray-800">Exam Result</button>
              <button onClick={() => { setView('ATTENDANCE'); setIsMobileMenuOpen(false); }} className="block w-full text-left p-2 font-bold text-gray-800">Attendance</button>
              <button onClick={() => { setView('NOTICES'); setIsMobileMenuOpen(false); }} className="block w-full text-left p-2 font-bold text-gray-800">Notice Board</button>
              <button onClick={() => { setView('HOMEWORK'); setIsMobileMenuOpen(false); }} className="block w-full text-left p-2 font-bold text-gray-800">Homework Diary</button>
              <button onClick={handleLogout} className="block w-full text-left p-2 text-red-600 font-bold mt-8">Logout</button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">

        {/* Back Button logic */}
        {view !== 'DASHBOARD' && (
          <button
            onClick={() => setView('DASHBOARD')}
            className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
          </button>
        )}

        {view === 'DASHBOARD' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome back, {teacherName}!</h2>
              <p className="opacity-90">Manage your classroom efficiently with the power of Ustaz.AI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div onClick={() => setView('ADD_CLASS')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 text-xl font-bold">{classes.length}</div>
                <h3 className="font-bold text-gray-800">Active Classes</h3>
                <p className="text-sm text-gray-500 mt-1">Add or manage students</p>
              </div>
              <div onClick={() => setView('CREATE_TEST')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">📝</div>
                <h3 className="font-bold text-gray-800">Create Test</h3>
                <p className="text-sm text-gray-500 mt-1">Generate result slides</p>
              </div>
              <div onClick={() => setView('ATTENDANCE')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">📅</div>
                <h3 className="font-bold text-gray-800">Attendance</h3>
                <p className="text-sm text-gray-500 mt-1">Mark daily presence</p>
              </div>
              <div onClick={() => setView('NOTICES')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-3">📢</div>
                <h3 className="font-bold text-gray-800">Notice Board</h3>
                <p className="text-sm text-gray-500 mt-1">Share announcements</p>
              </div>
              <div onClick={() => setView('HOMEWORK')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">📚</div>
                <h3 className="font-bold text-gray-800">Homework Diary</h3>
                <p className="text-sm text-gray-500 mt-1">Assign homework</p>
              </div>
            </div>
          </div>
        )}

        {view === 'ADD_CLASS' && <ClassManager classes={classes} addClass={addClass} updateClass={updateClass} deleteClass={deleteClass} />}
        {view === 'CREATE_TEST' && <TestGenerator classes={classes} />}
        {view === 'PAPER_RESULT' && <ExamGenerator classes={classes} />}
        {view === 'ATTENDANCE' && <AttendanceManager classes={classes} />}
        {view === 'NOTICES' && <NoticeBoard notices={notices} addNotice={addNotice} deleteNotice={deleteNotice} />}
        {view === 'HOMEWORK' && <HomeworkDiary classes={classes} homework={homework} addHomework={addHomework} deleteHomework={deleteHomework} />}

      </main>
    </div>
  );
};

export default App;