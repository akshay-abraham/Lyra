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
    icon: LucideIcon;
    color: string;
};

export type Stream = 'Bio-Maths' | 'CS' | 'Bio-CS/Bio-IP' | 'Commerce' | 'Humanities';

export type ClassData = {
    name: string;
    grade: number;
    stream?: Stream;
};

export const allSubjects: SubjectData[] = [
    { name: 'English', icon: BookOpen, color: '#4A90E2' },
    { name: 'Malayalam', icon: PenTool, color: '#D0021B' },
    { name: 'Hindi', icon: Languages, color: '#F5A623' },
    { name: 'EVS', icon: Globe, color: '#34A853' },
    { name: 'Social Science', icon: Landmark, color: '#6D28D9' },
    { name: 'Maths', icon: Sigma, color: '#8B5CF6' },
    { name: 'GK', icon: BookCopy, color: '#7T9C3C' },
    { name: 'Science', icon: Atom, color: '#4CAF50' },
    { name: 'AI', icon: BrainCircuit, color: '#9E9E9E' },
    { name: 'German', icon: Languages, color: '#FFC107' },
    { name: 'Physics', icon: Atom, color: '#2196F3' },
    { name: 'Chemistry', icon: FlaskConical, color: '#FF5722' },
    { name: 'Biology', icon: Dna, color: '#009688' },
    { name: 'History', icon: Landmark, color: '#795548' },
    { name: 'Democratic Politics', icon: Scale, color: '#607D8B' },
    { name: 'Geography', icon: Map, color: '#8BC34A' },
    { name: 'Economics', icon: LineChart, color: '#F44336' },
    { name: 'Maths Core', icon: Sigma, color: '#9C27B0' },
    { name: 'Applied Maths', icon: Calculator, color: '#673AB7' },
    { name: 'Computer Science', icon: Laptop, color: '#03A9F4' },
    { name: 'Informatics Practices', icon: Database, color: '#00BCD4' },
    { name: 'Political Science', icon: Scale, color: '#3F51B5' },
    { name: 'Law Studies', icon: Gavel, color: '#9E9E9E' },
    { name: 'Business Studies', icon: Briefcase, color: '#FF9800' },
    { name: 'Accountancy', icon: BookCopy, color: '#CDDC39' },
    { name: 'Other', icon: PenTool, color: '#9E9E9E' },
];

export const allClasses: ClassData[] = [
    { name: '1a', grade: 1 }, { name: '1b', grade: 1 },
    { name: '2a', grade: 2 }, { name: '2b', grade: 2 },
    { name: '3a', grade: 3 }, { name: '3b', grade: 3 },
    { name: '4a', grade: 4 }, { name: '4b', grade: 4 },
    { name: '5a', grade: 5 }, { name: '5b', grade: 5 },
    { name: '6a', grade: 6 }, { name: '6b', grade: 6 }, { name: '6c', grade: 6 },
    { name: '7a', grade: 7 }, { name: '7b', grade: 7 }, { name: '7c', grade: 7 },
    { name: '8a', grade: 8 }, { name: '8b', grade: 8 }, { name: '8c', grade: 8 },
    { name: '9a', grade: 9 }, { name: '9b', grade: 9 }, { name: '9c', grade: 9 },
    { name: '10a', grade: 10 }, { name: '10b', grade: 10 }, { name: '10c', grade: 10 },
    { name: '11a (Bio-Maths)', grade: 11, stream: 'Bio-Maths' },
    { name: '11b (CS)', grade: 11, stream: 'CS' },
    { name: '11c (Bio-CS/Bio-IP)', grade: 11, stream: 'Bio-CS/Bio-IP' },
    { name: '11D (Commerce)', grade: 11, stream: 'Commerce' },
    { name: '11E (Humanities)', grade: 11, stream: 'Humanities' },
    { name: '12a (Bio-Maths)', grade: 12, stream: 'Bio-Maths' },
    { name: '12b (CS)', grade: 12, stream: 'CS' },
    { name: '12c (Bio-CS/Bio-IP)', grade: 12, stream: 'Bio-CS/Bio-IP' },
    { name: '12D (Commerce)', grade: 12, stream: 'Commerce' },
    { name: '12E (Humanities)', grade: 12, stream: 'Humanities' },
];

export const streamSubjects: Record<Stream, string[]> = {
    'Bio-Maths': ['Physics', 'Chemistry', 'Biology', 'Maths Core', 'English'],
    'CS': ['Physics', 'Chemistry', 'Maths', 'Computer Science', 'English'],
    'Bio-CS/Bio-IP': ['Physics', 'Chemistry', 'Biology', 'Computer Science', 'Informatics Practices', 'English'],
    'Commerce': ['Business Studies', 'Accountancy', 'Economics', 'Maths', 'Computer Science', 'Informatics Practices', 'English'],
    'Humanities': ['History', 'Economics', 'Political Science & Legal Studies', 'English'],
};

export const gradeSubjects: Record<number, string[]> = {
    1: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
    2: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
    3: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
    4: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
    5: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
    6: ['English', 'Malayalam', 'Hindi', 'Social Science', 'Maths', 'Science', 'AI'],
    7: ['English', 'Malayalam', 'Hindi', 'Social Science', 'Maths', 'Science', 'AI'],
    8: ['English', 'Malayalam', 'Hindi', 'Social Science', 'Maths', 'Science', 'AI'],
    9: ['English', 'Malayalam', 'Hindi', 'Social Science', 'Maths', 'AI', 'German', 'Physics', 'Chemistry', 'Biology', 'History', 'Democratic Politics', 'Geography', 'Economics'],
    10: ['English', 'Malayalam', 'Hindi', 'Social Science', 'Maths', 'AI', 'German', 'Physics', 'Chemistry', 'Biology', 'History', 'Democratic Politics', 'Geography', 'Economics'],
};


export type SubjectName = typeof allSubjects[number]['name'];


export function getSubjectsForUser(role: string | null, className: string | null): SubjectData[] {
    if (role === 'teacher') {
        return allSubjects.filter(s => s.name !== 'Other');
    }

    if (!className) {
        return allSubjects;
    }

    const selectedClass = allClasses.find(c => c.name === className);
    if (!selectedClass) {
        return allSubjects;
    }

    let subjectNames: string[] = [];
    if (selectedClass.grade >= 11 && selectedClass.stream) {
        subjectNames = streamSubjects[selectedClass.stream];
    } else if (gradeSubjects[selectedClass.grade]) {
        subjectNames = gradeSubjects[selectedClass.grade];
    } else {
         return allSubjects;
    }

    return allSubjects.filter(subject => subjectNames.includes(subject.name));
}