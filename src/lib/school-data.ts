
export const schools = [
    'Girideepam Bethany Central School',
    'Girideepam Bethany HSS',
    'Ebenezer International School',
    'Excelsior Public School',
    'Baker Vidhyapeeth',
    'Marian Senior Secondary School',
];

export type SchoolName = 
    | 'Girideepam Bethany Central School'
    | 'Girideepam Bethany HSS'
    | 'Ebenezer International School'
    | 'Excelsior Public School'
    | 'Baker Vidhyapeeth'
    | 'Marian Senior Secondary School'
    | 'guest';

const girideepamTeachers = [
    'Mrs. Alinta Antony',
    'Mrs. Ameena Fathima',
    'Mrs. Ancy George',
    'Mrs. Ancy P Mathew',
    'Mrs. Anmol Jolly',
    'Mrs. Anniamma Mamman',
    'Mrs. Aranya Krishnankutty',
    'Mrs. Asha B Kurian',
    'Mrs. Asha Rose Mathew',
    'Mrs. Bency Jacob',
    'Mrs. Bindhu Eapen',
    'Mrs. Bindhu S',
    'Mrs. Cathy Thomas',
    'Mrs. Chithra S Nair',
    'Mrs. Deepa Abraham',
    'Mrs. Deepamol C.R',
    'Mrs. Deepamol M G',
    'Mrs. Girija C B',
    'Mrs. Helin Felix',
    'Mrs. Indu Thomas',
    'Mrs. Jeena Ajith',
    'Mr. Jerin Mathew',
    'Mrs. Jisha Girish',
    'Mrs. Lainy Elizabeth Chacko',
    'Mrs. Latha Devi',
    'Mrs. Lathan J Elizabeth',
    'Mrs. Letha A R',
    'Mrs. Manju P James',
    'Mrs. Maya Devi',
    'Mrs. Molly K V',
    'Mrs. Nandini R Nair',
    'Mrs. Neethu Rose Sebastian',
    'Mrs. Niji Vinod',
    'Mrs. Nimmy Merin Alex',
    'Mrs. Nisha James',
    'Mrs. Nizy Abraham',
    'Mrs. P.S. Jolly',
    'Mrs. Prema Sara Cherian',
    'Mrs. Pretha Korah',
    'Mr. Ramachandran Nair',
    'Mrs. Raymol Joseph',
    'Mrs. Rekha M R',
    'Mrs. Remia R',
    'Mr. Retheesh',
    'Mr. Rishikesh Babu',
    'Mrs. Rosamma Mathew',
    'Mrs. Ruby Maria George',
    'Mrs. Sajeena G Nair',
    'Mrs. Sajimol Cherian',
    'Mrs. Shyama P Thankappan',
    'Mrs. Siji Simon',
    'Mrs. Smithamol N Nair',
    'Mrs. Sreeja K Nair',
    'Mrs. Sreedevi P V',
    'Mrs. Vineetha Kumary',
];

const girideepamStudents = [
    'Akshay K Rooben Abraham', 'Hrishikesh Chakyar', 'Steve Shiju Samuel', 'Williams Sajeev',
    'Ephron Johnson', 'Ephrim Johnson', 'Femina James', 'Nandhana Baburaj',
    'Manjunath Pillai', 'Ruhammah Trivet', 'Navami Manjesh', 'Ammu Philip',
    'Malavika Satheesh', 'Ameena Fathima'
];


export const teachersBySchool: Record<SchoolName, string[]> = {
    'Girideepam Bethany Central School': girideepamTeachers,
    'Girideepam Bethany HSS': girideepamTeachers,
    'Ebenezer International School': ['Mrs. Smith', 'Mr. Jones'],
    'Excelsior Public School': ['Ms. Davis', 'Mr. Miller'],
    'Baker Vidhyapeeth': ['Dr. Wilson', 'Mrs. Moore'],
    'Marian Senior Secondary School': ['Mr. Taylor', 'Ms. Anderson'],
    'guest': []
};

export const studentsBySchool: Record<SchoolName, string[]> = {
    'Girideepam Bethany Central School': girideepamStudents,
    'Girideepam Bethany HSS': girideepamStudents,
    'Ebenezer International School': ['Alice', 'Bob'],
    'Excelsior Public School': ['Charlie', 'Dana'],
    'Baker Vidhyapeeth': ['Eve', 'Frank'],
    'Marian Senior Secondary School': ['Grace', 'Heidi'],
    'guest': []
};

// --- Password Logic ---
// You can edit the passwords here.

// For teachers:
export const teacherPassword = 'teach';

// For students:
export const getStudentPassword = (name: string) => {
    return name.split(' ')[0].toLowerCase();
};
