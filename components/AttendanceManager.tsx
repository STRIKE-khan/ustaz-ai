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
  // Default to current date
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
    alert(`Attendance for ${selectedClass?.name} on ${date} saved! Click "Generate Slide" to share.`);
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
          alert("Sharing not supported. Use Download instead.");
        }
      });
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const presentCount = selectedClass ? selectedClass.students.filter(s => attendance[s.id] === AttendanceStatus.PRESENT).length : 0;
  const absentCount = selectedClass ? selectedClass.students.filter(s => attendance[s.id] === AttendanceStatus.ABSENT).length : 0;

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-indigo-600" /> Attendance
        </h2>
        {view === 'SLIDE' && (
          <button onClick={() => setView('MARK')} className="flex items-center text-indigo-600 text-sm font-semibold hover:underline">
            <ArrowLeft size={16} className="mr-1" /> Back to Marking
          </button>
        )}
      </div>

      {view === 'MARK' && (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                <select
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:border-indigo-500 outline-none transition-colors"
                  value={selectedClassId}
                  onChange={e => handleClassSelect(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:border-indigo-500 outline-none transition-colors"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {selectedClass && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">{selectedClass.name}</h3>
                <div className="flex gap-4 text-sm">
                  <span className="bg-green-500/20 px-3 py-1 rounded-full">Present: {presentCount}</span>
                  <span className="bg-red-500/20 px-3 py-1 rounded-full">Absent: {absentCount}</span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {selectedClass.students.map(student => (
                  <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-bold text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">Roll No: {student.rollNo}</p>
                    </div>

                    <div className="flex gap-2">
                      {[AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LEAVE].map(status => (
                        <button
                          key={status}
                          onClick={() => setStatus(student.id, status)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${attendance[student.id] === status
                            ? status === AttendanceStatus.PRESENT ? 'bg-green-600 text-white shadow-lg'
                              : status === AttendanceStatus.ABSENT ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-yellow-500 text-white shadow-lg'
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
                  className="text-indigo-700 bg-indigo-100 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-200 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => setView('SLIDE')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg"
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
          <div className="bg-gray-200 p-4 rounded-xl shadow-inner overflow-auto max-w-full">
            <div
              ref={slideRef}
              className="bg-white p-8 min-w-[600px] relative"
              style={{ background: 'linear-gradient(to bottom right, #ffffff, #f0f4ff)' }}
            >
              {/* School Logo */}
              <div className="absolute top-4 right-4 w-16 h-16 flex items-center justify-center">
                <img src="/school-logo.png" alt="School Logo" className="w-full h-full object-contain filter drop-shadow-md" />
              </div>

              <div className="border-b-4 border-indigo-600 pb-4 mb-4">
                <div className="text-xs font-bold text-gray-500 tracking-widest mb-1">ROOTS OF WISDOM SCHOOL & COLLEGE</div>
                <h1 className="text-3xl font-bold text-indigo-900 uppercase">Attendance</h1>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-lg text-indigo-700 font-medium">{selectedClass.name}</p>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</h2>
                    <p className="text-gray-500 text-sm">Daily Report</p>
                  </div>
                </div>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <th className="p-3 text-left rounded-tl-lg">Roll No</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-center rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClass.students.map((s, idx) => (
                    <tr key={s.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/50'}`}>
                      <td className="p-3 font-mono font-bold text-gray-700">{s.rollNo}</td>
                      <td className="p-3 font-semibold text-gray-800">{s.name}</td>
                      <td className="p-3 text-center">
                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${attendance[s.id] === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-800' :
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

              {/* Summary */}
              <div className="mt-6 flex gap-4 text-sm">
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">Present: {presentCount}</span>
                <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold">Absent: {absentCount}</span>
                <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-bold">Total: {selectedClass.students.length}</span>
              </div>

              {/* Footer with Signature Tick */}
              <div className="mt-8 flex justify-between items-end border-t-2 border-indigo-100 pt-4">
                <div className="text-xs text-gray-400">Powered by Ustaz.AI</div>
                <div className="text-center">
                  <div className="w-32 border-b-2 border-gray-400 mb-2 flex justify-center pt-2">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Teacher's Signature</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={downloadSlide}
              className="bg-gray-800 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-900 shadow-lg transition-all"
            >
              <Download size={20} /> Save to Gallery
            </button>
            <button
              onClick={shareSlide}
              className="bg-green-600 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg transition-all"
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