import React, { useState, useRef } from 'react';
import { ClassGroup, TestRecord, AttendanceStatus } from '../types';
import { Check, Download, Sparkles, RefreshCw, Share2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { generateTestAnalysis } from '../services/geminiService';

declare const html2canvas: any;

interface TestGeneratorProps {
  classes: ClassGroup[];
}

// Punjab Textbook Board Subject Suggestions by Class
const getSubjectSuggestions = (className: string): string[] => {
  const name = className.toLowerCase();

  // Primary (1-5)
  if (name.includes('1') || name.includes('2') || name.includes('3') || name.includes('4') || name.includes('5') || name.includes('primary')) {
    return ['Urdu', 'English', 'Mathematics', 'Nazra Quran', 'General Science', 'Islamiat', 'Drawing'];
  }

  // Middle (6-8)
  if (name.includes('6') || name.includes('7') || name.includes('8') || name.includes('middle')) {
    return ['Urdu', 'English', 'Mathematics', 'Science', 'Social Studies', 'Islamiat', 'Arabic', 'Computer'];
  }

  // Matric (9-10)
  if (name.includes('9') || name.includes('10') || name.includes('matric')) {
    return ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Urdu', 'Islamiat', 'Pak Studies', 'Computer'];
  }

  // Inter (11-12)
  if (name.includes('11') || name.includes('12') || name.includes('inter') || name.includes('fsc') || name.includes('ics')) {
    return ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Urdu', 'Computer Science'];
  }

  // Default
  return ['Urdu', 'English', 'Mathematics', 'Islamiat', 'General Science'];
};

const TestGenerator: React.FC<TestGeneratorProps> = ({ classes }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [totalMarks, setTotalMarks] = useState<number>(20);
  const [marksMap, setMarksMap] = useState<{ [studentId: string]: number }>({});
  const [statusMap, setStatusMap] = useState<{ [studentId: string]: AttendanceStatus }>({});

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const slideRef = useRef<HTMLDivElement>(null);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const subjectSuggestions = selectedClass ? getSubjectSuggestions(selectedClass.name) : [];

  const initializeTest = () => {
    if (!selectedClass) return;
    const initialMarks: any = {};
    const initialStatus: any = {};
    selectedClass.students.forEach(s => {
      initialMarks[s.id] = 0;
      initialStatus[s.id] = AttendanceStatus.PRESENT;
    });
    setMarksMap(initialMarks);
    setStatusMap(initialStatus);
    setStep(2);
  };

  const handleMarkChange = (studentId: string, val: string) => {
    const num = parseFloat(val);
    if (num > totalMarks) {
      setErrorMsg(`Marks cannot exceed ${totalMarks}!`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setErrorMsg(null);
    const validatedNum = isNaN(num) ? 0 : Math.max(0, num);
    setMarksMap(prev => ({ ...prev, [studentId]: validatedNum }));
  };

  const toggleStatus = (studentId: string) => {
    setStatusMap(prev => {
      const current = prev[studentId];
      let next = AttendanceStatus.PRESENT;
      if (current === AttendanceStatus.PRESENT) next = AttendanceStatus.ABSENT;
      else if (current === AttendanceStatus.ABSENT) next = AttendanceStatus.LEAVE;
      else next = AttendanceStatus.PRESENT;
      return { ...prev, [studentId]: next };
    });
  };

  const finishTest = () => {
    setStep(3);
  };

  const downloadSlide = async () => {
    if (!slideRef.current) return;
    try {
      const canvas = await html2canvas(slideRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `Test_Result_${subject}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Error generating image", err);
    }
  };

  const shareSlide = async () => {
    if (!slideRef.current) return;
    try {
      const canvas = await html2canvas(slideRef.current, { scale: 2, useCORS: true });
      canvas.toBlob(async (blob: any) => {
        if (!blob) return;
        const file = new File([blob], "result.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `Test Result: ${subject}` });
        } else {
          alert("Sharing not supported. Use Download instead.");
        }
      });
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const getAIInsights = async () => {
    if (!selectedClass) return;
    setIsAnalysing(true);

    const record: TestRecord = {
      id: 'temp',
      classId: selectedClass.id,
      subject,
      totalMarks,
      date: new Date().toLocaleDateString(),
      results: selectedClass.students.map(s => ({
        studentId: s.id,
        marksObtained: marksMap[s.id] || 0,
        status: statusMap[s.id] || AttendanceStatus.PRESENT
      }))
    };

    const result = await generateTestAnalysis(record, selectedClass);
    setAiAnalysis(result);
    setIsAnalysing(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn relative">
      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-20 right-5 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-2 font-bold">
          <AlertCircle color="white" /> {errorMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-indigo-600" /> Create Test Result
        </h2>
        {step > 1 && (
          <button onClick={() => setStep(1)} className="text-sm text-indigo-600 hover:underline">
            Start Over
          </button>
        )}
      </div>

      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-lg mx-auto">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
              <select
                className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-indigo-500 outline-none transition-colors"
                value={selectedClassId}
                onChange={e => { setSelectedClassId(e.target.value); setSubject(''); }}
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Type or select subject..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                onFocus={() => setShowSubjectSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSubjectSuggestions(false), 200)}
              />
              {showSubjectSuggestions && subjectSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {subjectSuggestions.map((s, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-gray-800 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => { setSubject(s); setShowSubjectSuggestions(false); }}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-indigo-600 font-medium border-t"
                    onClick={() => { setShowSubjectSuggestions(false); }}
                  >
                    + Type Custom Subject
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
              <input
                type="number"
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:border-indigo-500 outline-none transition-colors"
                value={totalMarks}
                onChange={e => setTotalMarks(parseFloat(e.target.value))}
              />
            </div>

            <button
              onClick={initializeTest}
              disabled={!selectedClassId || !subject}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all"
            >
              Next: Enter Marks
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedClass && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between">
            <span>{selectedClass.name} - {subject}</span>
            <span className="text-sm font-normal text-gray-500">Total: {totalMarks}</span>
          </h3>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {selectedClass.students.map(student => {
              const status = statusMap[student.id];
              const isPresent = status === AttendanceStatus.PRESENT;

              return (
                <div key={student.id} className={`p-4 rounded-xl border-2 transition-all ${isPresent ? 'border-gray-200 bg-white' : 'border-orange-300 bg-orange-50'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-800">{student.name}</span>
                    <button
                      onClick={() => toggleStatus(student.id)}
                      className={`text-xs px-3 py-1 rounded-full font-bold uppercase
                        ${status === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-700' :
                          status === AttendanceStatus.ABSENT ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                      `}
                    >
                      {status}
                    </button>
                  </div>

                  {isPresent ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Marks:</span>
                      <input
                        type="number"
                        className="flex-1 p-2 border-2 border-gray-200 rounded-lg text-center font-bold text-lg text-gray-900 bg-white focus:border-indigo-500 outline-none"
                        value={marksMap[student.id] || ''}
                        max={totalMarks}
                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                      />
                      <span className="text-gray-400">/ {totalMarks}</span>
                    </div>
                  ) : (
                    <div className="h-10 flex items-center justify-center text-sm text-gray-400 italic">
                      No marks ({status})
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={finishTest}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl flex items-center gap-2 transition-all"
            >
              <Check size={20} /> Generate Result Slide
            </button>
          </div>
        </div>
      )}

      {step === 3 && selectedClass && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-gray-100 p-4 rounded-xl mb-4 border overflow-auto">
              <div
                ref={slideRef}
                className="bg-white p-8 mx-auto shadow-2xl relative overflow-hidden"
                style={{ width: '800px', minHeight: '1000px', background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)' }}
              >
                {/* School Logo */}
                <div className="absolute top-4 right-4 w-24 h-24 flex items-center justify-center p-2 bg-white rounded-full border-4 border-double border-indigo-100 shadow-lg">
                  <img src="/school-logo.png" alt="School Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
                </div>

                {/* Header */}
                <div className="border-b-4 border-indigo-600 pb-6 mb-6 relative z-10">
                  <div className="text-sm font-bold text-gray-500 tracking-widest mb-1">ROOTS OF WISDOM SCHOOL & COLLEGE</div>
                  <h1 className="text-4xl font-bold text-indigo-900 uppercase tracking-tight">Test Result</h1>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-indigo-600 text-xl font-medium">{selectedClass.name}</p>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{subject}</p>
                      <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="relative z-10">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <th className="p-3 text-left rounded-tl-lg">Roll No</th>
                        <th className="p-3 text-left">Student Name</th>
                        <th className="p-3 text-center">Obtained</th>
                        <th className="p-3 text-center">Total</th>
                        <th className="p-3 text-center rounded-tr-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {selectedClass.students.map((student, idx) => {
                        const status = statusMap[student.id];
                        const marks = marksMap[student.id];
                        const isPass = (marks / totalMarks) >= 0.4;
                        return (
                          <tr key={student.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/50'}`}>
                            <td className="p-3 font-mono font-bold">{student.rollNo || idx + 1}</td>
                            <td className="p-3 font-semibold">{student.name}</td>
                            <td className="p-3 text-center font-bold text-lg">
                              {status === AttendanceStatus.PRESENT ? marks : '-'}
                            </td>
                            <td className="p-3 text-center text-gray-500">{totalMarks}</td>
                            <td className="p-3 text-center">
                              {status === AttendanceStatus.PRESENT ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {isPass ? 'PASS' : 'FAIL'}
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-orange-600 uppercase">{status}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Analysis */}
                {aiAnalysis && (
                  <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border-l-4 border-indigo-500 relative z-10">
                    <h4 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                      <Sparkles size={18} /> Ustaz Analysis
                    </h4>
                    <p className="text-indigo-800 text-sm leading-relaxed">{aiAnalysis}</p>
                  </div>
                )}

                {/* Footer with Signature */}
                <div className="mt-10 relative z-10 border-t-2 border-indigo-100 pt-6">
                  <div className="flex justify-between items-end">
                    <div className="text-center">
                      <div className="w-40 border-t-2 border-gray-400 mb-2 flex justify-center pt-2">
                        <CheckCircle size={24} className="text-green-600" />
                      </div>
                      <p className="text-gray-600 text-sm font-medium">Teacher's Signature</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-64 flex flex-col gap-4">
            <button
              onClick={downloadSlide}
              className="bg-gray-800 text-white py-4 rounded-xl shadow-lg hover:bg-gray-900 font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Download size={20} /> Save to Gallery
            </button>

            <button
              onClick={shareSlide}
              className="bg-green-600 text-white py-4 rounded-xl shadow-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Share2 size={20} /> Share via WhatsApp
            </button>

            <button
              onClick={getAIInsights}
              disabled={isAnalysing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {isAnalysing ? <RefreshCw className="animate-spin" /> : <Sparkles size={20} />}
              {aiAnalysis ? 'Regenerate Analysis' : 'Get Ustaz Analysis'}
            </button>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-sm text-blue-800">
              <p>💡 Tip: Click "Share" to send directly to students or parents.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestGenerator;