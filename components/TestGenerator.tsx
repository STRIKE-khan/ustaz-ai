import React, { useState, useRef } from 'react';
import { ClassGroup, TestRecord, AttendanceStatus } from '../types';
import { Check, X, Download, Sparkles, RefreshCw, Share2 } from 'lucide-react';
import { generateTestAnalysis } from '../services/geminiService';

// Declare html2canvas globally since we load it via script tag
declare const html2canvas: any;

interface TestGeneratorProps {
  classes: ClassGroup[];
}

const TestGenerator: React.FC<TestGeneratorProps> = ({ classes }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(20);
  const [marksMap, setMarksMap] = useState<{ [studentId: string]: number }>({});
  const [statusMap, setStatusMap] = useState<{ [studentId: string]: AttendanceStatus }>({});
  
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalysing, setIsAnalysing] = useState(false);

  const slideRef = useRef<HTMLDivElement>(null);

  const selectedClass = classes.find(c => c.id === selectedClassId);

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
    setMarksMap(prev => ({ ...prev, [studentId]: isNaN(num) ? 0 : num }));
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
      alert("Failed to generate image. Please try again.");
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
            await navigator.share({
                files: [file],
                title: `Test Result: ${subject}`,
                text: `Here is the test result for ${selectedClass?.name} - ${subject}`
            });
        } else {
            alert("Sharing not supported on this device. Use Download instead.");
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
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Test Result</h2>
        {step > 1 && (
            <button onClick={() => setStep(1)} className="text-sm text-indigo-600 hover:underline">
                Start Over
            </button>
        )}
      </div>

      {step === 1 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-lg mx-auto">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select 
                className="w-full p-3 border rounded-lg bg-white text-gray-900"
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-lg text-gray-900 bg-white placeholder-gray-400"
                placeholder="e.g., Mathematics"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg text-gray-900 bg-white placeholder-gray-400"
                value={totalMarks}
                onChange={e => setTotalMarks(parseFloat(e.target.value))}
              />
            </div>
            <button 
              onClick={initializeTest}
              disabled={!selectedClassId || !subject}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              Next: Enter Marks
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedClass && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-indigo-900 mb-4 border-b pb-2 flex justify-between">
            <span>{selectedClass.name} - {subject}</span>
            <span className="text-sm font-normal text-gray-500">Total: {totalMarks}</span>
          </h3>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {selectedClass.students.map(student => {
              const status = statusMap[student.id];
              const isPresent = status === AttendanceStatus.PRESENT;

              return (
                <div key={student.id} className={`p-3 rounded-lg border ${isPresent ? 'border-gray-200 bg-white' : 'border-orange-200 bg-orange-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 truncate">{student.name}</span>
                    <button 
                      onClick={() => toggleStatus(student.id)}
                      className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider
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
                            className="flex-1 p-1 border rounded text-center font-mono text-lg text-gray-900 bg-white"
                            value={marksMap[student.id] || ''}
                            max={totalMarks}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                        />
                        <span className="text-gray-400 text-sm">/ {totalMarks}</span>
                    </div>
                  ) : (
                    <div className="h-9 flex items-center justify-center text-sm text-gray-400 italic">
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
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Check size={20} /> Generate Result Slide
            </button>
          </div>
        </div>
      )}

      {step === 3 && selectedClass && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Preview Section */}
          <div className="flex-1">
            <div className="bg-gray-100 p-4 rounded-lg mb-4 border overflow-auto">
              {/* The actual Slide to be captured */}
              <div 
                ref={slideRef} 
                className="bg-white p-8 mx-auto shadow-2xl relative overflow-hidden"
                style={{ width: '800px', minHeight: '1000px', background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)' }}
              >
                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-indigo-50 rotate-45 pointer-events-none select-none">
                    USTAZ.AI
                </div>

                {/* Header */}
                <div className="border-b-4 border-indigo-600 pb-6 mb-6 flex justify-between items-center relative z-10">
                    <div>
                        <div className="text-sm font-bold text-gray-500 tracking-widest mb-1">ROOTS OF WISDOM</div>
                        <h1 className="text-4xl font-bold text-indigo-900 uppercase tracking-tight">Test Result</h1>
                        <p className="text-indigo-600 text-xl mt-1 font-medium">{selectedClass.name}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-gray-800">{subject}</h2>
                        <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="relative z-10">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-indigo-600 text-white">
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
                                const isPass = (marks / totalMarks) >= 0.4; // 40% pass
                                return (
                                    <tr key={student.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/50'}`}>
                                        <td className="p-3 font-mono">{student.rollNo || idx + 1}</td>
                                        <td className="p-3 font-semibold">{student.name}</td>
                                        <td className="p-3 text-center font-bold text-lg">
                                            {status === AttendanceStatus.PRESENT ? marks : '-'}
                                        </td>
                                        <td className="p-3 text-center text-gray-500">{totalMarks}</td>
                                        <td className="p-3 text-center">
                                            {status === AttendanceStatus.PRESENT ? (
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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

                {/* Footer & AI Analysis */}
                <div className="mt-10 relative z-10 border-t-2 border-indigo-100 pt-6">
                    {aiAnalysis && (
                        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500 mb-4">
                            <h4 className="text-indigo-900 font-bold mb-1 flex items-center gap-2">
                                <Sparkles size={16} /> Ustaz AI Analysis
                            </h4>
                            <p className="text-indigo-800 text-sm italic leading-relaxed">"{aiAnalysis}"</p>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-end mt-8">
                        <div className="text-center">
                            <div className="w-40 h-0.5 bg-gray-400 mb-2"></div>
                            <p className="text-gray-600 text-sm font-medium">Teacher's Signature</p>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                            Generated by Ustaz.AI
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
                className="bg-gray-700 text-white py-3 rounded-xl shadow-lg hover:bg-gray-800 font-bold flex items-center justify-center gap-2"
            >
                <Download size={20} /> Save to Gallery
            </button>
            
            <button 
                onClick={shareSlide}
                className="bg-green-600 text-white py-3 rounded-xl shadow-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2"
            >
                <Share2 size={20} /> Share via WhatsApp
            </button>

            <button 
                onClick={getAIInsights}
                disabled={isAnalysing}
                className="bg-indigo-600 text-white py-3 rounded-xl shadow-md hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
            >
                {isAnalysing ? <RefreshCw className="animate-spin" /> : <Sparkles size={20} />}
                {aiAnalysis ? 'Regenerate AI Analysis' : 'Get AI Analysis'}
            </button>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800">
                <p>Tip: Click "Share" to send directly to students or parents.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestGenerator;