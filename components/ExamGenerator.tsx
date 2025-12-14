import React, { useState, useRef } from 'react';
import { ClassGroup } from '../types';
import { Download, Plus, Trash2, Sparkles, Share2 } from 'lucide-react';

declare const html2canvas: any;

interface ExamGeneratorProps {
  classes: ClassGroup[];
}

const ExamGenerator: React.FC<ExamGeneratorProps> = ({ classes }) => {
  const [step, setStep] = useState(1);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [examName, setExamName] = useState('');
  const [subjects, setSubjects] = useState<{ name: string; total: number }[]>([{ name: '', total: 100 }]);
  const [marksData, setMarksData] = useState<{ [studentId: string]: { [subject: string]: number } }>({});
  
  const slideRef = useRef<HTMLDivElement>(null);
  const selectedClass = classes.find(c => c.id === selectedClassId);

  const addSubject = () => setSubjects([...subjects, { name: '', total: 100 }]);
  const removeSubject = (idx: number) => setSubjects(subjects.filter((_, i) => i !== idx));
  
  const updateSubject = (idx: number, field: 'name' | 'total', value: string) => {
    const newSubjects = [...subjects];
    if (field === 'total') newSubjects[idx].total = parseInt(value) || 0;
    else newSubjects[idx].name = value;
    setSubjects(newSubjects);
  };

  const handleMarkChange = (studentId: string, subjectIdx: number, value: string) => {
    const val = parseFloat(value) || 0;
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjects[subjectIdx].name]: val
      }
    }));
  };

  const calculateTotal = (studentId: string): number => {
    const sMarks = marksData[studentId] || {};
    return (Object.values(sMarks) as number[]).reduce((a: number, b: number) => a + b, 0);
  };

  const grandTotal = subjects.reduce((a, b) => a + b.total, 0);

  const downloadAwardList = async () => {
    if (!slideRef.current) return;
    const canvas = await html2canvas(slideRef.current, { scale: 2 });
    const link = document.createElement('a');
    link.download = `Award_List_${examName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareAwardList = async () => {
    if (!slideRef.current) return;
    try {
      const canvas = await html2canvas(slideRef.current, { scale: 2 });
      canvas.toBlob(async (blob: any) => {
        if (!blob) return;
        const file = new File([blob], "award_list.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: `Award List: ${examName}`,
                text: `Award List for ${examName} - ${selectedClass?.name}`
            });
        } else {
            alert("Sharing not supported on this device.");
        }
      });
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Paper Result & Award List</h2>

      {step === 1 && (
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-2xl mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Select Class</label>
              <select className="w-full p-2 border rounded text-gray-900 bg-white" onChange={e => setSelectedClassId(e.target.value)} value={selectedClassId}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Exam Name</label>
              <input className="w-full p-2 border rounded text-gray-900 bg-white placeholder-gray-400" placeholder="e.g., Mid-Term 2024" value={examName} onChange={e => setExamName(e.target.value)} />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Subjects & Marks</label>
                <button onClick={addSubject} className="text-indigo-600 text-sm flex items-center gap-1"><Plus size={16}/> Add Subject</button>
              </div>
              {subjects.map((sub, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input className="flex-1 p-2 border rounded text-gray-900 bg-white placeholder-gray-400" placeholder="Subject Name" value={sub.name} onChange={e => updateSubject(idx, 'name', e.target.value)} />
                  <input className="w-24 p-2 border rounded text-gray-900 bg-white placeholder-gray-400" type="number" placeholder="Max" value={sub.total} onChange={e => updateSubject(idx, 'total', e.target.value)} />
                  {subjects.length > 1 && <button onClick={() => removeSubject(idx)} className="text-red-500"><Trash2 size={18}/></button>}
                </div>
              ))}
            </div>

            <button 
              onClick={() => setStep(2)} 
              disabled={!selectedClassId || !examName || subjects.some(s => !s.name)}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold mt-4 disabled:opacity-50"
            >
              Next: Enter Marks
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedClass && (
        <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto">
          <div className="flex justify-between mb-4">
             <h3 className="font-bold text-xl">Enter Marks: {selectedClass.name}</h3>
             <button onClick={() => setStep(3)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Generate Award List</button>
          </div>
          <table className="w-full min-w-[800px] border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border text-left">Name</th>
                {subjects.map((sub, i) => (
                  <th key={i} className="p-2 border text-center w-24">{sub.name} ({sub.total})</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedClass.students.map(student => (
                <tr key={student.id} className="border-b">
                  <td className="p-2 border font-medium">{student.name}</td>
                  {subjects.map((sub, idx) => (
                    <td key={idx} className="p-2 border text-center">
                      <input 
                        className="w-full text-center focus:outline-none text-gray-900 bg-white"
                        type="number"
                        onChange={(e) => handleMarkChange(student.id, idx, e.target.value)}
                        placeholder="-"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {step === 3 && selectedClass && (
        <div className="flex flex-col gap-6 items-center">
           <div className="bg-white p-2 border rounded shadow-lg overflow-auto max-w-full">
             <div 
               ref={slideRef} 
               className="bg-white p-8 min-w-[800px] max-w-[1000px]"
               style={{ background: 'white' }}
             >
                {/* Award List Design */}
                <div className="text-center border-b-2 border-black pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-600 tracking-widest mb-2">ROOTS OF WISDOM</h3>
                  <h1 className="text-3xl font-serif font-bold uppercase tracking-widest">Award List</h1>
                  <h2 className="text-xl font-serif mt-2">{examName}</h2>
                  <p className="text-gray-600 mt-1">Class: {selectedClass.name}</p>
                </div>

                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-black p-2">Roll No</th>
                      <th className="border border-black p-2 text-left">Student Name</th>
                      {subjects.map((s, i) => <th key={i} className="border border-black p-2 text-center text-xs">{s.name.substring(0,10)}</th>)}
                      <th className="border border-black p-2 text-center">Obtained</th>
                      <th className="border border-black p-2 text-center">Total</th>
                      <th className="border border-black p-2 text-center">%</th>
                      <th className="border border-black p-2 text-center">Pos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClass.students
                      .map(s => {
                        const ob = calculateTotal(s.id);
                        const perc = (ob / grandTotal) * 100;
                        return { ...s, ob, perc };
                      })
                      .sort((a, b) => b.ob - a.ob) // Sort by marks for position
                      .map((s, idx) => (
                      <tr key={s.id}>
                        <td className="border border-black p-2 text-center">{s.rollNo}</td>
                        <td className="border border-black p-2 font-bold">{s.name}</td>
                        {subjects.map((sub, i) => (
                          <td key={i} className="border border-black p-2 text-center text-gray-700">
                            {marksData[s.id]?.[sub.name] || '-'}
                          </td>
                        ))}
                        <td className="border border-black p-2 text-center font-bold">{s.ob}</td>
                        <td className="border border-black p-2 text-center">{grandTotal}</td>
                        <td className="border border-black p-2 text-center">{s.perc.toFixed(1)}%</td>
                        <td className="border border-black p-2 text-center font-bold text-indigo-800">
                          {idx === 0 ? '1st' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-12 flex justify-between px-8">
                    <div className="text-center">
                      <p className="border-t border-black px-8 pt-1 font-bold">Class Teacher</p>
                    </div>
                    <div className="text-center">
                      <p className="border-t border-black px-8 pt-1 font-bold">Principal</p>
                    </div>
                </div>
                
                <div className="mt-6 text-center text-xs text-gray-400">Generated by Ustaz.AI</div>
             </div>
           </div>
           
           <div className="flex gap-4">
                <button onClick={downloadAwardList} className="bg-indigo-600 text-white px-8 py-3 rounded-lg shadow-xl flex items-center gap-2 font-bold hover:bg-indigo-700">
                    <Download /> Save to Gallery
                </button>
                <button onClick={shareAwardList} className="bg-green-600 text-white px-8 py-3 rounded-lg shadow-xl flex items-center gap-2 font-bold hover:bg-green-700">
                    <Share2 /> Share via WhatsApp
                </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ExamGenerator;