import React, { useState, useRef } from 'react';
import { Notice, NoticeType } from '../types';
import { Bell, Plus, Trash2, Download, Share2, Calendar, AlertTriangle, PartyPopper, Megaphone, Star, CheckCircle } from 'lucide-react';

declare const html2canvas: any;

interface NoticeBoardProps {
    notices: Notice[];
    addNotice: (notice: Notice) => void;
    deleteNotice: (id: string) => void;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices, addNotice, deleteNotice }) => {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<NoticeType>('announcement');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const slideRef = useRef<HTMLDivElement>(null);

    const noticeTypes: { value: NoticeType; label: string; icon: React.ReactNode; color: string; bgGradient: string }[] = [
        { value: 'holiday', label: 'Holiday', icon: <PartyPopper size={18} />, color: 'bg-green-500', bgGradient: 'from-green-600 to-emerald-700' },
        { value: 'announcement', label: 'Announcement', icon: <Megaphone size={18} />, color: 'bg-blue-500', bgGradient: 'from-blue-600 to-indigo-700' },
        { value: 'important', label: 'Important', icon: <AlertTriangle size={18} />, color: 'bg-red-500', bgGradient: 'from-red-600 to-rose-700' },
        { value: 'event', label: 'Event', icon: <Star size={18} />, color: 'bg-purple-500', bgGradient: 'from-purple-600 to-violet-700' },
    ];

    const handleSubmit = () => {
        if (!title.trim()) return;

        const newNotice: Notice = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            type,
            date,
            createdAt: new Date().toISOString(),
        };

        addNotice(newNotice);
        setTitle('');
        setDescription('');
        setType('announcement');
        setShowForm(false);
    };

    const downloadSlide = async () => {
        if (!slideRef.current) return;
        const canvas = await html2canvas(slideRef.current, { scale: 2 });
        const link = document.createElement('a');
        link.download = `notice-${selectedNotice?.title || 'slide'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const shareSlide = async () => {
        if (!slideRef.current) return;
        try {
            const canvas = await html2canvas(slideRef.current, { scale: 2 });
            canvas.toBlob(async (blob: Blob | null) => {
                if (!blob) return;
                const file = new File([blob], 'notice.png', { type: 'image/png' });
                if (navigator.share) {
                    await navigator.share({ files: [file], title: 'Notice' });
                }
            });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const getTypeInfo = (t: NoticeType) => noticeTypes.find(nt => nt.value === t)!;

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="text-indigo-600" /> Notice Board
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all font-bold"
                >
                    <Plus size={20} /> Add Notice
                </button>
            </div>

            {/* Add Notice Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-100 animate-fadeIn">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Create New Notice</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Notice title..."
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-colors text-gray-900 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-colors text-gray-900 bg-white"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <div className="flex flex-wrap gap-2">
                            {noticeTypes.map((nt) => (
                                <button
                                    key={nt.value}
                                    onClick={() => setType(nt.value)}
                                    className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-medium ${type === nt.value
                                            ? `${nt.color} text-white shadow-lg`
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {nt.icon} {nt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Notice details..."
                            rows={3}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-colors text-gray-900 bg-white"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-bold"
                        >
                            Save Notice
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

            {/* Notice List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {notices.map((notice) => {
                    const typeInfo = getTypeInfo(notice.type);
                    return (
                        <div
                            key={notice.id}
                            onClick={() => setSelectedNotice(notice)}
                            className={`p-5 rounded-2xl shadow-sm border-l-4 cursor-pointer hover:shadow-lg transition-all bg-white ${notice.type === 'holiday' ? 'border-green-500' :
                                    notice.type === 'important' ? 'border-red-500' :
                                        notice.type === 'event' ? 'border-purple-500' : 'border-blue-500'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs text-white font-bold ${typeInfo.color}`}>
                                    {typeInfo.label}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotice(notice.id); }}
                                    className="text-red-400 hover:text-red-600 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-lg">{notice.title}</h4>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar size={14} /> {notice.date}
                            </p>
                        </div>
                    );
                })}
                {notices.length === 0 && (
                    <div className="col-span-full text-center py-16 text-gray-400">
                        <Bell size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No notices yet. Click "Add Notice" to create one.</p>
                    </div>
                )}
            </div>

            {/* Notice Slide Preview Modal */}
            {selectedNotice && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b bg-gray-50">
                            <h3 className="font-bold text-gray-800">Notice Preview</h3>
                            <div className="flex gap-2">
                                <button onClick={downloadSlide} className="p-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors">
                                    <Download size={20} />
                                </button>
                                <button onClick={shareSlide} className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors">
                                    <Share2 size={20} />
                                </button>
                                <button onClick={() => setSelectedNotice(null)} className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Professional Slide Design */}
                        <div ref={slideRef} className={`p-8 bg-gradient-to-br ${getTypeInfo(selectedNotice.type).bgGradient} text-white relative`}>
                            {/* School Logo */}
                            <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-full p-2 shadow-lg">
                                <img src="/school-logo.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-sm opacity-80 font-medium tracking-wider">ROOTS OF WISDOM SCHOOL & COLLEGE</p>
                                <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                                    {getTypeInfo(selectedNotice.type).icon}
                                    <span className="font-bold uppercase text-sm">{getTypeInfo(selectedNotice.type).label}</span>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold mt-4">{selectedNotice.title}</h2>
                            </div>

                            <div className="bg-white text-gray-800 rounded-2xl p-6 mb-6 shadow-xl">
                                <p className="text-lg leading-relaxed">{selectedNotice.description || 'No description provided.'}</p>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 opacity-80">
                                    <Calendar size={16} /> {new Date(selectedNotice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>

                            {/* Footer with Signature */}
                            <div className="mt-8 pt-4 border-t border-white/30 flex justify-between items-end">
                                <div className="text-xs opacity-60">Powered by Ustaz.AI</div>
                                <div className="text-center">
                                    <div className="flex justify-center mb-1">
                                        <CheckCircle size={24} />
                                    </div>
                                    <span className="text-xs opacity-80">Principal's Seal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;
