// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Subject and Class Data (`subjects-data.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as a static database for all subjects, classes, and their
 * relationships within the application. It defines the available subjects with
 * their associated icons and colors, lists all possible classes and their streams,
 * and maps subjects to specific grades and streams. This centralized data store
 * makes it easy to manage and update the academic structure of the app.
 *
 * C-like Analogy:
 * This file is like a set of constant, pre-initialized data structures. It's
 * similar to having several `const struct` arrays and lookup tables defined
 * in a `data.c` file, which are then compiled into the program.
 *
 * ```c
 * // In data.h
 * typedef struct { const char* name; IconType icon; const char* color; } SubjectData;
 * extern const SubjectData ALL_SUBJECTS[];
 *
 * // In data.c
 * const SubjectData ALL_SUBJECTS[] = {
 *   { "English", ICON_BOOK, "#4A90E2" },
 *   { "Maths", ICON_SIGMA, "#8B5CF6" },
 *   // ... and so on
 * };
 * ```
 * The functions in this file, like `getSubjectsForUser`, act as query functions
 * that operate on these static data arrays.
 */

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

/**
 * @typedef {object} SubjectData
 * @description Represents a single subject, including its name, icon, and display color.
 */
export type SubjectData = {
  name: string;
  icon: LucideIcon;
  color: string;
};

/**
 * @typedef {string} Stream
 * @description Represents the academic streams for higher grades (11-12).
 */
export type Stream =
  | 'Bio-Maths'
  | 'CS'
  | 'Bio-CS/Bio-IP'
  | 'Commerce'
  | 'Humanities';

/**
 * @typedef {object} ClassData
 * @description Represents a single class, including its name, grade level, and optional stream.
 */
export type ClassData = {
  name: string;
  grade: number;
  stream?: Stream;
};

/**
 * Converts a number from 1-12 into its Roman numeral representation.
 * @param {number} num - The grade number.
 * @returns {string} The Roman numeral string.
 */
const toRoman = (num: number): string => {
  const roman: { [key: string]: number } = { X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let result = '';
  if (num > 10) {
    result += 'X' + toRoman(num - 10);
  } else {
    for (const key in roman) {
      while (num >= roman[key]) {
        result += key;
        num -= roman[key];
      }
    }
  }
  return result;
};

/**
 * Creates a `ClassData` object.
 * @param {number} grade - The grade number.
 * @param {string} division - The class division (e.g., 'A', 'B').
 * @param {Stream} [stream] - The optional academic stream.
 * @returns {ClassData} The created class data object.
 */
const createClass = (
  grade: number,
  division: string,
  stream?: Stream,
): ClassData => {
  const romanGrade = toRoman(grade);
  const streamName = stream ? ` (${stream})` : '';
  return {
    name: `${romanGrade}-${division.toUpperCase()}${streamName}`,
    grade,
    stream,
  };
};

/**
 * Creates an array of `ClassData` objects for a given grade and its divisions.
 * @param {number} grade - The grade number.
 * @param {string[]} divisions - An array of division letters.
 * @returns {ClassData[]} An array of class data objects.
 */
const createClassesForGrade = (
  grade: number,
  divisions: string[],
): ClassData[] => {
  return divisions.map((div) => createClass(grade, div));
};

/**
 * A comprehensive list of all subjects offered.
 * @const {SubjectData[]}
 */
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

/**
 * A comprehensive list of all classes offered in the school.
 * @const {ClassData[]}
 */
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

/**
 * A mapping of academic streams to their respective subjects.
 * @const {Record<Stream, string[]>}
 */
export const streamSubjects: Record<Stream, string[]> = {
  'Bio-Maths': ['Physics', 'Chemistry', 'Biology', 'Maths Core', 'English'],
  CS: ['Physics', 'Chemistry', 'Maths', 'Computer Science', 'English'],
  'Bio-CS/Bio-IP': [
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Informatics Practices',
    'English',
  ],
  Commerce: [
    'Business Studies',
    'Accountancy',
    'Economics',
    'Maths',
    'Computer Science',
    'Informatics Practices',
    'English',
  ],
  Humanities: [
    'History',
    'Economics',
    'Political Science',
    'Law Studies',
    'English',
  ],
};

/**
 * A mapping of grades (1-10) to their respective subjects.
 * @const {Record<number, string[]>}
 */
export const gradeSubjects: Record<number, string[]> = {
  1: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
  2: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
  3: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
  4: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
  5: ['English', 'Malayalam', 'Hindi', 'EVS', 'Maths', 'GK'],
  6: [
    'English',
    'Malayalam',
    'Hindi',
    'Social Science',
    'Maths',
    'Science',
    'AI',
  ],
  7: [
    'English',
    'Malayalam',
    'Hindi',
    'Social Science',
    'Maths',
    'Science',
    'AI',
  ],
  8: [
    'English',
    'Malayalam',
    'Hindi',
    'Social Science',
    'Maths',
    'Science',
    'AI',
  ],
  9: [
    'English',
    'Malayalam',
    'Hindi',
    'Social Science',
    'Maths',
    'AI',
    'German',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Democratic Politics',
    'Geography',
    'Economics',
  ],
  10: [
    'English',
    'Malayalam',
    'Hindi',
    'Social Science',
    'Maths',
    'AI',
    'German',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Democratic Politics',
    'Geography',
    'Economics',
  ],
};

/**
 * A type representing the name of any valid subject.
 * This is generated dynamically from the `allSubjects` array for type safety.
 */
export type SubjectName = (typeof allSubjects)[number]['name'];

/**
 * Gets the list of available subjects for a given user role and class.
 *
 * @param {string | null} role - The user's role ('student' or 'teacher').
 * @param {string | null} className - The user's class name (for students).
 * @returns {SubjectData[]} An array of subject data objects.
 */
export function getSubjectsForUser(
  role: string | null,
  className: string | null,
): SubjectData[] {
  // Teachers can see all subjects for customization purposes.
  if (role === 'teacher') {
    return allSubjects.filter((s) => s.name !== 'Other');
  }

  // If no class is specified, show all subjects as a fallback.
  if (!className) {
    return allSubjects;
  }

  const selectedClass = allClasses.find((c) => c.name === className);
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

  return allSubjects.filter((subject) => subjectNames.includes(subject.name));
}

/**
 * Gets a combined list of all unique subjects taught across multiple classes.
 *
 * @param {string[]} classNames - An array of class names.
 * @returns {SubjectData[]} A unique array of subject data objects.
 */
export function getSubjectsForClasses(classNames: string[]): SubjectData[] {
  if (!classNames || classNames.length === 0) {
    return [];
  }

  const subjectNameSet = new Set<string>();

  classNames.forEach((className) => {
    const selectedClass = allClasses.find((c) => c.name === className);
    if (selectedClass) {
      let subjects: string[] = [];
      if (selectedClass.grade >= 11 && selectedClass.stream) {
        subjects = streamSubjects[selectedClass.stream];
      } else if (gradeSubjects[selectedClass.grade]) {
        subjects = gradeSubjects[selectedClass.grade];
      }
      subjects.forEach((sub) => subjectNameSet.add(sub));
    }
  });

  return allSubjects.filter((subject) => subjectNameSet.has(subject.name));
}

/**
 * Gets a list of subjects for a specific academic stream.
 *
 * @param {Stream} stream - The academic stream.
 * @returns {string[]} An array of subject names for that stream.
 */
export function getSubjectsByStream(stream: Stream): string[] {
  return streamSubjects[stream] || [];
}
