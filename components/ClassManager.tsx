import React, { useState } from 'react';
import { ClassGroup, Student } from '../types';
import { Plus, Trash2, Save, UserPlus, Edit, ArrowLeft } from 'lucide-react';

interface ClassManagerProps {
  classes: ClassGroup[];
  addClass: (newClass: ClassGroup) => void;
  updateClass: (updatedClass: ClassGroup) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ classes, addClass, updateClass }) => {
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  
  // Create Mode States
  const [className, setClassName] = useState('');
  const [tempStudents, setTempStudents] = useState<Student[]>([]);
  
  // Student Form States (Used for both Create and Edit)
  const [sName, setSName] = useState('');
  const [sFather, setSFather] = useState('');
  const [sRoll, setSRoll] = useState('');

  // -- Handlers for Creating New Class --
  const handleAddStudentToTemp = () => {
    if (!sName || !sRoll) return;
    const newStudent: Student = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: sName,
      fatherName: sFather,
      rollNo: sRoll
    };
    setTempStudents([...tempStudents, newStudent]);
    resetStudentForm();
  };

  const handleSaveNewClass = () => {
    if (!className) return;
    const newClass: ClassGroup = {
      id: Date.now().toString(),
      name: className,
      students: tempStudents
    };
    addClass(newClass);
    setClassName('');
    setTempStudents([]);
    alert("Class saved successfully!");
  };

  const removeTempStudent = (id: string) => {
    setTempStudents(tempStudents.filter(s => s.id !== id));
  };

  // -- Handlers for Editing Existing Class --
  const handleEditClass = (cls: ClassGroup) => {
    setEditingClass(cls);
  };

  const handleAddStudentToExisting = () => {
    if (!editingClass || !sName || !sRoll) return;
    const newStudent: Student = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: sName,
      fatherName: sFather,
      rollNo: sRoll
    };
    const updatedClass = {
      ...editingClass,
      students: [...editingClass.students, newStudent]
    };
    setEditingClass(updatedClass);
    updateClass(updatedClass);
    resetStudentForm();
  };

  const removeStudentFromExisting = (studentId: string) => {
    if (!editingClass) return;
    if (confirm("Are you sure you want to remove this student?")) {
        const updatedClass = {
            ...editingClass,
            students: editingClass.students.filter(s => s.id !== studentId)
        };
        setEditingClass(updatedClass);
        updateClass(updatedClass);
    }
  };

  const resetStudentForm = () => {
    setSName('');
    setSFather('');
    setSRoll('');
  };

  // -- Render Edit Mode --
  if (editingClass) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
            <button 
                onClick={() => setEditingClass(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-indigo-900">Edit Class: {editingClass.name}</h2>
                <p className="text-gray-500 text-sm">Add or remove students from this class</p>
            </div>
        </div>

        {/* Add Student Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <p className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <UserPlus size={18}/> Add New Student
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input 
                  placeholder="Roll No / Serial No" 
                  value={sRoll}
                  onChange={e => setSRoll(e.target.value)}
                  className="p-2 text-sm border rounded-md text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                  placeholder="Student Name" 
                  value={sName}
                  onChange={e => setSName(e.target.value)}
                  className="p-2 text-sm border rounded-md text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                  placeholder="Father Name" 
                  value={sFather}
                  onChange={e => setSFather(e.target.value)}
                  className="p-2 text-sm border rounded-md text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <button
                onClick={handleAddStudentToExisting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
                Add Student
            </button>
        </div>

        {/* Student List */}
        <div>
            <h3 className="font-bold text-gray-800 mb-3">Enrolled Students ({editingClass.students.length})</h3>
            <div className="bg-white border rounded-lg divide-y divide-gray-100">
                {editingClass.students.length === 0 ? (
                    <p className="p-4 text-center text-gray-400 italic">No students in this class.</p>
                ) : (
                    editingClass.students.map((s, idx) => (
                        <div key={s.id} className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                                    {s.rollNo}
                                </span>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{s.name}</p>
                                    <p className="text-xs text-gray-500">{s.fatherName}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeStudentFromExisting(s.id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
                                title="Remove Student"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    );
  }

  // -- Render Create/List Mode --
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Classes</h2>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Create New Class Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <Plus size={20} /> Create New Class
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., 9th Grade - Section A"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-600 mb-3">Add Initial Students</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input 
                  placeholder="Roll/Serial" 
                  value={sRoll}
                  onChange={e => setSRoll(e.target.value)}
                  className="p-2 text-sm border rounded-md text-gray-900 bg-white placeholder-gray-400"
                />
                <input 
                  placeholder="Name" 
                  value={sName}
                  onChange={e => setSName(e.target.value)}
                  className="p-2 text-sm border rounded-md text-gray-900 bg-white placeholder-gray-400"
                />
                <input 
                  placeholder="Father Name" 
                  value={sFather}
                  onChange={e => setSFather(e.target.value)}
                  className="p-2 text-sm border rounded-md text-gray-900 bg-white placeholder-gray-400"
                />
              </div>
              <button
                onClick={handleAddStudentToTemp}
                className="w-full flex items-center justify-center gap-2 text-sm bg-indigo-50 text-indigo-700 py-2 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <UserPlus size={16} /> Add to List
              </button>
            </div>

            {tempStudents.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">{tempStudents.length} Students added:</p>
                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2 bg-gray-50">
                  {tempStudents.map((s, idx) => (
                    <div key={s.id} className="flex justify-between items-center text-sm p-1 bg-white rounded shadow-sm">
                      <span className="text-gray-800">{idx + 1}. <b>{s.name}</b> (Roll: {s.rollNo})</span>
                      <button onClick={() => removeTempStudent(s.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSaveNewClass}
              disabled={!className || tempStudents.length === 0}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                !className || tempStudents.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
              }`}
            >
              <Save size={20} /> Save Class
            </button>
          </div>
        </div>

        {/* Existing Classes List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Classes</h3>
          {classes.length === 0 ? (
            <p className="text-gray-400 italic">No classes found. Create one to get started.</p>
          ) : (
            <div className="space-y-3">
              {classes.map((c) => (
                <div key={c.id} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-all bg-gray-50 flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-indigo-900">{c.name}</h4>
                    <p className="text-sm text-gray-600">{c.students.length} Students</p>
                  </div>
                  <button 
                    onClick={() => handleEditClass(c)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all"
                  >
                    <Edit size={14} /> Edit
                  </button>
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