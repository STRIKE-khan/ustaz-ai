import { TestRecord, ClassGroup, ExamRecord } from "../types";

// Offline-First Local Remarks System
// No internet required - all responses are generated locally

const successRemarks = [
  "Excellent performance! Keep up the great work!",
  "Outstanding effort by the entire class!",
  "The results show dedication and hard work.",
  "Well done! Your students are excelling.",
  "Keep nurturing this talent!",
  "Brilliant results - your teaching is making a difference!",
  "Remarkable progress shown by students.",
  "Great teamwork between teacher and students!"
];

const motivationalQuotes = [
  "Education is the passport to the future.",
  "Every expert was once a beginner.",
  "Success is the sum of small efforts repeated daily.",
  "The beautiful thing about learning is nobody can take it away from you.",
  "Knowledge is power, but enthusiasm pulls the switch.",
  "Strive for progress, not perfection.",
  "Learning never exhausts the mind.",
  "Education is the key to unlock the golden door of freedom."
];

const getRandomItem = (arr: string[]): string => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const generateTestAnalysis = async (
  testRecord: TestRecord, 
  classGroup: ClassGroup
): Promise<string> => {
  // Calculate class statistics locally
  const results = testRecord.results;
  const totalStudents = results.length;
  const passCount = results.filter(r => r.status === 'PASS').length;
  const passRate = totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 0;
  
  const avgMarks = totalStudents > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.marksObtained, 0) / totalStudents) 
    : 0;

  // Generate local analysis
  let analysis = `📊 Class Performance Summary\n\n`;
  analysis += `Subject: ${testRecord.subject}\n`;
  analysis += `Total Students: ${totalStudents}\n`;
  analysis += `Pass Rate: ${passRate}%\n`;
  analysis += `Average Marks: ${avgMarks}/${testRecord.totalMarks}\n\n`;
  
  if (passRate >= 80) {
    analysis += `🌟 Teacher's Remark: ${getRandomItem(successRemarks)}`;
  } else if (passRate >= 50) {
    analysis += `📈 Teacher's Remark: Good progress! Focus on weaker areas to improve further.`;
  } else {
    analysis += `💪 Teacher's Remark: Room for improvement. Extra attention needed for struggling students.`;
  }

  return analysis;
};

export const generateExamRemark = async (
  examRecord: ExamRecord,
  classGroup: ClassGroup
): Promise<string> => {
  // Return a random motivational quote - works completely offline
  return getRandomItem(motivationalQuotes);
};