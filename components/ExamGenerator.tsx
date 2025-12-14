import React, { useState, useRef } from 'react';
import { ClassGroup } from '../types';
import { Download, Plus, Trash2, Share2, Award, BookOpen, CheckCircle, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

declare const html2canvas: any;

interface ExamGeneratorProps {
  classes: ClassGroup[];
}

// Punjab Text Board Subject Suggestions by Class
const getPTBSubjects = (className: string): { name: string; total: number }[] => {
  const name = className.toLowerCase();

  // Primary (1-5)
  if (name.includes('1') || name.includes('2') || name.includes('3') || name.includes('4') || name.includes('5') || name.includes('primary')) {
    return [
      { name: 'Urdu', total: 100 },
      { name: 'English', total: 100 },
      { name: 'Mathematics', total: 100 },
      { name: 'Nazra Quran', total: 50 },
      { name: 'General Science', total: 50 },
      { name: 'Islamiat', total: 50 },
    ];
  }

  // Middle (6-8)
  if (name.includes('6') || name.includes('7') || name.includes('8') || name.includes('middle')) {
    return [
      { name: 'Urdu', total: 100 },
      { name: 'English', total: 100 },
      { name: 'Mathematics', total: 100 },
      { name: 'Science', total: 100 },
      { name: 'Social Studies', total: 75 },
      { name: 'Islamiat', total: 50 },
      { name: 'Arabic', total: 50 },
    ];
  }

  // Matric (9-10)
  if (name.includes('9') || name.includes('10') || name.includes('matric')) {
    return [
      { name: 'Physics', total: 75 },
      { name: 'Chemistry', total: 75 },
      { name: 'Biology', total: 75 },
      { name: 'Mathematics', total: 100 },
      { name: 'English', total: 100 },
      { name: 'Urdu', total: 100 },
      { name: 'Islamiat', total: 50 },
      { name: 'Pak Studies', total: 50 },
      { name: 'Computer', total: 50 },
    ];
  }

  // Inter (11-12)
  if (name.includes('11') || name.includes('12') || name.includes('inter') || name.includes('fsc') || name.includes('ics')) {
    return [
      { name: 'Physics', total: 100 },
      { name: 'Chemistry', total: 100 },
      { name: 'Biology/Math', total: 100 },
      { name: 'English', total: 100 },
      { name: 'Urdu', total: 100 },
    ];
  }

  // Default
  return [
    { name: 'Urdu', total: 100 },
    { name: 'English', total: 100 },
    { name: 'Mathematics', total: 100 },
  ];
};

// Custom portion suggestions
const portionSuggestions = [
  { name: 'Viva/Oral', total: 10 },
  { name: 'Grading Marks', total: 10 },
  { name: 'Practical', total: 20 },
  { name: 'Project', total: 15 },
  { name: 'Lab Work', total: 10 },
  { name: 'Attendance', total: 5 },
];

const ExamGenerator: React.FC<ExamGeneratorProps> = ({ classes }) => {
  const [step, setStep] = useState(1);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [examName, setExamName] = useState('');
  const [subjects, setSubjects] = useState<{ name: string; total: number }[]>([{ name: '', total: 100 }]);
  const [marksData, setMarksData] = useState<{ [studentId: string]: { [subject: string]: number } }>({});
  const [examRollNos, setExamRollNos] = useState<{ [studentId: string]: string }>({});
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [showPortionModal, setShowPortionModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const slideRef = useRef<HTMLDivElement>(null);
  const selectedClass = classes.find(c => c.id === selectedClassId);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const cls = classes.find(c => c.id === classId);
    if (cls) {
      const defaultSubjects = getPTBSubjects(cls.name);
      setSubjects(defaultSubjects);
      // Initialize roll numbers from student list
      const initialRolls: any = {};
      cls.students.forEach(s => { initialRolls[s.id] = s.rollNo; });
      setExamRollNos(initialRolls);
    }
  };

  const addSubject = () => setSubjects([...subjects, { name: '', total: 100 }]);
  const removeSubject = (idx: number) => setSubjects(subjects.filter((_, i) => i !== idx));

  const updateSubject = (idx: number, field: 'name' | 'total', value: string) => {
    const newSubjects = [...subjects];
    if (field === 'total') newSubjects[idx].total = parseInt(value) || 0;
    else newSubjects[idx].name = value;
    setSubjects(newSubjects);
  };

  const addPortion = (portion: { name: string; total: number }) => {
    setSubjects([...subjects, { ...portion }]);
    setShowPortionModal(false);
  };

  const handleMarkChange = (studentId: string, subjectIdx: number, value: string) => {
    const inputVal = parseFloat(value) || 0;
    const maxMarks = subjects[subjectIdx].total;

    // Strict Validation
    if (inputVal > maxMarks) {
      setErrorMsg(`Marks cannot exceed ${maxMarks} for ${subjects[subjectIdx].name}!`);
      setTimeout(() => setErrorMsg(null), 3000);
      return; // Do not update state if invalid
    }

    // Clear error if valid
    setErrorMsg(null);

    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjects[subjectIdx].name]: inputVal
      }
    }));
  };

  const handleRollNoChange = (studentId: string, val: string) => {
    setExamRollNos(prev => ({ ...prev, [studentId]: val }));
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
          await navigator.share({ files: [file], title: `Award List: ${examName}` });
        } else {
          alert("Sharing not supported.");
        }
      });
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const getShortName = (name: string) => {
    const map: { [key: string]: string } = {
      'Physics': 'Phy', 'Chemistry': 'Chem', 'Biology': 'Bio', 'Mathematics': 'Math', 'English': 'Eng',
      'Urdu': 'Urd', 'Islamiat': 'Isl', 'Pak Studies': 'P.St', 'Computer': 'Comp', 'General Science': 'G.Sci',
      'Social Studies': 'S.St', 'history': 'Hist', 'Geography': 'Geog', 'Nazra Quran': 'Nazra', 'Arabic': 'Arb'
    };
    return map[name] || name.substring(0, 4);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Elegant Header
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F'); // White background

    // School Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    doc.text("ROOTS OF WISDOM SCHOOL & COLLEGE", 148.5, 20, { align: "center" });

    // Exam Name
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`AWARD LIST: ${examName.toUpperCase()}`, 148.5, 30, { align: "center" });

    // Meta Info
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Class: ${selectedClass?.name}   |   Date: ${dateStr}`, 148.5, 38, { align: "center" });

    // Table
    // Headers: S.No | Roll No | Name | Sub1 | Sub2 ... | Obt | Total | % | Pos
    const tableHead = [['S.No', 'Roll No', 'Student Name', ...subjects.map(s => `${getShortName(s.name)}\n(${s.total})`), 'Obt', 'Total', '%', 'Pos']];

    const sortedStudents = selectedClass?.students
      .map(s => {
        const ob = calculateTotal(s.id);
        const perc = grandTotal > 0 ? (ob / grandTotal) * 100 : 0;
        return { ...s, ob, perc, roll: examRollNos[s.id] || s.rollNo };
      })
      .sort((a, b) => b.ob - a.ob);

    const tableBody = sortedStudents?.map((s, idx) => [
      idx + 1,        // S.No (Auto increment)
      s.roll,         // Roll No (Exam Specific)
      s.name,
      ...subjects.map(sub => marksData[s.id]?.[sub.name] || '-'),
      s.ob,
      grandTotal,
      s.perc.toFixed(1) + '%',
      idx === 0 ? '1st' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : ''
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 45,
      theme: 'grid',
      headStyles: {
        fillColor: [33, 33, 33], // Dark Gray/Black
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { cellWidth: 12 }, // S.No
        1: { cellWidth: 20 }, // Roll No
        2: { halign: 'left', cellWidth: 45 }, // Name
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 45 }
    });

    // Signature Area
    const finalY = (doc as any).lastAutoTable.finalY || 150;

    if (finalY < 180) {
      doc.setLineWidth(0.5);
      doc.line(30, finalY + 30, 80, finalY + 30); // Line 1
      doc.text("Class Teacher", 55, finalY + 36, { align: 'center' });

      doc.line(220, finalY + 30, 270, finalY + 30); // Line 2
      doc.text("Principal", 245, finalY + 36, { align: 'center' });
    }

    doc.save(`AwardList_${selectedClass?.name}_${examName}.pdf`);
  };

  const exportToExcel = () => {
    if (!selectedClass) return;

    const data = selectedClass.students.map(s => {
      const ob = calculateTotal(s.id);
      const perc = grandTotal > 0 ? (ob / grandTotal) * 100 : 0;

      const row: any = {
        'Roll No': examRollNos[s.id] || s.rollNo,
        'Name': s.name,
      };

      subjects.forEach(sub => {
        row[`${sub.name} (${sub.total})`] = marksData[s.id]?.[sub.name] || 0;
      });

      row['Obtained Total'] = ob;
      row['Grand Total'] = grandTotal;
      row['Percentage'] = perc.toFixed(2) + '%';

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Award List");
    XLSX.writeFile(wb, `AwardList_${examName}.xlsx`);
  };

  const ptbSubjects = selectedClass ? getPTBSubjects(selectedClass.name) : [];

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn relative">
      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-20 right-5 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-2 font-bold">
          <AlertCircle color="white" /> {errorMsg}
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Award className="text-indigo-600" /> Award List Generator
      </h2>

      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl mx-auto border border-gray-100">
          <div className="space-y-5">
            <div>
              <label className="block font-medium mb-2 text-gray-700">Select Class</label>
              <select
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:border-indigo-500 outline-none transition-colors"
                onChange={e => handleClassChange(e.target.value)}
                value={selectedClassId}
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Subjects will be auto-suggested based on PTB syllabus</p>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-700">Exam Name</label>
              <input
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:border-indigo-500 outline-none transition-colors"
                placeholder="e.g., Mid-Term Exams 2025"
                value={examName}
                onChange={e => setExamName(e.target.value)}
              />
            </div>

            <div className="border-t pt-5">
              <div className="flex justify-between items-center mb-3">
                <label className="font-medium text-gray-700 flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" /> Subjects & Marks
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPortionModal(true)}
                    className="text-purple-600 text-sm flex items-center gap-1 px-3 py-1 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Plus size={16} /> Add Portion
                  </button>
                  <button
                    onClick={addSubject}
                    className="text-indigo-600 text-sm flex items-center gap-1 px-3 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={16} /> Custom Subject
                  </button>
                </div>
              </div>

              {/* Subject suggestions dropdown */}
              {selectedClass && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-sm text-indigo-700 mb-2 font-medium">Quick Add PTB Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {ptbSubjects
                      .filter(ps => !subjects.some(s => s.name === ps.name))
                      .slice(0, 5)
                      .map((ps, i) => (
                        <button
                          key={i}
                          onClick={() => setSubjects([...subjects.filter(s => s.name), ps])}
                          className="px-3 py-1 bg-white text-indigo-700 rounded-lg text-sm border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        >
                          + {ps.name}
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {subjects.map((sub, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      className="flex-1 p-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:border-indigo-500 outline-none"
                      placeholder="Subject Name"
                      value={sub.name}
                      onChange={e => updateSubject(idx, 'name', e.target.value)}
                    />
                    <input
                      className="w-24 p-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white text-center focus:border-indigo-500 outline-none"
                      type="number"
                      placeholder="Max"
                      value={sub.total}
                      onChange={e => updateSubject(idx, 'total', e.target.value)}
                    />
                    {subjects.length > 1 && (
                      <button onClick={() => removeSubject(idx)} className="text-red-400 hover:text-red-600 p-2">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedClassId || !examName || subjects.some(s => !s.name)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50 hover:shadow-lg transition-all"
            >
              Next: Enter Marks
            </button>
          </div>
        </div>
      )}

      {/* Portion Modal */}
      {showPortionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Add Extra Portion</h3>
            <div className="space-y-2">
              {portionSuggestions.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPortion(p)}
                  className="w-full p-3 text-left border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex justify-between items-center"
                >
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <span className="text-gray-500 text-sm">{p.total} marks</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowPortionModal(false)} className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedClass && (
        <div className="bg-white p-6 rounded-2xl shadow-lg overflow-x-auto border border-gray-100">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-xl text-gray-800">{selectedClass.name} - {examName}</h3>
            <button onClick={() => setStep(3)} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all">
              Generate Award List
            </button>
          </div>
          <table className="w-full min-w-[800px] border text-sm">
            <thead>
              <tr className="bg-indigo-50">
                <th className="p-3 border text-left font-bold text-gray-700 w-24">Roll No</th>
                <th className="p-3 border text-left font-bold text-gray-700">Student Name</th>
                {subjects.map((sub, i) => (
                  <th key={i} className="p-3 border text-center font-bold text-gray-700">
                    {sub.name}<br /><span className="text-xs font-normal text-gray-500">({sub.total})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedClass.students.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">
                    <input
                      className="w-full p-2 border border-gray-200 rounded text-center focus:border-indigo-500 outline-none text-gray-900 bg-white"
                      value={examRollNos[student.id] || ''}
                      onChange={(e) => handleRollNoChange(student.id, e.target.value)}
                      placeholder={student.rollNo}
                    />
                  </td>
                  <td className="p-3 border font-medium text-gray-800">{student.name}</td>
                  {subjects.map((sub, idx) => (
                    <td key={idx} className="p-2 border text-center relative">
                      <input
                        className={`w-full text-center p-2 border-2 rounded-lg outline-none text-gray-900 bg-white transition-colors
                            ${marksData[student.id]?.[sub.name] > sub.total ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-200 focus:border-indigo-500'}`}
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center w-full">
            <button onClick={downloadAwardList} className="bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold hover:scale-105 transition-all">
              <Download size={20} /> Image
            </button>
            <button onClick={exportToPDF} className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold hover:scale-105 transition-all">
              <FileText size={20} /> Export PDF
            </button>
            <button onClick={exportToExcel} className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold hover:scale-105 transition-all">
              <FileSpreadsheet size={20} /> Export Excel
            </button>
            <button onClick={shareAwardList} className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold hover:scale-105 transition-all">
              <Share2 size={20} /> WhatsApp
            </button>
          </div>

          <div className="bg-gray-200 p-4 rounded-xl shadow-inner overflow-auto max-w-full">
            <div
              ref={slideRef}
              className="bg-white p-8 min-w-[900px]"
              style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}
            >
              {/* Header with Logo */}
              <div className="flex items-start justify-between border-b-4 border-emerald-600 pb-4 mb-6">
                <div className="flex items-center gap-4">
                  {/* School Logo */}
                  <div className="w-24 h-24 flex items-center justify-center p-2 bg-white rounded-full border-4 border-double border-emerald-100 shadow-lg">
                    <img src="/school-logo.png" alt="Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-700 tracking-widest">ROOTS OF WISDOM SCHOOL & COLLEGE</h3>
                    <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">Award List</h1>
                    <p className="text-emerald-600 font-medium">{examName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Class: <span className="font-bold text-gray-800">{selectedClass.name}</span></p>
                  <p className="text-gray-500 text-sm">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Results Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <th className="border border-emerald-700 p-2 text-sm">Roll</th>
                    <th className="border border-emerald-700 p-2 text-left text-sm">Student Name</th>
                    {subjects.map((s, i) => (
                      <th key={i} className="border border-emerald-700 p-2 text-center text-xs">{s.name.substring(0, 8)}</th>
                    ))}
                    <th className="border border-emerald-700 p-2 text-center text-sm">Obt.</th>
                    <th className="border border-emerald-700 p-2 text-center text-sm">Total</th>
                    <th className="border border-emerald-700 p-2 text-center text-sm">%</th>
                    <th className="border border-emerald-700 p-2 text-center text-sm">Pos</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClass.students
                    .map(s => {
                      const ob = calculateTotal(s.id);
                      const perc = grandTotal > 0 ? (ob / grandTotal) * 100 : 0;
                      return { ...s, ob, perc, roll: examRollNos[s.id] || s.rollNo };
                    })
                    .sort((a, b) => b.ob - a.ob)
                    .map((s, idx) => (
                      <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/50'}>
                        <td className="border border-gray-300 p-2 text-center font-mono">{s.roll}</td>
                        <td className="border border-gray-300 p-2 font-semibold text-gray-800">{s.name}</td>
                        {subjects.map((sub, i) => (
                          <td key={i} className="border border-gray-300 p-2 text-center text-gray-700">
                            {marksData[s.id]?.[sub.name] || '-'}
                          </td>
                        ))}
                        <td className="border border-gray-300 p-2 text-center font-bold text-emerald-700">{s.ob}</td>
                        <td className="border border-gray-300 p-2 text-center text-gray-500">{grandTotal}</td>
                        <td className="border border-gray-300 p-2 text-center font-medium">{s.perc.toFixed(1)}%</td>
                        <td className="border border-gray-300 p-2 text-center font-bold">
                          {idx === 0 && <span className="text-yellow-600">🥇 1st</span>}
                          {idx === 1 && <span className="text-gray-500">🥈 2nd</span>}
                          {idx === 2 && <span className="text-orange-600">🥉 3rd</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="mt-10 flex justify-between items-end px-4">
                <div className="text-center">
                  <div className="w-32 border-t-2 border-gray-400 pt-2 flex justify-center">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                  <p className="text-gray-600 font-medium text-sm">Class Teacher</p>
                </div>

                <div className="text-center">
                  <div className="w-32 border-t-2 border-gray-400 pt-2 flex justify-center">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                  <p className="text-gray-600 font-medium text-sm">Principal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamGenerator;