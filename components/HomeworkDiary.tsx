import React, { useState, useRef } from 'react';
import { ClassGroup, Homework } from '../types';
import { BookOpen, Plus, Trash2, Download, Share2, Calendar, Clock } from 'lucide-react';

declare const html2canvas: any;

interface HomeworkDiaryProps {
    classes: ClassGroup[];
    homework: Homework[];
    addHomework: (hw: Homework) => void;
    deleteHomework: (id: string) => void;
}

const HomeworkDiary: React.FC<HomeworkDiaryProps> = ({ classes, homework, addHomework, deleteHomework }) => {
    const [showForm, setShowForm] = useState(false);
    const [classId, setClassId] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
    const slideRef = useRef<HTMLDivElement>(null);

    const today = new Date().toISOString().split('T')[0];

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
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="text-indigo-600" /> Homework Diary
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all"
                >
                    <Plus size={20} /> Assign Homework
                </button>
            </div>

            {/* Add Homework Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100 animate-fadeIn">
                    <h3 className="font-bold text-lg mb-4">Assign New Homework</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <select
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="">Select Class...</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Mathematics"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Homework Details</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the homework assignment..."
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            min={today}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSubmit}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
                        >
                            Save Homework
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all"
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
                            className={`p-4 rounded-xl shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all bg-white ${isOverdue ? 'border-red-500' : isDueToday ? 'border-yellow-500' : 'border-green-500'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                                    {getClassName(hw.classId)}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteHomework(hw.id); }}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">{hw.subject}</h4>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{hw.description}</p>
                            <div className="flex items-center gap-2 text-xs">
                                <Clock size={14} className={isOverdue ? 'text-red-500' : isDueToday ? 'text-yellow-500' : 'text-green-500'} />
                                <span className={isOverdue ? 'text-red-500' : isDueToday ? 'text-yellow-500' : 'text-green-500'}>
                                    {daysLeft}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {homework.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        No homework assigned. Click "Assign Homework" to create one.
                    </div>
                )}
            </div>

            {/* Homework Slide Preview */}
            {selectedHomework && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b">
                            <h3 className="font-bold">Homework Slide</h3>
                            <div className="flex gap-2">
                                <button onClick={downloadSlide} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200">
                                    <Download size={20} />
                                </button>
                                <button onClick={shareSlide} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                                    <Share2 size={20} />
                                </button>
                                <button onClick={() => setSelectedHomework(null)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Slide Design */}
                        <div ref={slideRef} className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                            <div className="text-center mb-4">
                                <span className="text-sm opacity-80">📚 HOMEWORK</span>
                                <h2 className="text-xl font-bold mt-1">{getClassName(selectedHomework.classId)}</h2>
                            </div>

                            <div className="bg-white text-gray-800 rounded-xl p-5 mb-4 shadow-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <BookOpen size={20} className="text-indigo-600" />
                                    <span className="font-bold text-indigo-600">{selectedHomework.subject}</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{selectedHomework.description}</p>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Assigned: {selectedHomework.assignedDate}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                                    <Clock size={16} />
                                    <span>Due: {selectedHomework.dueDate}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white border-opacity-30 text-center text-xs opacity-60">
                                Ustaz.AI - Classroom Assistant
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeworkDiary;
