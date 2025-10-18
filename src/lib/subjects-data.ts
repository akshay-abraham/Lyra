
import {
    BookOpen,
    Languages,
    Globe,
    Sigma,
    Atom,
    FlaskConical,
    Dna,
    BrainCircuit,
    Landmark,
    Scale,
    Map,
    LineChart,
    Calculator,
    Laptop,
    Database,
    Gavel,
    Briefcase,
    BookCopy,
    PenTool,
    type LucideIcon,
} from 'lucide-react';

export type SubjectData = {
    name: string;
    grades: number[];
    icon: LucideIcon;
    color: string;
};

export const allSubjects: SubjectData[] = [
    // 1-5
    { name: 'English', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], icon: BookOpen, color: '#4A90E2' },
    { name: 'Malayalam', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], icon: PenTool, color: '#D0021B' },
    { name: 'Hindi', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], icon: Languages, color: '#F5A623' },
    { name: 'EVS', grades: [1, 2, 3, 4, 5], icon: Globe, color: '#34A853' },
    { name: 'Social Science', grades: [1, 2, 3, 4, 5, 6, 7, 8], icon: Landmark, color: '#6D28D9' },
    { name: 'Maths', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], icon: Sigma, color: '#8B5CF6' },
    { name: 'GK', grades: [1, 2, 3, 4, 5], icon: BookCopy, color: '#7T9C3C' },
    
    // 6-8
    { name: 'Science', grades: [6, 7, 8], icon: Atom, color: '#4CAF50' },
    { name: 'AI', grades: [6, 7, 8, 9, 10], icon: BrainCircuit, color: '#9E9E9E' },

    // 9-10
    { name: 'German', grades: [9, 10], icon: Languages, color: '#FFC107' },
    { name: 'Physics', grades: [9, 10, 11, 12], icon: Atom, color: '#2196F3' },
    { name: 'Chemistry', grades: [9, 10, 11, 12], icon: FlaskConical, color: '#FF5722' },
    { name: 'Biology', grades: [9, 10, 11, 12], icon: Dna, color: '#009688' },
    { name: 'History', grades: [9, 10, 11, 12], icon: Landmark, color: '#795548' },
    { name: 'Democratic Politics', grades: [9, 10], icon: Scale, color: '#607D8B' },
    { name: 'Geography', grades: [9, 10], icon: Map, color: '#8BC34A' },
    { name: 'Economics', grades: [9, 10, 11, 12], icon: LineChart, color: '#F44336' },

    // 11-12
    { name: 'Maths Core', grades: [11, 12], icon: Sigma, color: '#9C27B0' },
    { name: 'Applied Maths', grades: [11, 12], icon: Calculator, color: '#673AB7' },
    { name: 'Computer Science', grades: [11, 12], icon: Laptop, color: '#03A9F4' },
    { name: 'Informatics Practices', grades: [11, 12], icon: Database, color: '#00BCD4' },
    { name: 'Political Science', grades: [11, 12], icon: Scale, color: '#3F51B5' },
    { name: 'Law Studies', grades: [11, 12], icon: Gavel, color: '#9E9E9E' },
    { name: 'Business Studies', grades: [11, 12], icon: Briefcase, color: '#FF9800' },
    { name: 'Accountancy', grades: [11, 12], icon: BookCopy, color: '#CDDC39' },
    { name: 'Other', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], icon: PenTool, color: '#9E9E9E' },
];

export type SubjectName = typeof allSubjects[number]['name'];


export function getSubjectsForUser(role: string | null, grade: string | null): SubjectData[] {
    if (role === 'teacher' || !grade) {
        return allSubjects;
    }

    const gradeNumber = parseInt(grade, 10);
    if (isNaN(gradeNumber)) {
        return allSubjects; // Fallback for safety
    }

    return allSubjects.filter(subject => subject.grades.includes(gradeNumber));
}
