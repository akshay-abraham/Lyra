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
    'Alinta Antony',
    'Ameena Fathima',
    'Ancy George',
    'Ancy P Mathew',
    'Anmol Jolly',
    'Anniamma Mamman',
    'Aranya Krishnankutty',
    'Asha B Kurian',
    'Asha Rose Mathew',
    'Bency Jacob',
    'Bindhu Eapen',
    'Bindhu S',
    'Cathy Thomas',
    'Chithra S Nair',
    'Deepa Abraham',
    'Deepamol C.R',
    'Deepamol M G',
    'Girija C B',
    'Helin Felix',
    'Mrs. Indu Thomas',
    'Jeena Ajith',
    'Jerin Mathew',
    'Jisha Girish',
    'Lainy Elizabeth Chacko',
    'Latha Devi',
    'Lathan J Elizabeth',
    'Letha A R',
    'Manju P James',
    'Maya Devi',
    'Molly K V',
    'Nandini R Nair',
    'Neethu Rose Sebastian',
    'Niji Vinod',
    'Nimmy Merin Alex',
    'Nisha James',
taking 'Nizy Abraham',
    'P.S. Jolly',
    'Prema Sara Cherian',
    'Pretha Korah',
    'Ramachandran Nair',
    'Raymol Joseph',
    'Rekha M R',
    'Remia R',
    'Retheesh',
    'Mr. Rishikesh Babu',
    'Rosamma Mathew',
    'Ruby Maria George',
    'Sajeena G Nair',
    'Sajimol Cherian',
    'Shyama P Thankappan',
    'Siji Simon',
    'Smithamol N Nair',
    'Sreeja K Nair',
    'Sreedevi P V',
    'Vineetha Kumary',
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
