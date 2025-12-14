import React, { useState } from 'react';
import { ClassGroup, Student } from '../types';
import { Plus, Trash2, Save, UserPlus, Edit, ArrowLeft, Users } from 'lucide-react';

interface ClassManagerProps {
  classes: ClassGroup[];
  addClass: (newClass: ClassGroup) => void;
  updateClass: (updatedClass: ClassGroup) => void;
  deleteClass: (id: string) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ classes, addClass, updateClass, deleteClass }) => {
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [className, setClassName] = useState('');

  // Student Form States
  const [sName, setSName] = useState('');
  const [sFather, setSFather] = useState('');
  const [sRoll, setSRoll] = useState('');

  // Auto-suggest next roll number
  const getNextRollNumber = (students: Student[]) => {
    if (students.length === 0) return '1';
    const rolls = students.map(s => parseInt(s.rollNo) || 0);
    return String(Math.max(...rolls) + 1);
  };

  // Create new class (without students)
  const handleSaveNewClass = () => {
    if (!className.trim()) return;
    const newClass: ClassGroup = {
      id: Date.now().toString(),
      name: className.trim(),
      students: []
    };
    addClass(newClass);
    setClassName('');
    // Immediately edit the new class to add students
    setEditingClass(newClass);
  };

  // Add student to existing class
  const handleAddStudent = () => {
    if (!editingClass || !sName.trim()) return;
    const newStudent: Student = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: sName.trim(),
      fatherName: sFather.trim(),
      rollNo: sRoll || getNextRollNumber(editingClass.students)
    };
    const updatedClass = {
      ...editingClass,
      students: [...editingClass.students, newStudent]
    };
    setEditingClass(updatedClass);
    updateClass(updatedClass);
    setSName('');
    setSFather('');
    setSRoll(String(parseInt(newStudent.rollNo) + 1)); // Auto-suggest next
  };

  // Remove student
  const removeStudent = (studentId: string) => {
    if (!editingClass) return;
    const updatedClass = {
      ...editingClass,
      students: editingClass.students.filter(s => s.id !== studentId)
    };
    setEditingClass(updatedClass);
    updateClass(updatedClass);
  };

  // Delete class
  const handleDeleteClass = (id: string) => {
    if (confirm('Are you sure you want to delete this class and all its students?')) {
      deleteClass(id);
    }
  };

  // Start editing class
  const handleEditClass = (cls: ClassGroup) => {
    setEditingClass(cls);
    setSRoll(getNextRollNumber(cls.students));
  };

  // -- Render Edit Mode --
  if (editingClass) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditingClass(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h2 className="text-2xl font-bold">{editingClass.name}</h2>
                <p className="opacity-80">{editingClass.students.length} students enrolled</p>
              </div>
            </div>
          </div>

          {/* Add Student Form */}
          <div className="p-6 bg-gray-50 border-b">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-indigo-600" /> Add New Student
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                placeholder="Roll No"
                value={sRoll}
                onChange={e => setSRoll(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-900 bg-white"
              />
              <input
                placeholder="Student Name *"
                value={sName}
                onChange={e => setSName(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-900 bg-white"
              />
              <input
                placeholder="Father Name"
                value={sFather}
                onChange={e => setSFather(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-900 bg-white"
              />
              <button
                onClick={handleAddStudent}
                disabled={!sName.trim()}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Roll number auto-suggests. Just enter name and press Add.</p>
          </div>

          {/* Student List */}
          <div className="p-6">
            {editingClass.students.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No students yet. Add your first student above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {editingClass.students.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-4 bg-white border rounded-xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                        {s.rollNo}
                      </span>
                      <div>
                        <p className="font-bold text-gray-800">{s.name}</p>
                        <p className="text-sm text-gray-500">{s.fatherName || 'No father name'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStudent(s.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
                      title="Remove Student"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -- Render Create/List Mode --
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Users className="text-indigo-600" /> Manage Classes
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create New Class Form */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-indigo-600" /> Create New Class
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Enter class name (e.g., Class 9-A)"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-900 bg-white placeholder-gray-400"
            />

            <button
              onClick={handleSaveNewClass}
              disabled={!className.trim()}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!className.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02]'
                }`}
            >
              <Save size={20} /> Create Class & Add Students
            </button>

            <p className="text-xs text-gray-500 text-center">
              Create class first, then add students inside the class
            </p>
          </div>
        </div>

        {/* Existing Classes List */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Your Classes</h3>
          {classes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-50" />
              <p>No classes yet. Create your first class!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((c) => (
                <div key={c.id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-300 transition-all bg-gradient-to-r from-gray-50 to-white group">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">{c.name}</h4>
                      <p className="text-sm text-gray-500">{c.students.length} Students</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClass(c)}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-all flex items-center gap-1"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClass(c.id)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-all"
                        title="Delete Class"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassManager;