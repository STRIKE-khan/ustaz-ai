import React, { useState, useRef } from 'react';
import { Notice, NoticeType } from '../types';
import { Bell, Plus, Trash2, Download, Share2, Calendar, AlertTriangle, PartyPopper, Megaphone } from 'lucide-react';

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

    const noticeTypes: { value: NoticeType; label: string; icon: React.ReactNode; color: string }[] = [
        { value: 'holiday', label: 'Holiday', icon: <PartyPopper size={18} />, color: 'bg-green-500' },
        { value: 'announcement', label: 'Announcement', icon: <Megaphone size={18} />, color: 'bg-blue-500' },
        { value: 'important', label: 'Important', icon: <AlertTriangle size={18} />, color: 'bg-red-500' },
        { value: 'event', label: 'Event', icon: <Calendar size={18} />, color: 'bg-purple-500' },
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
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="text-indigo-600" /> Notice Board
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all"
                >
                    <Plus size={20} /> Add Notice
                </button>
            </div>

            {/* Add Notice Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100 animate-fadeIn">
                    <h3 className="font-bold text-lg mb-4">Create New Notice</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Notice title..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <div className="flex flex-wrap gap-2">
                            {noticeTypes.map((nt) => (
                                <button
                                    key={nt.value}
                                    onClick={() => setType(nt.value)}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${type === nt.value
                                            ? `${nt.color} text-white`
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {nt.icon} {nt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Notice details..."
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSubmit}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
                        >
                            Save Notice
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

            {/* Notice List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {notices.map((notice) => {
                    const typeInfo = getTypeInfo(notice.type);
                    return (
                        <div
                            key={notice.id}
                            onClick={() => setSelectedNotice(notice)}
                            className={`p-4 rounded-xl shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all bg-white ${notice.type === 'holiday' ? 'border-green-500' :
                                    notice.type === 'important' ? 'border-red-500' :
                                        notice.type === 'event' ? 'border-purple-500' : 'border-blue-500'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-1 rounded text-xs text-white ${typeInfo.color}`}>
                                    {typeInfo.label}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotice(notice.id); }}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">{notice.title}</h4>
                            <p className="text-sm text-gray-500">{notice.date}</p>
                        </div>
                    );
                })}
                {notices.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        No notices yet. Click "Add Notice" to create one.
                    </div>
                )}
            </div>

            {/* Notice Slide Preview */}
            {selectedNotice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b">
                            <h3 className="font-bold">Notice Preview</h3>
                            <div className="flex gap-2">
                                <button onClick={downloadSlide} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200">
                                    <Download size={20} />
                                </button>
                                <button onClick={shareSlide} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                                    <Share2 size={20} />
                                </button>
                                <button onClick={() => setSelectedNotice(null)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Slide Design */}
                        <div ref={slideRef} className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                            <div className="text-center mb-6">
                                <span className="text-sm opacity-80">📢 NOTICE</span>
                                <h2 className="text-2xl font-bold mt-2">{selectedNotice.title}</h2>
                            </div>

                            <div className="bg-white bg-opacity-20 backdrop-blur rounded-xl p-6 mb-4">
                                <p className="text-lg leading-relaxed">{selectedNotice.description || 'No description provided.'}</p>
                            </div>

                            <div className="flex justify-between items-center text-sm opacity-80">
                                <span>📅 {selectedNotice.date}</span>
                                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                                    {getTypeInfo(selectedNotice.type).label}
                                </span>
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

export default NoticeBoard;
