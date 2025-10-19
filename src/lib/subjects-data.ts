// Copyright (C) 2025 Akshay K Rooben abraham

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

// Function to convert number to Roman numeral for grades 1-12
const toRoman = (num: number): string => {
    const roman: { [key: string]: number } = { X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let result = '';
    if (num > 10) {
        result += 'X' + toRoman(num - 10);
    } else {
        for (let key in roman) {
            while (num >= roman[key]) {
                result += key;
                num -= roman[key];
            }
        }
    }
    return result;
};

const createClass = (grade: number, division: string, stream?: Stream): ClassData => {
    const romanGrade = toRoman(grade);
    const streamName = stream ? ` (${stream})` : '';
    return {
        name: `${romanGrade}-${division.toUpperCase()}${streamName}`,
        grade,
        stream,
    };
};

const createClassesForGrade = (grade: number, divisions: string[]): ClassData[] => {
    return divisions.map(div => createClass(grade, div));
}

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
    ...createClassesForGrade(1, ['a', 'b']),
    ...createClassesForGrade(2, ['a', 'b']),
    ...createClassesForGrade(3, ['a', 'b']),
    ...createClassesForGrade(4, ['a', 'b']),
    ...createClassesForGrade(5, ['a', 'b']),
    ...createClassesForGrade(6, ['a', 'b', 'c']),
    ...createClassesForGrade(7, ['a', 'b', 'c']),
    ...createClassesForGrade(8, ['a', 'b', 'c']),
    ...createClassesForGrade(9, ['a', 'b', 'c']),
    ...createClassesForGrade(10, ['a', 'b', 'c']),
    createClass(11, 'a', 'Bio-Maths'),
    createClass(11, 'b', 'CS'),
    createClass(11, 'c', 'Bio-CS/Bio-IP'),
    createClass(11, 'd', 'Commerce'),
    createClass(11, 'e', 'Humanities'),
    createClass(12, 'a', 'Bio-Maths'),
    createClass(12, 'b', 'CS'),
    createClass(12, 'c', 'Bio-CS/Bio-IP'),
    createClass(12, 'd', 'Commerce'),
    createClass(12, 'e', 'Humanities'),
];

export const streamSubjects: Record<Stream, string[]> = {
    'Bio-Maths': ['Physics', 'Chemistry', 'Biology', 'Maths Core', 'English'],
    'CS': ['Physics', 'Chemistry', 'Maths', 'Computer Science', 'English'],
    'Bio-CS/Bio-IP': ['Physics', 'Chemistry', 'Biology', 'Computer Science', 'Informatics Practices', 'English'],
    'Commerce': ['Business Studies', 'Accountancy', 'Economics', 'Maths', 'Computer Science', 'Informatics Practices', 'English'],
    'Humanities': ['History', 'Economics', 'Political Science', 'Law Studies', 'English'],
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

export function getSubjectsForClasses(classNames: string[]): SubjectData[] {
    if (!classNames || classNames.length === 0) {
        return [];
    }

    const subjectNameSet = new Set<string>();

    classNames.forEach(className => {
        const selectedClass = allClasses.find(c => c.name === className);
        if (selectedClass) {
            let subjects: string[] = [];
            if (selectedClass.grade >= 11 && selectedClass.stream) {
                subjects = streamSubjects[selectedClass.stream];
            } else if (gradeSubjects[selectedClass.grade]) {
                subjects = gradeSubjects[selectedClass.grade];
            }
            subjects.forEach(sub => subjectNameSet.add(sub));
        }
    });

    return allSubjects.filter(subject => subjectNameSet.has(subject.name));
}
export function getSubjectsByStream(stream: Stream): string[] {
    return streamSubjects[stream] || [];
}
    
