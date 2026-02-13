// Job data for programmatic SEO pages
export interface JobData {
  slug: string;
  title: string;
  titleVariants: string[];

  overview: {
    description: string;
    averageSalaryIndia: { fresher: string; mid: string; senior: string };
    demandLevel: "High" | "Medium" | "Growing";
    topHiringCompanies: string[];
  };

  resumeSections: {
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    certifications: string[];
    keyAchievementExamples: string[];
    actionVerbs: string[];
    atsKeywords: string[];
  };

  summaryExamples: {
    fresher: string;
    midLevel: string;
    senior: string;
  };

  experienceBullets: string[];

  faqs: Array<{ question: string; answer: string }>;

  relatedJobs: string[];
}

export const jobsData: Record<string, JobData> = {
  "software-engineer": {
    slug: "software-engineer",
    title: "Software Engineer",
    titleVariants: ["Software Developer", "SDE", "Application Developer", "Full Stack Developer"],

    overview: {
      description: "Software Engineers design, develop, test, and maintain software applications. They work with programming languages, frameworks, and tools to build solutions that solve business problems.",
      averageSalaryIndia: { fresher: "4-8 LPA", mid: "10-18 LPA", senior: "20-40+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro", "Flipkart", "Paytm"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Data Structures & Algorithms",
        "Object-Oriented Programming",
        "Version Control (Git)",
        "At least one programming language (Java/Python/JavaScript)",
        "Database Management (SQL)",
        "Problem Solving",
      ],
      niceToHaveSkills: [
        "Cloud Platforms (AWS/Azure/GCP)",
        "CI/CD Pipelines",
        "Docker & Kubernetes",
        "System Design",
        "Agile/Scrum Methodology",
        "REST APIs",
      ],
      certifications: [
        "AWS Certified Developer",
        "Microsoft Azure Developer Associate",
        "Google Cloud Professional Developer",
        "Oracle Java Certification",
      ],
      keyAchievementExamples: [
        "Reduced application load time by 40% through code optimization",
        "Led development of microservices architecture serving 1M+ users",
        "Implemented CI/CD pipeline reducing deployment time by 60%",
        "Mentored 5 junior developers improving team productivity by 25%",
      ],
      actionVerbs: [
        "Developed", "Architected", "Implemented", "Optimized", "Designed",
        "Debugged", "Deployed", "Integrated", "Automated", "Refactored",
        "Collaborated", "Led", "Mentored", "Delivered", "Scaled",
      ],
      atsKeywords: [
        "Software Development", "Agile", "Scrum", "Java", "Python", "JavaScript",
        "React", "Node.js", "AWS", "Microservices", "REST API", "SQL", "Git",
        "CI/CD", "Docker", "Kubernetes", "System Design", "Full Stack",
      ],
    },

    summaryExamples: {
      fresher: "Computer Science graduate with strong foundation in data structures, algorithms, and OOP concepts. Proficient in Java and Python with hands-on experience in web development through academic projects. Eager to apply problem-solving skills and contribute to innovative software solutions.",
      midLevel: "Software Engineer with 3+ years of experience building scalable web applications using Java, Spring Boot, and React. Successfully delivered 10+ production features serving 500K+ users. Strong background in microservices architecture and agile development practices.",
      senior: "Senior Software Engineer with 7+ years of experience leading cross-functional teams and architecting enterprise-scale applications. Expert in distributed systems, cloud infrastructure (AWS), and DevOps practices. Track record of reducing operational costs by 35% through system optimization.",
    },

    experienceBullets: [
      "Developed and maintained RESTful APIs using Spring Boot, handling 10K+ requests/minute",
      "Implemented automated testing suite achieving 90% code coverage",
      "Collaborated with product team to deliver features 2 weeks ahead of schedule",
      "Optimized database queries reducing response time by 45%",
      "Led code reviews and established coding standards for the team",
    ],

    faqs: [
      {
        question: "What should a fresher include in a software engineer resume?",
        answer: "Freshers should focus on academic projects, internships, technical skills, and any coding competitions or hackathons participated in. Include your GitHub profile, relevant coursework, and certifications.",
      },
      {
        question: "How long should a software engineer resume be?",
        answer: "For freshers and those with less than 5 years of experience, keep it to 1 page. Senior engineers with 5+ years can extend to 2 pages, but ensure every line adds value.",
      },
      {
        question: "What ATS keywords are important for software engineer resumes?",
        answer: "Key ATS keywords include: programming languages (Java, Python, JavaScript), frameworks (React, Spring, Node.js), methodologies (Agile, Scrum), and technologies (AWS, Docker, Kubernetes, CI/CD).",
      },
      {
        question: "Should I include my GitHub profile on my resume?",
        answer: "Yes, absolutely. Including your GitHub profile showcases your coding skills, open-source contributions, and personal projects. It helps recruiters assess your actual coding abilities.",
      },
    ],

    relatedJobs: ["java-developer", "data-analyst", "web-developer", "devops-engineer"],
  },

  "data-analyst": {
    slug: "data-analyst",
    title: "Data Analyst",
    titleVariants: ["Business Analyst", "Data Scientist", "Analytics Specialist", "BI Analyst"],

    overview: {
      description: "Data Analysts collect, process, and analyze data to help organizations make informed business decisions. They use statistical tools and visualization techniques to identify trends and insights.",
      averageSalaryIndia: { fresher: "3-6 LPA", mid: "8-15 LPA", senior: "18-30+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Deloitte", "Accenture", "Amazon", "Flipkart", "HDFC Bank", "ICICI Bank", "Zomato", "Swiggy"],
    },

    resumeSections: {
      mustHaveSkills: [
        "SQL & Database Management",
        "Excel (Advanced)",
        "Data Visualization (Tableau/Power BI)",
        "Statistical Analysis",
        "Python or R",
        "Data Cleaning & Preprocessing",
      ],
      niceToHaveSkills: [
        "Machine Learning basics",
        "Big Data tools (Hadoop/Spark)",
        "A/B Testing",
        "ETL Processes",
        "Cloud Analytics (AWS/GCP)",
        "Storytelling with data",
      ],
      certifications: [
        "Google Data Analytics Professional Certificate",
        "Microsoft Power BI Data Analyst",
        "Tableau Desktop Specialist",
        "AWS Certified Data Analytics",
      ],
      keyAchievementExamples: [
        "Built dashboards tracking 50+ KPIs resulting in 20% faster decision-making",
        "Identified customer churn patterns saving Rs. 2Cr annually",
        "Automated weekly reporting reducing manual effort by 15 hours/week",
        "Led A/B testing initiatives improving conversion rates by 18%",
      ],
      actionVerbs: [
        "Analyzed", "Visualized", "Reported", "Identified", "Optimized",
        "Automated", "Predicted", "Modeled", "Extracted", "Transformed",
        "Presented", "Discovered", "Quantified", "Streamlined", "Interpreted",
      ],
      atsKeywords: [
        "Data Analysis", "SQL", "Python", "Tableau", "Power BI", "Excel",
        "Statistical Analysis", "Data Visualization", "ETL", "Business Intelligence",
        "KPI", "Dashboard", "Reporting", "Machine Learning", "A/B Testing",
      ],
    },

    summaryExamples: {
      fresher: "Statistics graduate with strong analytical skills and proficiency in SQL, Python, and Excel. Completed Google Data Analytics certification with hands-on experience in data visualization using Tableau. Passionate about turning complex data into actionable business insights.",
      midLevel: "Data Analyst with 3+ years of experience driving data-driven decisions across marketing and finance teams. Expert in SQL, Tableau, and Python with a track record of building automated dashboards that reduced reporting time by 60%. Strong communicator who translates complex findings for non-technical stakeholders.",
      senior: "Senior Data Analyst with 6+ years of experience leading analytics teams and implementing enterprise-wide BI solutions. Specialized in predictive modeling and customer analytics with proven impact of Rs. 5Cr+ in cost savings. Expert in building data infrastructure and mentoring junior analysts.",
    },

    experienceBullets: [
      "Designed and maintained 20+ interactive Tableau dashboards for C-suite executives",
      "Wrote complex SQL queries to extract insights from 10M+ row datasets",
      "Performed cohort analysis identifying high-value customer segments",
      "Automated data pipelines using Python reducing processing time by 70%",
      "Collaborated with cross-functional teams to define and track business KPIs",
    ],

    faqs: [
      {
        question: "What tools should a data analyst know in India?",
        answer: "Essential tools include SQL (most important), Excel, and either Tableau or Power BI. Python or R is increasingly required. For freshers, focus on SQL and one visualization tool first.",
      },
      {
        question: "Is coding necessary for data analyst roles?",
        answer: "SQL is mandatory for almost all data analyst roles. Python/R is beneficial but not always required for entry-level positions. However, coding skills significantly increase your job prospects and salary.",
      },
      {
        question: "How do I show data analyst skills without work experience?",
        answer: "Create personal projects analyzing public datasets (Kaggle, government data), participate in data competitions, complete certifications like Google Data Analytics, and showcase your work on a portfolio website or GitHub.",
      },
      {
        question: "What is the difference between Data Analyst and Business Analyst?",
        answer: "Data Analysts focus more on technical data analysis, SQL, and visualization tools. Business Analysts focus on understanding business requirements and bridging the gap between technical teams and stakeholders. There is significant overlap in many companies.",
      },
    ],

    relatedJobs: ["software-engineer", "business-analyst", "data-scientist", "bi-developer"],
  },

  "java-developer": {
    slug: "java-developer",
    title: "Java Developer",
    titleVariants: ["Java Engineer", "J2EE Developer", "Java Backend Developer", "Spring Developer"],

    overview: {
      description: "Java Developers design and build enterprise applications using Java and related technologies. They work on backend systems, web applications, and distributed systems using frameworks like Spring and Hibernate.",
      averageSalaryIndia: { fresher: "4-7 LPA", mid: "10-20 LPA", senior: "22-45+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["TCS", "Infosys", "Wipro", "Cognizant", "HCL", "Oracle", "IBM", "JP Morgan"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Core Java (Collections, Multithreading, OOP)",
        "Spring Framework (Spring Boot, Spring MVC)",
        "Hibernate/JPA",
        "SQL & Database Design",
        "REST API Development",
        "Maven/Gradle",
      ],
      niceToHaveSkills: [
        "Microservices Architecture",
        "Kafka/RabbitMQ",
        "Docker & Kubernetes",
        "AWS/Azure Cloud Services",
        "JUnit & Mockito",
        "Design Patterns",
      ],
      certifications: [
        "Oracle Certified Professional Java SE",
        "Spring Professional Certification",
        "AWS Certified Developer",
        "Microservices Architecture Certification",
      ],
      keyAchievementExamples: [
        "Developed microservices handling 50K+ transactions per minute",
        "Migrated monolithic application to microservices reducing deployment time by 80%",
        "Implemented caching strategy reducing database load by 60%",
        "Led team of 4 developers delivering project 3 weeks ahead of schedule",
      ],
      actionVerbs: [
        "Developed", "Designed", "Implemented", "Architected", "Optimized",
        "Integrated", "Migrated", "Refactored", "Debugged", "Deployed",
        "Automated", "Scaled", "Led", "Mentored", "Delivered",
      ],
      atsKeywords: [
        "Java", "Spring Boot", "Hibernate", "Microservices", "REST API",
        "J2EE", "Maven", "Gradle", "JUnit", "SQL", "Oracle", "MySQL",
        "Kafka", "Docker", "AWS", "Agile", "Design Patterns", "SOLID",
      ],
    },

    summaryExamples: {
      fresher: "B.Tech Computer Science graduate with strong foundation in Core Java, OOP concepts, and Spring Boot. Developed e-commerce application as final year project handling 1000+ products. Eager to contribute to enterprise Java development and learn industry best practices.",
      midLevel: "Java Developer with 4+ years of experience building scalable backend systems using Spring Boot and Microservices. Successfully delivered 15+ REST APIs processing millions of requests daily. Expertise in database optimization and caching strategies with hands-on AWS experience.",
      senior: "Senior Java Architect with 8+ years of experience designing and implementing enterprise-grade applications for Fortune 500 clients. Led migration of legacy systems to cloud-native microservices architecture. Expert in distributed systems, performance tuning, and team leadership.",
    },

    experienceBullets: [
      "Built RESTful microservices using Spring Boot serving 2M+ daily active users",
      "Implemented database optimization reducing query execution time by 50%",
      "Designed event-driven architecture using Apache Kafka for real-time processing",
      "Created comprehensive unit tests achieving 85% code coverage with JUnit and Mockito",
      "Conducted code reviews ensuring adherence to SOLID principles and clean code practices",
    ],

    faqs: [
      {
        question: "What Java version should I mention on my resume?",
        answer: "Mention Java 8 as minimum (most companies still use it) and highlight experience with Java 11 or Java 17 if you have it. Features like Streams, Lambdas, and Optional should be familiar.",
      },
      {
        question: "Is Spring Boot mandatory for Java developer jobs?",
        answer: "Spring Boot is almost mandatory for most Java backend roles in India. It is the industry standard for building Java microservices and web applications. Focus on Spring Boot, Spring Data JPA, and Spring Security.",
      },
      {
        question: "How important is DSA for Java developer interviews?",
        answer: "Very important. Most product companies and even service companies now test DSA. Focus on Arrays, Strings, LinkedList, Trees, Graphs, and Dynamic Programming. Practice on LeetCode or GeeksForGeeks.",
      },
      {
        question: "Should I include personal projects on my Java developer resume?",
        answer: "Yes, especially for freshers. Include projects that demonstrate Spring Boot, REST APIs, database integration, and deployment. GitHub links add credibility to your claims.",
      },
    ],

    relatedJobs: ["software-engineer", "backend-developer", "full-stack-developer", "devops-engineer"],
  },

  "mba-fresher": {
    slug: "mba-fresher",
    title: "MBA Fresher",
    titleVariants: ["Management Trainee", "Associate", "Business Development Executive", "MBA Graduate"],

    overview: {
      description: "MBA Freshers are recent management graduates looking for entry-level positions in consulting, marketing, finance, operations, or general management. They bring fresh perspectives and business acumen to organizations.",
      averageSalaryIndia: { fresher: "6-15 LPA", mid: "12-25 LPA", senior: "25-50+ LPA" },
      demandLevel: "Medium",
      topHiringCompanies: ["McKinsey", "BCG", "Bain", "Deloitte", "KPMG", "Amazon", "P&G", "Unilever", "HDFC Bank"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Business Analysis",
        "Financial Modeling",
        "Market Research",
        "Presentation Skills",
        "MS Office (Excel, PowerPoint)",
        "Problem Solving",
      ],
      niceToHaveSkills: [
        "SQL & Data Analysis",
        "Digital Marketing",
        "Project Management",
        "CRM Tools (Salesforce)",
        "Python/R basics",
        "Industry-specific knowledge",
      ],
      certifications: [
        "CFA Level 1 (for Finance)",
        "Google Analytics",
        "PMP (Project Management)",
        "Six Sigma Green Belt",
      ],
      keyAchievementExamples: [
        "Led summer internship project resulting in 15% cost reduction",
        "Won inter-B-school case competition among 50+ teams",
        "Organized flagship college fest with 5000+ footfall and Rs. 10L sponsorship",
        "Published research paper on emerging market trends",
      ],
      actionVerbs: [
        "Analyzed", "Led", "Managed", "Developed", "Presented",
        "Researched", "Coordinated", "Strategized", "Implemented", "Optimized",
        "Collaborated", "Negotiated", "Achieved", "Organized", "Delivered",
      ],
      atsKeywords: [
        "MBA", "Business Development", "Strategy", "Market Research", "Financial Analysis",
        "Project Management", "Consulting", "Marketing", "Operations", "Leadership",
        "Stakeholder Management", "P&L", "ROI", "KPI", "Business Strategy",
      ],
    },

    summaryExamples: {
      fresher: "MBA graduate from [B-School] with specialization in Marketing and Finance. Summer internship at [Company] where I led market research initiative covering 500+ customers resulting in new product recommendations. Strong analytical and presentation skills with passion for strategy consulting.",
      midLevel: "Business professional with MBA and 3+ years of post-MBA experience in strategy consulting. Led 10+ client engagements across BFSI and retail sectors delivering measurable business impact. Strong expertise in market entry strategy and operational excellence.",
      senior: "Senior Manager with MBA and 7+ years of experience leading cross-functional teams and P&L responsibility of Rs. 50Cr+. Track record of launching 3 new business verticals and achieving 40% YoY growth. Expert in stakeholder management and strategic planning.",
    },

    experienceBullets: [
      "Conducted market research analyzing 500+ customer responses to identify growth opportunities",
      "Developed financial model for new product launch with projected ROI of 25%",
      "Created 50+ slide strategy deck presented to C-suite executives",
      "Coordinated with cross-functional teams of 15+ members to execute go-to-market strategy",
      "Achieved 120% of internship KPIs receiving pre-placement offer",
    ],

    faqs: [
      {
        question: "How should an MBA fresher format their resume?",
        answer: "Use reverse chronological format highlighting MBA first, then work experience (if any), then undergraduate degree. Keep it to 1 page. Include a strong summary, internship experience, key projects, and leadership roles.",
      },
      {
        question: "What should MBA freshers highlight without work experience?",
        answer: "Focus on internships, case competitions, live projects, leadership roles in college committees, and relevant certifications. Quantify achievements wherever possible (e.g., 'increased event participation by 30%').",
      },
      {
        question: "Is the B-school brand important on MBA resume?",
        answer: "Yes, for campus placements the B-school brand matters significantly. However, post-MBA lateral moves depend more on experience and skills. Always mention your B-school prominently along with batch rank if impressive.",
      },
      {
        question: "Should I mention my pre-MBA work experience?",
        answer: "Yes, if you have pre-MBA work experience, include it. For freshers with 1-3 years of pre-MBA experience, this actually strengthens your resume and shows industry exposure.",
      },
    ],

    relatedJobs: ["business-analyst", "marketing-manager", "finance-analyst", "management-consultant"],
  },
};

// Company-specific data
export interface CompanyData {
  slug: string;
  name: string;
  description: string;
  industry: string;
  headquarter: string;
  employeeCount: string;
  popularRoles: string[];
  hiringProcess: string[];
  resumeTips: string[];
  atsKeywords: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedCompanies: string[];
}

export const companiesData: Record<string, CompanyData> = {
  "tcs": {
    slug: "tcs",
    name: "Tata Consultancy Services (TCS)",
    description: "TCS is India's largest IT services company and a global leader in consulting, technology services, and digital transformation. Part of the Tata Group, TCS serves clients across 46 countries.",
    industry: "IT Services & Consulting",
    headquarter: "Mumbai, India",
    employeeCount: "600,000+",
    popularRoles: [
      "Software Developer",
      "Systems Engineer",
      "Business Analyst",
      "Data Analyst",
      "DevOps Engineer",
      "Cloud Architect",
    ],
    hiringProcess: [
      "Online Application via TCS Careers or Campus",
      "TCS NQT (National Qualifier Test) - Aptitude & Coding",
      "Technical Interview (2-3 rounds)",
      "HR Interview",
      "Background Verification",
    ],
    resumeTips: [
      "Use TCS-friendly keywords like 'Agile', 'Digital Transformation', 'Client Delivery'",
      "Highlight any TCS technologies: Ignio, TCS BaNCS, TCS iON",
      "Emphasize teamwork and client-facing experience",
      "Keep format simple and ATS-friendly - no tables or graphics",
      "Include percentage/CGPA as TCS has academic cutoffs",
    ],
    atsKeywords: [
      "TCS", "Agile", "Digital Transformation", "Client Delivery", "Java",
      ".NET", "Python", "Cloud", "AWS", "Azure", "DevOps", "SDLC",
      "Consulting", "IT Services", "Offshore Delivery", "Team Collaboration",
    ],
    faqs: [
      {
        question: "What is the TCS NQT exam pattern?",
        answer: "TCS NQT has three sections: Numerical Ability, Verbal Ability, and Reasoning Ability for Foundation. Ninja role adds Programming Logic and Coding. Digital role has advanced programming and specialization tests.",
      },
      {
        question: "What is the minimum CGPA/percentage required for TCS?",
        answer: "TCS typically requires 60% or 6.0 CGPA throughout academics (10th, 12th, and graduation) with no active backlogs at the time of appearing for the test.",
      },
      {
        question: "What programming languages should I know for TCS?",
        answer: "For TCS Ninja/Digital roles, focus on at least one language from Java, Python, or C/C++. Knowledge of SQL, basic web technologies, and data structures is also important.",
      },
      {
        question: "How long does TCS hiring process take?",
        answer: "The campus hiring process typically takes 2-4 weeks from NQT to final offer. For lateral hiring, it can take 4-8 weeks depending on the role and background verification.",
      },
    ],
    relatedCompanies: ["infosys", "wipro", "hcl", "cognizant"],
  },
};

// Helper functions
export function getJobData(slug: string): JobData | null {
  return jobsData[slug] || null;
}

export function getCompanyData(slug: string): CompanyData | null {
  return companiesData[slug] || null;
}

export function getAllJobSlugs(): string[] {
  return Object.keys(jobsData);
}

export function getAllCompanySlugs(): string[] {
  return Object.keys(companiesData);
}
