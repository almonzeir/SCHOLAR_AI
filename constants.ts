import { Scholarship } from './types';

// FIX: Added `url`, `matchScore`, and `matchReason` to scholarship objects
// to align with the `Scholarship` type definition.
export const MOCK_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 's1',
    name: 'Future Leaders Grant',
    organization: 'Global Innovators Foundation',
    amount: 10000,
    deadline: '2024-12-15',
    description: 'For students with demonstrated leadership potential in STEM fields.',
    eligibility: ['Undergraduate', 'STEM field', '3.5+ GPA'],
    continent: 'North America',
    fieldOfStudy: 'STEM',
    url: '#',
    matchScore: 95,
    matchReason: 'Your profile shows strong leadership and interest in STEM.',
    // FIX: Added missing effortScore property.
    effortScore: 'High',
  },
  {
    id: 's2',
    name: 'Creative Minds Scholarship',
    organization: 'Arts & Culture Council',
    amount: 5000,
    deadline: '2024-11-30',
    description: 'Supporting talented students in the visual and performing arts.',
    eligibility: ['Any level', 'Arts major'],
    continent: 'Europe',
    fieldOfStudy: 'Arts',
    url: '#',
    matchScore: 88,
    matchReason: 'A good fit if you have a background in the arts.',
    // FIX: Added missing effortScore property.
    effortScore: 'Medium',

  },
  {
    id: 's3',
    name: 'Community Service Award',
    organization: 'Local Heroes United',
    amount: 1500,
    deadline: '2024-10-31',
    description: 'Awarded to students with a strong record of volunteer work.',
    eligibility: ['High school senior', 'Undergraduate', '50+ volunteer hours'],
    continent: 'Any',
    fieldOfStudy: 'Any',
    url: '#',
    matchScore: 82,
    matchReason: 'Matches your interest in community involvement.',
    // FIX: Added missing effortScore property.
    effortScore: 'Low',
  },
  {
    id: 's4',
    name: 'Tech Forward Scholarship',
    organization: 'Innovate Solutions Inc.',
    amount: 7500,
    deadline: '2025-01-20',
    description: 'For students pursuing degrees in Computer Science or related fields.',
    eligibility: ['Undergraduate', 'Graduate', 'Computer Science'],
    continent: 'Asia',
    fieldOfStudy: 'STEM',
    url: '#',
    matchScore: 92,
    matchReason: 'Excellent match for your Computer Science background.',
    // FIX: Added missing effortScore property.
    effortScore: 'Medium',
  },
  {
    id: 's5',
    name: 'First Generation Scholars',
    organization: 'University Access Fund',
    amount: 2000,
    deadline: '2024-11-15',
    description: 'A scholarship for students who are the first in their family to attend college.',
    eligibility: ['First-generation student', 'Undergraduate'],
    continent: 'North America',
    fieldOfStudy: 'Any',
    url: '#',
    matchScore: 78,
    matchReason: 'Applicable if you are a first-generation college student.',
    // FIX: Added missing effortScore property.
    effortScore: 'Low',
  },
];
