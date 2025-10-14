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
    'Bindhu Eapen', 'Prema Sara Cherian', 'Raymol Joseph', 'Shyama P Thankappan',
    'Vineetha Kumary', 'Nimmy Merin Alex', 'Nisha James', 'Cathy Thomas', 'Anniamma Mamman',
    'Rosamma Mathew', 'Sajeena G Nair', 'Sreedevi P V', 'Sreeja K Nair', 'Helin Felix',
    'Jeena Ajith', 'Latha Devi', 'Retheesh', 'Ancy George', 'Girija C B', 'Siji Simon',
    'Deepa Abraham', 'Sajimol Cherian', 'Molly K V', 'Neethu Rose Sebastian',
    'Bency Jacob', 'Asha Rose Mathew', 'Ancy P Mathew', 'Asha B Kurian', 'Lainy Elizabeth Chacko',
    'Letha A R', 'Manju P James', 'Bindhu S', 'Aranya Krishnankutty', 'Remia R',
    'Niji Vinod', 'Alinta Antony', 'Deepamol M G', 'Maya Devi', 'Deepamol C.R',
    'Smithamol N Nair', 'Pretha Korah', 'Lathan J Elizabeth', 'Nizy Abraham',
    'P.S. Jolly', 'Ruby Maria George', 'Anmol Jolly', 'Jisha Girish', 'Jerin Mathew',
    'Nandini R Nair', 'Ramachandran Nair', 'Chithra S Nair', 'Rekha M R'
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
