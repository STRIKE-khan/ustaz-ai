import React, { useState, useRef } from 'react';
import { Notice, NoticeType } from '../types';
import { Bell, Plus, Trash2, Download, Share2, Calendar, Pin } from 'lucide-react';

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

    const noticeTypes: { value: NoticeType; label: string; icon: string; paperColor: string; tapeColor: string }[] = [
        { value: 'holiday', label: 'Holiday', icon: '🏖️', paperColor: '#e8f5e9', tapeColor: '#81c784' },
        { value: 'announcement', label: 'Announcement', icon: '📢', paperColor: '#fff8e1', tapeColor: '#ffd54f' },
        { value: 'important', label: 'Important', icon: '⚠️', paperColor: '#ffebee', tapeColor: '#e57373' },
        { value: 'event', label: 'Event', icon: '🎉', paperColor: '#e8eaf6', tapeColor: '#7986cb' },
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
        const canvas = await html2canvas(slideRef.current, { scale: 2, backgroundColor: null });
        const link = document.createElement('a');
        link.download = `notice-${selectedNotice?.title || 'slide'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const shareSlide = async () => {
        if (!slideRef.current) return;
        try {
            const canvas = await html2canvas(slideRef.current, { scale: 2, backgroundColor: null });
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
                    <Bell className="text-amber-600" /> Notice Board
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all font-bold"
                >
                    <Plus size={20} /> Add Notice
                </button>
            </div>

            {/* Add Notice Form */}
            {showForm && (
                <div className="bg-amber-50 p-6 rounded-2xl shadow-lg mb-6 border-2 border-dashed border-amber-300 animate-fadeIn">
                    <h3 className="font-bold text-lg mb-4 text-amber-800">📝 Create New Notice</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Notice title..."
                                className="w-full p-4 border-2 border-amber-200 rounded-xl focus:border-amber-500 outline-none bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-4 border-2 border-amber-200 rounded-xl focus:border-amber-500 outline-none bg-white text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-amber-700 mb-2">Type</label>
                        <div className="flex flex-wrap gap-2">
                            {noticeTypes.map((nt) => (
                                <button
                                    key={nt.value}
                                    onClick={() => setType(nt.value)}
                                    style={{ backgroundColor: type === nt.value ? nt.tapeColor : 'white' }}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium border-2 transition-all ${type === nt.value ? 'text-white shadow-md border-transparent' : 'border-gray-200 text-gray-700'
                                        }`}
                                >
                                    {nt.icon} {nt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-amber-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Notice details..."
                            rows={3}
                            className="w-full p-4 border-2 border-amber-200 rounded-xl focus:border-amber-500 outline-none bg-white text-gray-900"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleSubmit} className="bg-amber-600 text-white px-8 py-3 rounded-xl hover:bg-amber-700 font-bold">
                            📌 Pin Notice
                        </button>
                        <button onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Notice List - Paper Style Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {notices.map((notice, idx) => {
                    const typeInfo = getTypeInfo(notice.type);
                    const rotation = idx % 2 === 0 ? 'rotate-1' : '-rotate-1';
                    return (
                        <div
                            key={notice.id}
                            onClick={() => setSelectedNotice(notice)}
                            className={`relative cursor-pointer hover:scale-105 transition-all ${rotation}`}
                            style={{ transform: `rotate(${idx % 3 - 1}deg)` }}
                        >
                            {/* Tape on top */}
                            <div
                                className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-6 rounded-sm shadow-sm z-10"
                                style={{ backgroundColor: typeInfo.tapeColor, opacity: 0.9 }}
                            ></div>

                            {/* Paper card */}
                            <div
                                className="p-5 pt-6 rounded-sm shadow-lg border border-gray-200 min-h-[160px] relative"
                                style={{
                                    backgroundColor: typeInfo.paperColor,
                                    boxShadow: '4px 4px 10px rgba(0,0,0,0.1)'
                                }}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotice(notice.id); }}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 size={14} />
                                </button>

                                <span className="text-2xl mb-2 block">{typeInfo.icon}</span>
                                <h4 className="font-bold text-gray-800 mb-2 text-lg" style={{ fontFamily: 'cursive, serif' }}>
                                    {notice.title}
                                </h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Calendar size={12} /> {new Date(notice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                {notices.length === 0 && (
                    <div className="col-span-full text-center py-16 text-gray-400">
                        <Pin size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No notices yet. Click "Add Notice" to pin one.</p>
                    </div>
                )}
            </div>

            {/* Notice Slide - Paper/Sticky Note Style */}
            {selectedNotice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b bg-gray-50">
                            <h3 className="font-bold text-gray-800">📄 Notice Preview</h3>
                            <div className="flex gap-2">
                                <button onClick={downloadSlide} className="p-2 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-200">
                                    <Download size={20} />
                                </button>
                                <button onClick={shareSlide} className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200">
                                    <Share2 size={20} />
                                </button>
                                <button onClick={() => setSelectedNotice(null)} className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200">
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Paper Note Slide Design */}
                        <div
                            ref={slideRef}
                            className="p-6 relative"
                            style={{
                                backgroundColor: '#f5f0e6',
                                backgroundImage: 'repeating-linear-gradient(#f5f0e6 0px, #f5f0e6 24px, #e0d6c8 25px)'
                            }}
                        >
                            {/* Tape strips */}
                            <div
                                className="absolute top-0 left-4 w-12 h-8"
                                style={{ backgroundColor: getTypeInfo(selectedNotice.type).tapeColor, transform: 'rotate(-5deg)', opacity: 0.85 }}
                            ></div>
                            <div
                                className="absolute top-0 right-4 w-12 h-8"
                                style={{ backgroundColor: getTypeInfo(selectedNotice.type).tapeColor, transform: 'rotate(5deg)', opacity: 0.85 }}
                            ></div>

                            {/* School header */}
                            <div className="flex items-center justify-center gap-3 mb-6 mt-4">
                                <div className="p-1 bg-white border-2 border-dashed border-gray-300 shadow-sm rotate-[-2deg]">
                                    <img src="/school-logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                                </div>
                                <div className="text-center">
                                    <h1 className="text-xl font-bold text-gray-800 uppercase" style={{ fontFamily: 'Georgia, serif' }}>ROOTS OF WISDOM</h1>
                                    <p className="text-xs text-gray-600">Est. 1990</p>
                                </div>
                            </div>

                            {/* Type badge */}
                            <div className="flex justify-center mb-4">
                                <span
                                    className="px-4 py-2 rounded-full text-white font-bold text-sm shadow-md"
                                    style={{ backgroundColor: getTypeInfo(selectedNotice.type).tapeColor }}
                                >
                                    {getTypeInfo(selectedNotice.type).icon} {getTypeInfo(selectedNotice.type).label}
                                </span>
                            </div>

                            {/* Title - handwritten style */}
                            <h2
                                className="text-2xl font-bold text-gray-800 text-center mb-4 pb-3 border-b-2 border-dashed border-gray-300"
                                style={{ fontFamily: 'Georgia, serif' }}
                            >
                                {selectedNotice.title}
                            </h2>

                            {/* Content */}
                            <p
                                className="text-gray-700 text-center leading-relaxed mb-6"
                                style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}
                            >
                                {selectedNotice.description || '(No details provided)'}
                            </p>

                            {/* Date */}
                            <div className="flex justify-center mb-4">
                                <div className="bg-white/80 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-600 shadow-sm">
                                    <Calendar size={16} />
                                    <span className="font-medium">
                                        {new Date(selectedNotice.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center pt-4 border-t border-dashed border-gray-300">

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;
