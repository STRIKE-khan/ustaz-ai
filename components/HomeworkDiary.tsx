import React, { useState, useRef } from 'react';
import { ClassGroup, Homework } from '../types';
import { BookOpen, Plus, Trash2, Download, Share2, Calendar, Clock, CheckCircle } from 'lucide-react';

declare const html2canvas: any;

interface HomeworkDiaryProps {
    classes: ClassGroup[];
    homework: Homework[];
    addHomework: (hw: Homework) => void;
    deleteHomework: (id: string) => void;
}

// Subject suggestions based on class level
const getSubjectSuggestions = (className: string): string[] => {
    const name = className.toLowerCase();

    if (name.includes('9') || name.includes('10') || name.includes('matric')) {
        return ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Urdu', 'Islamiat', 'Pakistan Studies', 'Computer Science'];
    } else if (name.includes('11') || name.includes('12') || name.includes('inter') || name.includes('fsc')) {
        return ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Urdu', 'Computer Science'];
    } else if (name.includes('6') || name.includes('7') || name.includes('8')) {
        return ['English', 'Urdu', 'Mathematics', 'Science', 'Social Studies', 'Islamiat', 'Arabic'];
    } else {
        return ['Urdu', 'English', 'Mathematics', 'Nazra/Quran', 'Drawing', 'General Science', 'Islamiat'];
    }
};

const HomeworkDiary: React.FC<HomeworkDiaryProps> = ({ classes, homework, addHomework, deleteHomework }) => {
    const [showForm, setShowForm] = useState(false);
    const [classId, setClassId] = useState('');
    const [subject, setSubject] = useState('');
    const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
    const slideRef = useRef<HTMLDivElement>(null);

    const today = new Date().toISOString().split('T')[0];
    const selectedClass = classes.find(c => c.id === classId);
    const subjectSuggestions = selectedClass ? getSubjectSuggestions(selectedClass.name) : [];

    const handleSubmit = () => {
        if (!classId || !subject.trim() || !description.trim() || !dueDate) return;

        const newHomework: Homework = {
            id: Date.now().toString(),
            classId,
            subject: subject.trim(),
            description: description.trim(),
            assignedDate: today,
            dueDate,
            createdAt: new Date().toISOString(),
        };

        addHomework(newHomework);
        setClassId('');
        setSubject('');
        setDescription('');
        setDueDate('');
        setShowForm(false);
    };

    const downloadSlide = async () => {
        if (!slideRef.current) return;
        const canvas = await html2canvas(slideRef.current, { scale: 2 });
        const link = document.createElement('a');
        link.download = `homework-${selectedHomework?.subject || 'slide'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const shareSlide = async () => {
        if (!slideRef.current) return;
        try {
            const canvas = await html2canvas(slideRef.current, { scale: 2 });
            canvas.toBlob(async (blob: Blob | null) => {
                if (!blob) return;
                const file = new File([blob], 'homework.png', { type: 'image/png' });
                if (navigator.share) {
                    await navigator.share({ files: [file], title: 'Homework' });
                }
            });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const getClassName = (id: string) => classes.find(c => c.id === id)?.name || 'Unknown';

    const getDaysRemaining = (due: string) => {
        const diff = new Date(due).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Due Today';
        if (days === 1) return '1 day left';
        return `${days} days left`;
    };

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="text-indigo-600" /> Homework Diary
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all font-bold"
                >
                    <Plus size={20} /> Assign Homework
                </button>
            </div>

            {/* Add Homework Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-100 animate-fadeIn">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Assign New Homework</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                            <select
                                value={classId}
                                onChange={(e) => { setClassId(e.target.value); setSubject(''); }}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-colors text-gray-900 bg-white"
                            >
                                <option value="">Select Class...</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                onFocus={() => setShowSubjectSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSubjectSuggestions(false), 200)}
                                placeholder="Type or select subject..."
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-colors text-gray-900 bg-white"
                            />
                            {showSubjectSuggestions && subjectSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                    {subjectSuggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-gray-800 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                            onMouseDown={() => setSubject(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                    <button
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 text-indigo-600 font-medium border-t"
                                        onMouseDown={() => setShowSubjectSuggestions(false)}
                                    >
                                        + Custom Subject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Homework Details</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the homework assignment..."
                            rows={3}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-colors text-gray-900 bg-white"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            min={today}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-colors text-gray-900 bg-white"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-bold"
                        >
                            Save Homework
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Homework List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {homework.map((hw) => {
                    const daysLeft = getDaysRemaining(hw.dueDate);
                    const isOverdue = daysLeft === 'Overdue';
                    const isDueToday = daysLeft === 'Due Today';

                    return (
                        <div
                            key={hw.id}
                            onClick={() => setSelectedHomework(hw)}
                            className={`p-5 rounded-2xl shadow-sm border-l-4 cursor-pointer hover:shadow-lg transition-all bg-white ${isOverdue ? 'border-red-500' : isDueToday ? 'border-yellow-500' : 'border-green-500'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                    {getClassName(hw.classId)}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteHomework(hw.id); }}
                                    className="text-red-400 hover:text-red-600 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-lg">{hw.subject}</h4>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{hw.description}</p>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={14} className={isOverdue ? 'text-red-500' : isDueToday ? 'text-yellow-500' : 'text-green-500'} />
                                <span className={`font-medium ${isOverdue ? 'text-red-500' : isDueToday ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {daysLeft}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {homework.length === 0 && (
                    <div className="col-span-full text-center py-16 text-gray-400">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No homework assigned. Click "Assign Homework" to create one.</p>
                    </div>
                )}
            </div>

            {/* Homework Slide Preview Modal */}
            {selectedHomework && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b bg-gray-50">
                            <h3 className="font-bold text-gray-800">Homework Slide</h3>
                            <div className="flex gap-2">
                                <button onClick={downloadSlide} className="p-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors">
                                    <Download size={20} />
                                </button>
                                <button onClick={shareSlide} className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors">
                                    <Share2 size={20} />
                                </button>
                                <button onClick={() => setSelectedHomework(null)} className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Slide Design */}
                        <div ref={slideRef} className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white relative">
                            {/* School Logo */}
                            <div className="absolute top-4 right-4 w-14 h-14 bg-white rounded-full p-2 shadow-lg">
                                <img src="/school-logo.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>

                            <div className="text-center mb-4">
                                <p className="text-sm opacity-80 font-medium tracking-wider">ROOTS OF WISDOM SCHOOL & COLLEGE</p>
                                <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                                    <BookOpen size={18} />
                                    <span className="font-bold uppercase text-sm">Homework</span>
                                </div>
                                <h2 className="text-xl font-bold mt-3">{getClassName(selectedHomework.classId)}</h2>
                            </div>

                            <div className="bg-white text-gray-800 rounded-2xl p-5 mb-4 shadow-xl">
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                                    <BookOpen size={20} className="text-indigo-600" />
                                    <span className="font-bold text-indigo-600 text-lg">{selectedHomework.subject}</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{selectedHomework.description}</p>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 opacity-80">
                                    <Calendar size={16} />
                                    <span>Assigned: {new Date(selectedHomework.assignedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                </div>
                                <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                                    <Clock size={16} />
                                    <span className="font-bold">Due: {new Date(selectedHomework.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>

                            {/* Footer with Signature */}
                            <div className="mt-8 pt-4 border-t border-white/30 flex justify-between items-end">
                                <div className="text-xs opacity-60">Powered by Ustaz.AI</div>
                                <div className="text-center">
                                    <div className="flex justify-center mb-1">
                                        <CheckCircle size={24} />
                                    </div>
                                    <span className="text-xs opacity-80">Teacher's Sign</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeworkDiary;
