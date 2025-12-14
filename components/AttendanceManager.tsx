import React, { useState, useRef } from 'react';
import { ClassGroup, AttendanceStatus } from '../types';
import { Calendar, Save, CheckCircle, FileBarChart, Download, Share2, ArrowLeft } from 'lucide-react';

declare const html2canvas: any;

interface AttendanceManagerProps {
  classes: ClassGroup[];
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ classes }) => {
  const [view, setView] = useState<'MARK' | 'SLIDE'>('MARK');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendance, setAttendance] = useState<{ [id: string]: AttendanceStatus }>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const slideRef = useRef<HTMLDivElement>(null);
  const selectedClass = classes.find(c => c.id === selectedClassId);

  const handleClassSelect = (id: string) => {
    setSelectedClassId(id);
    const cls = classes.find(c => c.id === id);
    if (cls) {
      const initial: any = {};
      cls.students.forEach(s => initial[s.id] = AttendanceStatus.PRESENT);
      setAttendance(initial);
    }
  };

  const setStatus = (id: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const saveAttendance = () => {
    alert(`Attendance for ${selectedClass?.name} on ${date} marked locally! Click "Generate Slide" to share.`);
  };

  const downloadSlide = async () => {
    if (!slideRef.current) return;
    try {
      const canvas = await html2canvas(slideRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `Attendance_${selectedClass?.name}_${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const shareSlide = async () => {
    if (!slideRef.current) return;
    try {
      const canvas = await html2canvas(slideRef.current, { scale: 2, useCORS: true });
      canvas.toBlob(async (blob: any) => {
        if (!blob) return;
        const file = new File([blob], "attendance.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: `Attendance: ${selectedClass?.name}`,
                text: `Attendance Report for ${selectedClass?.name} - Date: ${date}`
            });
        } else {
            alert("Direct sharing is not supported on this device/browser. Please use the Download button.");
        }
      });
    } catch (err) {
      console.error("Share failed", err);
      alert("Failed to share image.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-indigo-600" /> Attendance
        </h2>
        {view === 'SLIDE' && (
            <button onClick={() => setView('MARK')} className="flex items-center text-indigo-600 text-sm font-semibold hover:underline">
                <ArrowLeft size={16} className="mr-1"/> Back to Marking
            </button>
        )}
      </div>

      {view === 'MARK' && (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                    <select 
                    className="w-full p-2 border rounded-md text-gray-900 bg-white"
                    value={selectedClassId}
                    onChange={e => handleClassSelect(e.target.value)}
                    >
                    <option value="">-- Select --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input 
                    type="date" 
                    className="w-full p-2 border rounded-md text-gray-900 bg-white"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    />
                </div>
                </div>
            </div>

            {selectedClass && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                    <h3 className="font-bold text-indigo-900">{selectedClass.name} Student List</h3>
                    <span className="text-sm text-indigo-600 font-medium">{selectedClass.students.length} Students</span>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {selectedClass.students.map(student => (
                    <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50">
                        <div className="mb-2 sm:mb-0">
                        <p className="font-semibold text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">Roll No: {student.rollNo}</p>
                        </div>
                        
                        <div className="flex gap-2">
                        {[AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LEAVE].map(status => (
                            <button
                            key={status}
                            onClick={() => setStatus(student.id, status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                attendance[student.id] === status
                                ? status === AttendanceStatus.PRESENT ? 'bg-green-600 text-white shadow-md'
                                : status === AttendanceStatus.ABSENT ? 'bg-red-600 text-white shadow-md'
                                : 'bg-yellow-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            >
                            {status}
                            </button>
                        ))}
                        </div>
                    </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button 
                    onClick={saveAttendance}
                    className="text-indigo-700 bg-indigo-100 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-200 transition-colors"
                    >
                    Save Draft
                    </button>
                    <button 
                    onClick={() => setView('SLIDE')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 shadow-md"
                    >
                    <FileBarChart size={18} /> Generate Slide
                    </button>
                </div>
                </div>
            )}
        </>
      )}

      {view === 'SLIDE' && selectedClass && (
        <div className="flex flex-col items-center gap-6">
            <div className="bg-gray-200 p-4 rounded-lg shadow-inner overflow-auto max-w-full">
                {/* Render Slide for Capture */}
                <div 
                    ref={slideRef}
                    className="bg-white p-8 min-w-[600px] relative"
                    style={{ background: 'linear-gradient(to bottom right, #ffffff, #f3f4f6)' }}
                >
                    <div className="border-b-2 border-indigo-600 pb-4 mb-4 flex justify-between items-end">
                        <div>
                            <div className="text-xs font-bold text-gray-500 tracking-widest mb-1">ROOTS OF WISDOM</div>
                            <h1 className="text-3xl font-bold text-indigo-900 uppercase">Attendance</h1>
                            <p className="text-lg text-indigo-700 font-medium">{selectedClass.name}</p>
                        </div>
                        <div className="text-right">
                             <h2 className="text-xl font-bold text-gray-800">{date}</h2>
                             <p className="text-gray-500 text-sm">Daily Report</p>
                        </div>
                    </div>

                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-indigo-600 text-white">
                                <th className="p-2 text-left">Roll No</th>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedClass.students.map((s, idx) => (
                                <tr key={s.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/50'}`}>
                                    <td className="p-2 font-mono text-gray-700">{s.rollNo}</td>
                                    <td className="p-2 font-semibold text-gray-800">{s.name}</td>
                                    <td className="p-2 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                            attendance[s.id] === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-800' :
                                            attendance[s.id] === AttendanceStatus.ABSENT ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {attendance[s.id] || AttendanceStatus.PRESENT}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="mt-8 flex justify-between items-end border-t pt-4">
                         <div className="text-xs text-gray-400">Generated by Ustaz.AI</div>
                         <div className="text-center">
                             <div className="w-32 border-b border-gray-400 mb-1"></div>
                             <span className="text-xs text-gray-500 uppercase">Signature</span>
                         </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
                <button 
                    onClick={downloadSlide}
                    className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-900 shadow-lg"
                >
                    <Download size={20} /> Save to Gallery
                </button>
                <button 
                    onClick={shareSlide}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg"
                >
                    <Share2 size={20} /> Share via WhatsApp
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;