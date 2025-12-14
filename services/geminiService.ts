import { TestRecord, ClassGroup, ExamRecord, AttendanceStatus } from "../types";

// Ustaz Analysis System - Smart Offline Analysis
// No internet required - intelligent responses generated locally

const getStudentPerformanceCategory = (percentage: number): string => {
  if (percentage >= 90) return 'Outstanding';
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 70) return 'Very Good';
  if (percentage >= 60) return 'Good';
  if (percentage >= 50) return 'Satisfactory';
  if (percentage >= 40) return 'Pass';
  return 'Needs Improvement';
};

const getGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
};

export const generateTestAnalysis = async (
  testRecord: TestRecord,
  classGroup: ClassGroup
): Promise<string> => {
  // Calculate comprehensive statistics
  const presentStudents = testRecord.results.filter(r => r.status === AttendanceStatus.PRESENT);
  const totalPresent = presentStudents.length;
  const totalStudents = testRecord.results.length;
  const absentCount = testRecord.results.filter(r => r.status === AttendanceStatus.ABSENT).length;

  if (totalPresent === 0) {
    return "No students were present for this test.";
  }

  const marks = presentStudents.map(r => r.marksObtained);
  const totalMarks = testRecord.totalMarks;

  const sum = marks.reduce((acc, m) => acc + m, 0);
  const avgMarks = Math.round((sum / totalPresent) * 10) / 10;
  const avgPercentage = Math.round((avgMarks / totalMarks) * 100);

  const passCount = marks.filter(m => (m / totalMarks) >= 0.4).length;
  const failCount = totalPresent - passCount;
  const passRate = Math.round((passCount / totalPresent) * 100);

  const highestMarks = Math.max(...marks);
  const lowestMarks = Math.min(...marks);

  // Find top performers
  const topPerformers = presentStudents
    .filter(r => r.marksObtained === highestMarks)
    .map(r => classGroup.students.find(s => s.id === r.studentId)?.name)
    .filter(Boolean);

  // Generate intelligent analysis
  let analysis = '';

  // Summary
  analysis += `📊 ${testRecord.subject} Test Analysis\n\n`;
  analysis += `Class Average: ${avgMarks}/${totalMarks} (${avgPercentage}%) - ${getStudentPerformanceCategory(avgPercentage)}\n`;
  analysis += `Pass Rate: ${passRate}% (${passCount} passed, ${failCount} failed)\n`;

  if (absentCount > 0) {
    analysis += `⚠️ ${absentCount} student(s) were absent\n`;
  }

  analysis += `\n📈 Score Range: ${lowestMarks} to ${highestMarks} marks\n`;

  if (topPerformers.length > 0 && topPerformers.length <= 3) {
    analysis += `🏆 Top Performer(s): ${topPerformers.join(', ')}\n`;
  }

  // Smart remarks based on performance
  analysis += '\n';

  if (passRate >= 90) {
    analysis += `🌟 Excellent class performance! Your teaching methods are highly effective. Keep up the outstanding work!`;
  } else if (passRate >= 75) {
    analysis += `👏 Very good results! Most students performed well. Focus on supporting the few struggling students.`;
  } else if (passRate >= 60) {
    analysis += `📚 Good effort overall. Consider revising key concepts and providing additional practice for weaker students.`;
  } else if (passRate >= 40) {
    analysis += `💪 There's room for improvement. Recommend extra classes and one-on-one sessions for struggling students.`;
  } else {
    analysis += `⚠️ Immediate attention needed. Consider re-teaching the topic with different methods and provide remedial classes.`;
  }

  return analysis;
};

export const generateExamRemark = async (
  examRecord: ExamRecord,
  classGroup: ClassGroup
): Promise<string> => {
  const remarks = [
    "Every student has potential - nurture it with patience and dedication.",
    "Education is the most powerful weapon to change the world.",
    "Success is not about the marks, it's about the effort and growth.",
    "Keep inspiring your students - they are the future leaders.",
    "Learning is a treasure that follows its owner everywhere.",
    "Great teachers inspire their students to become the best version of themselves."
  ];

  return remarks[Math.floor(Math.random() * remarks.length)];
};