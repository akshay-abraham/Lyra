
export const subjects = ["Math", "Science", "History", "English", "Coding", "Other"] as const;

type Subject = typeof subjects[number];

const loadingTexts: Record<Subject, string[]> = {
    Math: [
        "Calculating the hypotenuse...",
        "Solving for x...",
        "Dividing by zero... just kidding!",
        "Consulting with Pythagoras...",
        "Finding the area under the curve...",
        "Running the numbers...",
    ],
    Science: [
        "Analyzing the molecular structure...",
        "Calibrating the Bunsen burner...",
        "Sequencing the DNA...",
        "Polishing the microscope lens...",
        "Consulting Newton's laws...",
        "Mixing the chemicals (safely!)...",
    ],
    History: [
        "Dusting off ancient scrolls...",
        "Consulting with Herodotus...",
        "Navigating the annals of time...",
        "Avoiding a time paradox...",
        "Checking the historical records...",
        "Asking the Oracle of Delphi...",
    ],
    English: [
        "Consulting the thesaurus...",
        "Diagramming the sentence structure...",
        "Finding the perfect metaphor...",
        "Scanning epic poems...",
        "Asking Shakespeare for advice...",
        "Brewing a cup of tea for literary inspiration...",
    ],
    Coding: [
        "Compiling the source code...",
        "Resolving merge conflicts...",
        "Searching Stack Overflow...",
        "Debugging a tricky algorithm...",
        "Initializing the flux capacitor...",
        "Deploying to production...",
    ],
    Other: [
        "Opening textbooks...",
        "Consulting with the great thinkers...",
        "Finding where Napoleon left his keys...",
        "Brewing some fresh ideas...",
        "Untangling a knot of knowledge...",
        "Shuffling the library cards...",
    ],
};

// Function to get a random loading text for a given subject
export function getLoadingText(subject: string | null): string {
    const validSubject = subject && subjects.includes(subject as Subject) ? subject as Subject : 'Other';
    const texts = loadingTexts[validSubject];
    return texts[Math.floor(Math.random() * texts.length)];
}
