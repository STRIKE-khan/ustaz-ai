import React, { useState, useRef, useMemo } from 'react';
import { ClassGroup, Homework } from '../types';
import { BookOpen, Plus, Trash2, Download, Share2, Clock, CheckCircle, X, ChevronDown, Edit2 } from 'lucide-react';
import html2canvas from 'html2canvas';

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
        return ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Urdu', 'Islamiat', 'Pak Studies', 'Computer'];
    } else if (name.includes('11') || name.includes('12') || name.includes('inter')) {
        return ['Physics', 'Chemistry', 'Biology', 'Math', 'English', 'Urdu', 'Computer'];
    } else if (name.includes('6') || name.includes('7') || name.includes('8')) {
        return ['English', 'Urdu', 'Math', 'Science', 'S.Studies', 'Islamiat', 'Arabic', 'Computer'];
    } else {
        return ['Urdu', 'English', 'Math', 'Nazra', 'G.Science', 'Islamiat', 'Drawing'];
    }
};

const HomeworkDiary: React.FC<HomeworkDiaryProps> = ({ classes, homework, addHomework, deleteHomework }) => {
    const [showForm, setShowForm] = useState(false);
    const [classId, setClassId] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    // Multi-subject state
    const [diaryEntries, setDiaryEntries] = useState<{ id: string; subject: string; description: string }[]>([
        { id: '1', subject: '', description: '' }
    ]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [selectedDiaryGroup, setSelectedDiaryGroup] = useState<{ classId: string, date: string, items: Homework[] } | null>(null);
    const slideRef = useRef<HTMLDivElement>(null);

    const selectedClass = classes.find(c => c.id === classId);
    const subjectSuggestions = selectedClass ? getSubjectSuggestions(selectedClass.name) : [];

    // Group homework by Class + Due Date
    const groupedHomework = useMemo(() => {
        const groups: { [key: string]: { classId: string, date: string, items: Homework[] } } = {};
        homework.forEach(hw => {
            const key = `${hw.classId}-${hw.dueDate}`;
            if (!groups[key]) {
                groups[key] = { classId: hw.classId, date: hw.dueDate, items: [] };
            }
            groups[key].items.push(hw);
        });
        return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [homework]);

    const handleAddRow = () => {
        setDiaryEntries([...diaryEntries, { id: Date.now().toString(), subject: '', description: '' }]);
    };

    const handleRemoveRow = (id: string) => {
        if (diaryEntries.length > 1) {
            setDiaryEntries(diaryEntries.filter(e => e.id !== id));
        }
    };

    const handleEntryChange = (id: string, field: 'subject' | 'description', value: string) => {
        setDiaryEntries(diaryEntries.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleSubmit = () => {
        if (!classId || !dueDate) return;

        const validEntries = diaryEntries.filter(e => e.subject.trim() && e.description.trim());
        if (validEntries.length === 0) return;

        validEntries.forEach(entry => {
            const newHomework: Homework = {
                id: Date.now().toString() + Math.random(),
                classId,
                subject: entry.subject.trim(),
                description: entry.description.trim(),
                assignedDate: new Date().toISOString().split('T')[0],
                dueDate,
                createdAt: new Date().toISOString(),
            };
            addHomework(newHomework); // App.tsx handles state update
        });

        // Reset
        setClassId('');
        setDiaryEntries([{ id: Date.now().toString(), subject: '', description: '' }]);
        setShowForm(false);
    };

    const handleDeleteGroup = (group: { classId: string, items: Homework[] }) => {
        if (confirm('Delete this entire diary entry?')) {
            group.items.forEach(item => deleteHomework(item.id));
            if (selectedDiaryGroup?.items[0].id === group.items[0].id) setSelectedDiaryGroup(null);
        }
    };

    const downloadSlide = async () => {
        if (!slideRef.current) return;
        const canvas = await html2canvas(slideRef.current, { scale: 2, backgroundColor: null });
        const link = document.createElement('a');
        link.download = `Diary_${getClassName(selectedDiaryGroup?.classId || '')}_${selectedDiaryGroup?.date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const shareSlide = async () => {
        if (!slideRef.current) return;
        try {
            const canvas = await html2canvas(slideRef.current, { scale: 2, backgroundColor: null });
            canvas.toBlob(async (blob: any) => {
                if (!blob) return;
                const file = new File([blob], 'diary.png', { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: 'Homework Diary' });
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
        if (days === 1) return 'Tomorrow';
        return `in ${days} days`;
    };

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn pb-20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="text-indigo-600" /> Homework Diary
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all font-bold"
                >
                    <Plus size={20} /> Assign Diary
                </button>
            </div>

            {/* Creation Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-indigo-100 animate-slideUp">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-indigo-900">📝 New Diary Entry</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                            <select
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
                            >
                                <option value="">Select Class...</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <label className="block text-sm font-medium text-gray-700">Subjects & Tasks</label>
                        {diaryEntries.map((entry, index) => (
                            <div key={entry.id} className="flex gap-2 items-start animate-fadeIn relative z-10">
                                <div className="w-1/3 relative">
                                    <div className="relative">
                                        <input
                                            placeholder="Subject"
                                            value={entry.subject}
                                            onChange={(e) => handleEntryChange(entry.id, 'subject', e.target.value)}
                                            onFocus={() => setActiveDropdown(entry.id)}
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none pr-10"
                                        />
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === entry.id ? null : entry.id)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    {/* Custom Dropdown */}
                                    {activeDropdown === entry.id && subjectSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                            {subjectSuggestions.map(s => (
                                                <button
                                                    key={s}
                                                    onMouseDown={() => {
                                                        handleEntryChange(entry.id, 'subject', s);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 text-sm border-b last:border-0"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                            <button
                                                onMouseDown={() => {
                                                    handleEntryChange(entry.id, 'subject', '');
                                                    setActiveDropdown(null);
                                                    // This effectively clears it for custom typing if they want to start fresh or they can just type in the input directly
                                                }}
                                                className="w-full text-left px-4 py-2 bg-gray-50 text-indigo-600 font-bold text-sm hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <Edit2 size={14} /> Type Custom Subject
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <input
                                    placeholder="Task description..."
                                    value={entry.description}
                                    onChange={(e) => handleEntryChange(entry.id, 'description', e.target.value)}
                                    className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
                                />
                                {diaryEntries.length > 1 && (
                                    <button onClick={() => handleRemoveRow(entry.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={handleAddRow} className="text-indigo-600 font-medium text-sm flex items-center gap-1 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                            <Plus size={16} /> Add Subject
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={handleSubmit} className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg">Save Diary</button>
                    </div>
                </div>
            )}

            {/* Diary List (Grouped) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedHomework.map((group, idx) => {
                    const status = getDaysRemaining(group.date);
                    const isDueToday = status === 'Due Today';

                    return (
                        <div
                            key={`${group.classId}-${group.date}`}
                            onClick={() => setSelectedDiaryGroup(group)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:scale-105 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{getClassName(group.classId)}</h3>
                                    <p className={`text-sm font-medium ${isDueToday ? 'text-amber-600' : 'text-gray-500'}`}>
                                        Due: {new Date(group.date).toLocaleDateString()} ({status})
                                    </p>
                                </div>
                                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {group.items.length} Tasks
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {group.items.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                        <span className="font-semibold text-gray-800 w-20 truncate">{item.subject}:</span>
                                        <span className="truncate flex-1">{item.description}</span>
                                    </div>
                                ))}
                                {group.items.length > 3 && (
                                    <p className="text-xs text-gray-400 pl-4">+ {group.items.length - 3} more...</p>
                                )}
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group); }}
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )
                })}

                {groupedHomework.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-400">
                        <BookOpen size={64} className="mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-medium text-gray-500">No diaries found.</p>
                        <p className="text-sm">Create a new diary entry to get started.</p>
                    </div>
                )}
            </div>

            {/* Full Diary Preview Modal */}
            {selectedDiaryGroup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Toolbar */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Diary Preview</h3>
                            <div className="flex gap-2">
                                <button onClick={downloadSlide} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"><Download size={20} /></button>
                                <button onClick={shareSlide} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"><Share2 size={20} /></button>
                                <button onClick={() => setSelectedDiaryGroup(null)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><X size={20} /></button>
                            </div>
                        </div>

                        {/* Scrolling area */}
                        <div className="overflow-y-auto flex-1 bg-gray-200 p-4 flex justify-center">
                            {/* Paper Slide */}
                            <div
                                ref={slideRef}
                                className="bg-white w-full max-w-md min-h-[600px] p-8 relative shadow-xl"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(#fff 0px, #fff 24px, #e5e7eb 25px)',
                                    backgroundSize: '100% 25px'
                                }}
                            >
                                {/* Tape */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-200/80 rotate-1 shadow-sm opacity-90"></div>

                                {/* Header */}
                                <div className="flex items-center justify-center gap-3 mb-6 mt-6">
                                    <div className="p-1 bg-white border-dashed border-2 border-gray-300 shadow-sm rotate-[-2deg]">
                                        <img src="/school-logo.png" className="w-12 h-12 object-contain" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs tracking-widest text-gray-500 uppercase font-bold">Roots of Wisdom</p>
                                        <h1 className="text-xl font-bold text-gray-800 font-serif">Homework Diary</h1>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-b-2 border-gray-800 pb-2 mb-6 font-serif">
                                    <div>
                                        <span className="text-gray-500 text-xs uppercase tracking-wide">Class</span>
                                        <p className="font-bold text-lg">{getClassName(selectedDiaryGroup.classId)}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-500 text-xs uppercase tracking-wide">Due Date</span>
                                        <p className="font-bold text-lg text-red-600">{new Date(selectedDiaryGroup.date).toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>

                                {/* Tasks List */}
                                <div className="space-y-1">
                                    {selectedDiaryGroup.items.map((item, i) => (
                                        <div key={i} className="flex gap-4 py-2 items-baseline" style={{ lineHeight: '25px' }}>
                                            <div className="w-24 font-bold text-indigo-800 text-sm font-serif text-right shrink-0">
                                                {item.subject}
                                            </div>
                                            <div className="flex-1 text-gray-800 font-serif text-sm border-b border-gray-100 border-dashed pb-1">
                                                {item.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-6 left-0 right-0 text-center">
                                    <p className="font-handwriting text-gray-400 text-sm italic">"Review your lessons daily"</p>
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
