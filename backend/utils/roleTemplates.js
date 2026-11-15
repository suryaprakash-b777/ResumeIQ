/**
 * Predefined Career Role Templates with required and preferred skills
 */

const ROLE_TEMPLATES = [
  {
    title: 'Frontend Developer',
    category: 'Software Engineering',
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Tailwind CSS', 'Git'],
    preferredSkills: ['Next.js', 'Redux', 'GraphQL', 'Vite', 'Testing (Jest/Cypress)', 'WebSockets'],
    description: 'Specializes in building modern, responsive, high-performance web user interfaces and single-page applications.'
  },
  {
    title: 'Backend Developer',
    category: 'Software Engineering',
    requiredSkills: ['Node.js', 'Express', 'Python', 'SQL', 'PostgreSQL', 'REST APIs', 'Git'],
    preferredSkills: ['Docker', 'Redis', 'MongoDB', 'Microservices', 'GraphQL', 'AWS', 'CI/CD'],
    description: 'Designs, implements, and maintains server-side logic, microservices, databases, authentication, and core API systems.'
  },
  {
    title: 'Full Stack Developer',
    category: 'Software Engineering',
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Git'],
    preferredSkills: ['Next.js', 'Docker', 'Tailwind CSS', 'Redis', 'AWS', 'REST APIs', 'CI/CD'],
    description: 'End-to-end web engineer capable of orchestrating frontend UI/UX, robust backend APIs, and database persistence architectures.'
  },
  {
    title: 'Data Analyst',
    category: 'Data & Analytics',
    requiredSkills: ['SQL', 'Python', 'Excel', 'Data Analysis', 'Data Visualization', 'Power BI'],
    preferredSkills: ['Tableau', 'Pandas', 'NumPy', 'ETL', 'Statistics', 'Snowflake', 'BigQuery'],
    description: 'Transforms raw business and operational data into actionable insights, dashboards, statistical metrics, and predictive visualizations.'
  },
  {
    title: 'AI/ML Engineer',
    category: 'Artificial Intelligence',
    requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'],
    preferredSkills: ['Scikit-learn', 'NLP', 'Computer Vision', 'Generative AI', 'Docker', 'Hugging Face', 'LangChain'],
    description: 'Designs, trains, fine-tunes, and deploys intelligent models, LLMs, computer vision algorithms, and predictive systems.'
  },
  {
    title: 'Cloud Engineer',
    category: 'Infrastructure',
    requiredSkills: ['AWS', 'Linux', 'Docker', 'Terraform', 'Git', 'CI/CD', 'Networking'],
    preferredSkills: ['Kubernetes', 'Azure', 'Google Cloud', 'Serverless', 'Python', 'Bash', 'Ansible'],
    description: 'Architects, secures, monitors, and provisions reliable, scalable cloud infrastructure and serverless services.'
  },
  {
    title: 'DevOps Engineer',
    category: 'Infrastructure & Automation',
    requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux', 'AWS', 'Bash'],
    preferredSkills: ['Terraform', 'Jenkins', 'Ansible', 'Prometheus', 'Grafana', 'Python', 'Nginx'],
    description: 'Automates deployment pipelines, ensures infrastructure reliability, enforces security standards, and reduces release cycles.'
  },
  {
    title: 'Mobile App Developer',
    category: 'Mobile Engineering',
    requiredSkills: ['JavaScript', 'TypeScript', 'React Native', 'Mobile UI/UX', 'REST APIs', 'Git'],
    preferredSkills: ['Flutter', 'Dart', 'Swift', 'Kotlin', 'Firebase', 'App Store / Play Store Deployment'],
    description: 'Builds fluid, cross-platform or native mobile apps with state management, offline support, and push notifications.'
  },
  {
    title: 'Java Developer',
    category: 'Software Engineering',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'REST APIs', 'Git', 'Maven'],
    preferredSkills: ['Microservices', 'Docker', 'Hibernate', 'Kafka', 'Redis', 'AWS'],
    description: 'Develops enterprise-grade backends, transaction-heavy systems, and scalable APIs using the modern Java & Spring ecosystem.'
  },
  {
    title: 'Python Developer',
    category: 'Software Engineering',
    requiredSkills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'REST APIs', 'Git'],
    preferredSkills: ['Flask', 'Docker', 'Redis', 'Celery', 'Pandas', 'AWS', 'Asyncio'],
    description: 'Builds clean, high-throughput APIs, automated background workflows, web backends, and data integration pipelines in Python.'
  }
];

module.exports = {
  ROLE_TEMPLATES
};

