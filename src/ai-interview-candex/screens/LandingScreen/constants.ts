export const SECTIONS = [
  { label: 'Screening', duration: '10 min', description: 'Share your background and experience' },
  { label: 'Technical Q&A', duration: '15 min', description: 'Discuss core concepts and your reasoning.' },
  { label: 'Coding', duration: '35 min', description: 'Solve two coding problems at your pace.' },
  { label: 'System design', duration: '30 min', description: 'Design and explain a scalable system.' },
];

export const INTRO_VIDEOS = [
  { src: `${import.meta.env.BASE_URL}welcome-to-eightfold.mp4`, chip: null },
  { src: `${import.meta.env.BASE_URL}breaks-between-sections.mp4`, chip: 'Even breaks are included' },
  { src: `${import.meta.env.BASE_URL}think-out-loud.mp4`, chip: 'Think out loud' },
  { src: `${import.meta.env.BASE_URL}deep-breath-relax.mp4`, chip: 'Just relax and be yourself' },
];
