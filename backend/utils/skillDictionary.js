/**
 * Comprehensive Skill Dictionary for AI Analyzer & ResumeIQ
 * Organized by domains and mapped for regex-safe boundary lookup
 */

const SKILL_DICTIONARY = {
  frontend: [
    'HTML', 'HTML5', 'CSS', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'React.js',
    'Next.js', 'Vue', 'Vue.js', 'Angular', 'Tailwind CSS', 'Redux', 'Redux Toolkit',
    'Sass', 'SCSS', 'Bootstrap', 'Svelte', 'Webpack', 'Vite', 'GraphQL',
    'Responsive Design', 'Material UI', 'Chakra UI', 'Zustand'
  ],
  backend: [
    'Node.js', 'Express', 'Express.js', 'Python', 'Django', 'Flask', 'FastAPI',
    'Java', 'Spring', 'Spring Boot', 'PHP', 'Laravel', 'C#', '.NET', 'ASP.NET',
    'Go', 'Golang', 'Ruby', 'Ruby on Rails', 'NestJS', 'REST APIs', 'RESTful API',
    'GraphQL', 'Microservices', 'gRPC', 'WebSockets'
  ],
  databases: [
    'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis', 'Firebase', 'Supabase',
    'Oracle', 'DynamoDB', 'Cassandra', 'Prisma', 'Mongoose', 'TypeORM', 'Elasticsearch'
  ],
  ai_ml: [
    'Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'OpenCV',
    'NLP', 'Natural Language Processing', 'Machine Learning', 'Deep Learning',
    'Keras', 'Hugging Face', 'Large Language Models', 'LLM', 'LangChain',
    'Computer Vision', 'Data Science', 'Generative AI', 'Gemini API', 'OpenAI'
  ],
  cloud_devops: [
    'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'AWS', 'Amazon Web Services',
    'Azure', 'Google Cloud', 'GCP', 'CI/CD', 'Linux', 'Terraform', 'Nginx',
    'Jenkins', 'Ansible', 'Bash', 'Shell Scripting', 'Serverless', 'Vercel', 'Netlify'
  ],
  data: [
    'SQL', 'Power BI', 'Tableau', 'Excel', 'Data Analysis', 'Data Visualization',
    'ETL', 'Apache Spark', 'Snowflake', 'BigQuery', 'Data Modeling', 'Business Intelligence'
  ],
  soft_skills: [
    'Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Time Management',
    'Critical Thinking', 'Adaptability', 'Collaboration', 'Project Management',
    'Agile', 'Scrum', 'Mentoring', 'Conflict Resolution', 'Analytical Thinking'
  ]
};

// Flattened list of all unique skills
const ALL_SKILLS = Array.from(
  new Set(
    Object.values(SKILL_DICTIONARY).flat()
  )
);

module.exports = {
  SKILL_DICTIONARY,
  ALL_SKILLS
};

