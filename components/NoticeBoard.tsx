import React, { useState, useRef } from 'react';
import { Notice, NoticeType } from '../types';
import { Bell, Plus, Trash2, Download, Share2, Calendar, CheckCircle } from 'lucide-react';

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

    // Professional notice types with elegant colors
    const noticeTypes: { value: NoticeType; label: string; icon: string; color: string }[] = [
        { value: 'holiday', label: 'Holiday', icon: '🏖️', color: 'emerald' },
        { value: 'announcement', label: 'Announcement', icon: '📢', color: 'indigo' },
        { value: 'important', label: 'Important', icon: '⚠️', color: 'amber' },
        { value: 'event', label: 'Event', icon: '🎉', color: 'purple' },
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

    const getTypeConfig = (t: NoticeType) => {
        const configs = {
            holiday: { bg: 'bg-emerald-600', gradient: 'from-emerald-600 to-teal-700', light: 'bg-emerald-100', text: 'text-emerald-700' },
            announcement: { bg: 'bg-indigo-600', gradient: 'from-indigo-600 to-blue-700', light: 'bg-indigo-100', text: 'text-indigo-700' },
            important: { bg: 'bg-amber-600', gradient: 'from-amber-600 to-orange-700', light: 'bg-amber-100', text: 'text-amber-700' },
            event: { bg: 'bg-purple-600', gradient: 'from-purple-600 to-violet-700', light: 'bg-purple-100', text: 'text-purple-700' },
        };
        return configs[t];
    };

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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notice Type</label>
                        <div className="flex flex-wrap gap-2">
                            {noticeTypes.map((nt) => {
                                const config = getTypeConfig(nt.value);
                                return (
                                    <button
                                        key={nt.value}
                                        onClick={() => setType(nt.value)}
                                        className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-medium ${type === nt.value
                                                ? `${config.bg} text-white shadow-lg`
                                                : `${config.light} ${config.text} hover:shadow-md`
                                            }`}
                                    >
                                        {nt.icon} {nt.label}
                                    </button>
                                );
                            })}
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
                    const config = getTypeConfig(notice.type);
                    const typeInfo = noticeTypes.find(t => t.value === notice.type)!;
                    return (
                        <div
                            key={notice.id}
                            onClick={() => setSelectedNotice(notice)}
                            className={`p-5 rounded-2xl shadow-sm border-l-4 cursor-pointer hover:shadow-lg transition-all bg-white ${config.bg.replace('bg-', 'border-')
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${config.light} ${config.text}`}>
                                    {typeInfo.icon} {typeInfo.label}
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
                                <Calendar size={14} /> {new Date(notice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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

            {/* Notice Slide Preview Modal - Professional Design */}
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
                        <div
                            ref={slideRef}
                            className="p-8 relative"
                            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)' }}
                        >
                            {/* Header with Logo */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-full border-3 border-white/30 overflow-hidden bg-white shadow-lg flex items-center justify-center">
                                        <img src="/school-logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs font-medium tracking-wider">ROOTS OF WISDOM</p>
                                        <p className="text-white font-bold">School & College</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-bold ${getTypeConfig(selectedNotice.type).light} ${getTypeConfig(selectedNotice.type).text}`}>
                                    {noticeTypes.find(t => t.value === selectedNotice.type)?.icon} {noticeTypes.find(t => t.value === selectedNotice.type)?.label}
                                </div>
                            </div>

                            {/* Notice Content */}
                            <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b pb-4">{selectedNotice.title}</h2>
                                <p className="text-gray-700 leading-relaxed text-center">{selectedNotice.description || 'No additional details provided.'}</p>
                            </div>

                            {/* Date */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-xl flex items-center gap-2 text-white">
                                    <Calendar size={18} />
                                    <span className="font-medium">{new Date(selectedNotice.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/20">
                                <div className="text-white/50 text-xs">Powered by Ustaz.AI</div>
                                <div className="flex items-center gap-2 text-white/70">
                                    <CheckCircle size={18} />
                                    <span className="text-sm">Official Notice</span>
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
