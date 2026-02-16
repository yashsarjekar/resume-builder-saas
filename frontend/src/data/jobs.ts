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

  "python-developer": {
    slug: "python-developer",
    title: "Python Developer",
    titleVariants: ["Python Engineer", "Python Programmer", "Backend Python Developer", "Django Developer"],

    overview: {
      description: "Python Developers build applications, automate tasks, and develop backend systems using Python. They work across web development, data science, machine learning, and automation domains.",
      averageSalaryIndia: { fresher: "4-7 LPA", mid: "10-18 LPA", senior: "20-40+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Google", "Amazon", "Microsoft", "Flipkart", "Zomato", "Swiggy", "Razorpay", "PhonePe"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Python Core (OOP, Data Structures)",
        "Web Frameworks (Django/Flask/FastAPI)",
        "REST API Development",
        "SQL & Database Management",
        "Version Control (Git)",
        "Problem Solving & Algorithms",
      ],
      niceToHaveSkills: [
        "Machine Learning (NumPy, Pandas, Scikit-learn)",
        "Docker & Containerization",
        "AWS/GCP Cloud Services",
        "Celery & Task Queues",
        "Redis & Caching",
        "GraphQL",
      ],
      certifications: [
        "PCEP - Certified Entry-Level Python Programmer",
        "PCAP - Certified Associate in Python Programming",
        "AWS Certified Developer",
        "Google Professional Data Engineer",
      ],
      keyAchievementExamples: [
        "Built REST APIs handling 100K+ daily requests with 99.9% uptime",
        "Automated data pipelines reducing manual processing by 20 hours/week",
        "Developed ML model improving prediction accuracy by 25%",
        "Migrated legacy PHP application to Django reducing response time by 60%",
      ],
      actionVerbs: [
        "Developed", "Automated", "Implemented", "Optimized", "Designed",
        "Built", "Deployed", "Integrated", "Scaled", "Refactored",
        "Analyzed", "Created", "Maintained", "Debugged", "Architected",
      ],
      atsKeywords: [
        "Python", "Django", "Flask", "FastAPI", "REST API", "SQL",
        "PostgreSQL", "MongoDB", "Redis", "Celery", "Docker", "AWS",
        "Machine Learning", "Pandas", "NumPy", "Git", "Agile", "Microservices",
      ],
    },

    summaryExamples: {
      fresher: "Computer Science graduate with strong Python programming skills and hands-on experience building web applications using Django. Completed projects in web scraping, automation, and REST API development. Passionate about writing clean, efficient code and solving complex problems.",
      midLevel: "Python Developer with 4+ years of experience building scalable backend systems using Django and FastAPI. Delivered 20+ production APIs serving millions of users. Expertise in database optimization, caching strategies, and cloud deployment on AWS.",
      senior: "Senior Python Engineer with 7+ years of experience architecting high-performance distributed systems. Led teams building ML-powered applications and data pipelines processing 10TB+ daily. Expert in system design, team mentorship, and driving technical excellence.",
    },

    experienceBullets: [
      "Developed RESTful APIs using Django REST Framework serving 500K+ daily users",
      "Implemented asynchronous task processing using Celery reducing job completion time by 70%",
      "Built automated testing suite with pytest achieving 90% code coverage",
      "Optimized database queries and implemented Redis caching improving response time by 50%",
      "Deployed applications on AWS using Docker and implemented CI/CD pipelines",
    ],

    faqs: [
      {
        question: "Which Python framework should I learn first?",
        answer: "Start with Django if you want full-stack capabilities with built-in features. Learn Flask or FastAPI for lightweight microservices. Django is more popular in Indian job market, but FastAPI is growing rapidly.",
      },
      {
        question: "Is Data Science knowledge required for Python developer roles?",
        answer: "Not mandatory for backend roles, but beneficial. Basic knowledge of Pandas and NumPy is helpful. For dedicated Python backend roles, focus on web frameworks, APIs, and databases first.",
      },
      {
        question: "What database should Python developers know?",
        answer: "PostgreSQL is most preferred, followed by MySQL. Also learn MongoDB for NoSQL. Understanding ORMs like Django ORM or SQLAlchemy is essential for most Python roles.",
      },
      {
        question: "How important is DSA for Python developer interviews?",
        answer: "Very important for product companies like Google, Amazon, Flipkart. Service companies focus more on practical Python skills. Practice medium-level LeetCode problems in Python.",
      },
    ],

    relatedJobs: ["software-engineer", "data-analyst", "java-developer", "devops-engineer"],
  },

  "web-developer": {
    slug: "web-developer",
    title: "Web Developer",
    titleVariants: ["Frontend Developer", "Full Stack Developer", "UI Developer", "React Developer"],

    overview: {
      description: "Web Developers create and maintain websites and web applications. They work on frontend (user interface), backend (server-side), or both (full-stack) to deliver seamless web experiences.",
      averageSalaryIndia: { fresher: "3-6 LPA", mid: "8-16 LPA", senior: "18-35+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Capgemini", "Tech Mahindra", "HCL"],
    },

    resumeSections: {
      mustHaveSkills: [
        "HTML5, CSS3, JavaScript",
        "React.js or Angular or Vue.js",
        "Responsive Design",
        "Version Control (Git)",
        "REST APIs & AJAX",
        "Browser DevTools",
      ],
      niceToHaveSkills: [
        "TypeScript",
        "Next.js/Nuxt.js",
        "Node.js & Express",
        "Tailwind CSS/Bootstrap",
        "Testing (Jest, Cypress)",
        "Performance Optimization",
      ],
      certifications: [
        "Meta Frontend Developer Certificate",
        "AWS Certified Cloud Practitioner",
        "Google UX Design Certificate",
        "freeCodeCamp Certifications",
      ],
      keyAchievementExamples: [
        "Built responsive e-commerce website increasing mobile conversions by 40%",
        "Reduced page load time by 60% through code optimization and lazy loading",
        "Developed reusable component library used across 10+ projects",
        "Implemented PWA features improving user engagement by 35%",
      ],
      actionVerbs: [
        "Developed", "Designed", "Built", "Implemented", "Created",
        "Optimized", "Styled", "Integrated", "Debugged", "Deployed",
        "Collaborated", "Maintained", "Tested", "Refactored", "Delivered",
      ],
      atsKeywords: [
        "HTML", "CSS", "JavaScript", "React", "Angular", "Vue.js",
        "TypeScript", "Node.js", "REST API", "Responsive Design", "Git",
        "Webpack", "npm", "SASS", "Bootstrap", "Tailwind", "Frontend",
      ],
    },

    summaryExamples: {
      fresher: "BCA graduate with passion for creating beautiful, responsive websites. Proficient in HTML, CSS, JavaScript, and React.js. Built 5+ personal projects including portfolio website and e-commerce clone. Eager to contribute to meaningful web applications.",
      midLevel: "Web Developer with 3+ years of experience building modern web applications using React.js and Node.js. Delivered 15+ client projects with focus on performance and user experience. Strong expertise in responsive design and cross-browser compatibility.",
      senior: "Senior Frontend Developer with 6+ years of experience leading web development teams. Expert in React ecosystem, performance optimization, and scalable frontend architecture. Track record of mentoring developers and establishing best practices.",
    },

    experienceBullets: [
      "Built responsive web applications using React.js serving 100K+ monthly users",
      "Implemented pixel-perfect designs from Figma mockups with 98% accuracy",
      "Reduced bundle size by 40% through code splitting and lazy loading",
      "Developed reusable UI components reducing development time by 30%",
      "Collaborated with UX team to improve website accessibility to WCAG 2.1 standards",
    ],

    faqs: [
      {
        question: "Should I learn React, Angular, or Vue?",
        answer: "React has the highest demand in India, followed by Angular. Vue is growing but has fewer job openings. Start with React for maximum job opportunities, then learn others based on job requirements.",
      },
      {
        question: "Is backend knowledge necessary for web developers?",
        answer: "Basic backend knowledge (Node.js, APIs) makes you more valuable. Full-stack developers earn 20-30% more. Start with frontend, then gradually learn backend technologies.",
      },
      {
        question: "How important is a portfolio for web developers?",
        answer: "Extremely important. Your portfolio is proof of your skills. Include 3-5 quality projects with live demos and GitHub links. A well-designed portfolio can compensate for lack of formal experience.",
      },
      {
        question: "What should I include in my web developer portfolio?",
        answer: "Include diverse projects: one e-commerce site, one dashboard/admin panel, one API-integrated app, and one creative/personal project. Show responsive design, clean code, and problem-solving ability.",
      },
    ],

    relatedJobs: ["software-engineer", "python-developer", "java-developer", "ui-ux-designer"],
  },

  "devops-engineer": {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    titleVariants: ["Site Reliability Engineer", "Platform Engineer", "Cloud Engineer", "Infrastructure Engineer"],

    overview: {
      description: "DevOps Engineers bridge development and operations, automating deployment pipelines, managing infrastructure, and ensuring system reliability. They implement CI/CD, containerization, and cloud infrastructure.",
      averageSalaryIndia: { fresher: "5-9 LPA", mid: "12-22 LPA", senior: "25-50+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Amazon", "Google", "Microsoft", "Flipkart", "Paytm", "Razorpay", "Freshworks", "Zoho"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Linux Administration",
        "Docker & Containerization",
        "CI/CD (Jenkins/GitLab CI/GitHub Actions)",
        "Cloud Platforms (AWS/Azure/GCP)",
        "Scripting (Bash/Python)",
        "Version Control (Git)",
      ],
      niceToHaveSkills: [
        "Kubernetes & Container Orchestration",
        "Infrastructure as Code (Terraform/Ansible)",
        "Monitoring (Prometheus/Grafana/ELK)",
        "Networking & Security",
        "Serverless Architecture",
        "Service Mesh (Istio)",
      ],
      certifications: [
        "AWS Certified DevOps Engineer",
        "Certified Kubernetes Administrator (CKA)",
        "HashiCorp Terraform Associate",
        "Azure DevOps Engineer Expert",
      ],
      keyAchievementExamples: [
        "Implemented CI/CD pipeline reducing deployment time from 2 hours to 10 minutes",
        "Migrated 50+ microservices to Kubernetes achieving 99.99% uptime",
        "Reduced cloud costs by 40% through resource optimization and auto-scaling",
        "Built monitoring infrastructure providing real-time alerts for 200+ services",
      ],
      actionVerbs: [
        "Automated", "Deployed", "Implemented", "Configured", "Managed",
        "Optimized", "Monitored", "Scaled", "Migrated", "Orchestrated",
        "Built", "Maintained", "Secured", "Troubleshot", "Streamlined",
      ],
      atsKeywords: [
        "DevOps", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD",
        "Jenkins", "Terraform", "Ansible", "Linux", "Monitoring", "Prometheus",
        "Grafana", "Infrastructure as Code", "Microservices", "SRE", "CloudOps",
      ],
    },

    summaryExamples: {
      fresher: "B.Tech graduate with strong Linux fundamentals and hands-on experience in Docker, AWS, and CI/CD pipelines. Completed projects in container orchestration and infrastructure automation. AWS Cloud Practitioner certified with passion for automation and reliability.",
      midLevel: "DevOps Engineer with 4+ years of experience building and managing cloud infrastructure on AWS. Implemented CI/CD pipelines for 30+ applications reducing deployment failures by 80%. Expertise in Docker, Kubernetes, and Infrastructure as Code using Terraform.",
      senior: "Senior DevOps Engineer with 7+ years of experience leading platform teams and architecting cloud-native infrastructure. Managed infrastructure serving 10M+ users with 99.99% availability. Expert in Kubernetes, multi-cloud strategies, and driving DevOps culture.",
    },

    experienceBullets: [
      "Designed and implemented CI/CD pipelines using Jenkins and GitLab CI for 50+ repositories",
      "Managed Kubernetes clusters running 200+ pods across multiple environments",
      "Automated infrastructure provisioning using Terraform reducing setup time by 90%",
      "Implemented monitoring and alerting using Prometheus and Grafana for proactive issue detection",
      "Reduced AWS costs by 35% through right-sizing instances and implementing spot instances",
    ],

    faqs: [
      {
        question: "Which cloud platform should I learn for DevOps in India?",
        answer: "AWS has the highest demand in India (60%+ job listings), followed by Azure (25%) and GCP (15%). Start with AWS, get certified, then learn Azure for enterprise roles.",
      },
      {
        question: "Is coding knowledge required for DevOps?",
        answer: "Yes, scripting is essential. Learn Bash for Linux automation and Python for complex scripting. You don't need to be a developer, but reading and writing code is necessary.",
      },
      {
        question: "How do I transition from developer to DevOps?",
        answer: "Start with Linux basics, learn Docker, understand CI/CD concepts, get hands-on with one cloud platform (AWS recommended). Your development background is actually an advantage in DevOps.",
      },
      {
        question: "What is the difference between DevOps and SRE?",
        answer: "DevOps focuses on development-operations collaboration and automation. SRE (Site Reliability Engineering) focuses on system reliability, SLOs, and error budgets. SRE roles typically pay higher and require deeper systems knowledge.",
      },
    ],

    relatedJobs: ["software-engineer", "python-developer", "cloud-architect", "system-administrator"],
  },

  "product-manager": {
    slug: "product-manager",
    title: "Product Manager",
    titleVariants: ["Associate Product Manager", "Senior PM", "Technical Product Manager", "Product Owner"],

    overview: {
      description: "Product Managers define product vision, strategy, and roadmap. They work at the intersection of business, technology, and user experience to build products that solve customer problems and drive business growth.",
      averageSalaryIndia: { fresher: "8-15 LPA", mid: "18-35 LPA", senior: "40-80+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Google", "Microsoft", "Amazon", "Flipkart", "Swiggy", "Razorpay", "CRED", "PhonePe"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Product Strategy & Roadmapping",
        "User Research & Customer Insights",
        "Data Analysis & Metrics",
        "Stakeholder Management",
        "Agile/Scrum Methodology",
        "Prioritization Frameworks (RICE, MoSCoW)",
      ],
      niceToHaveSkills: [
        "SQL & Data Querying",
        "A/B Testing & Experimentation",
        "Wireframing (Figma/Sketch)",
        "Technical Understanding (APIs, Databases)",
        "Growth Hacking",
        "Go-to-Market Strategy",
      ],
      certifications: [
        "Product Management Certificate (ISB/IIM)",
        "CSPO - Certified Scrum Product Owner",
        "Google Analytics Certification",
        "Pragmatic Marketing Certification",
      ],
      keyAchievementExamples: [
        "Launched feature that increased user engagement by 45% and revenue by Rs. 2Cr",
        "Led product from 0-1, achieving 100K downloads in first quarter",
        "Reduced customer churn by 30% through data-driven product improvements",
        "Managed product with Rs. 50Cr annual revenue and 2M active users",
      ],
      actionVerbs: [
        "Launched", "Led", "Defined", "Prioritized", "Analyzed",
        "Collaborated", "Drove", "Shipped", "Optimized", "Researched",
        "Strategized", "Coordinated", "Measured", "Iterated", "Scaled",
      ],
      atsKeywords: [
        "Product Management", "Product Strategy", "Roadmap", "User Research",
        "Agile", "Scrum", "A/B Testing", "Metrics", "KPI", "OKR",
        "Stakeholder Management", "Go-to-Market", "PRD", "User Stories", "MVP",
      ],
    },

    summaryExamples: {
      fresher: "MBA graduate with strong analytical skills and passion for building user-centric products. Led product initiatives during internship resulting in 20% improvement in user activation. Certified Scrum Product Owner with hands-on experience in Agile methodologies.",
      midLevel: "Product Manager with 4+ years of experience shipping consumer and B2B products. Led end-to-end product lifecycle for features generating Rs. 10Cr+ revenue. Strong expertise in user research, data analysis, and cross-functional collaboration.",
      senior: "Senior Product Manager with 8+ years of experience leading product teams at scale. Managed P&L of Rs. 100Cr+ product portfolio with team of 5 PMs. Track record of 0-1 product launches and driving 3x growth through strategic initiatives.",
    },

    experienceBullets: [
      "Defined product roadmap and led cross-functional team of 15 engineers and designers",
      "Conducted 50+ user interviews to identify pain points and validate product hypotheses",
      "Launched 3 major features resulting in 40% increase in daily active users",
      "Established product metrics framework tracking 20+ KPIs for data-driven decisions",
      "Collaborated with engineering to reduce feature delivery time by 30% using Agile practices",
    ],

    faqs: [
      {
        question: "How do I become a Product Manager without technical background?",
        answer: "Focus on transferable skills: analytical thinking, user empathy, communication. Get PM certifications, build side projects, contribute to open source products. Many successful PMs come from consulting, marketing, or operations backgrounds.",
      },
      {
        question: "Is MBA required for Product Management in India?",
        answer: "Not mandatory, but helps for campus placements at top companies. Many PMs have engineering backgrounds with product experience. MBA from top B-schools helps for senior PM roles and consulting-to-PM transitions.",
      },
      {
        question: "What tools should Product Managers know?",
        answer: "Essential: Jira/Asana (project management), Figma (design reviews), SQL (data analysis), Analytics tools (Mixpanel/Amplitude). Nice to have: Notion, Miro, Productboard.",
      },
      {
        question: "How important is coding for Product Managers?",
        answer: "Not required to code, but technical understanding helps. Know how APIs work, understand databases, read basic code. Technical PMs (who can code) are paid 20-30% more at tech companies.",
      },
    ],

    relatedJobs: ["business-analyst", "data-analyst", "mba-fresher", "ux-designer"],
  },

  "digital-marketing-manager": {
    slug: "digital-marketing-manager",
    title: "Digital Marketing Manager",
    titleVariants: ["Marketing Manager", "Growth Manager", "Performance Marketing Manager", "SEO Specialist"],

    overview: {
      description: "Digital Marketing Managers plan and execute online marketing campaigns across channels like SEO, SEM, social media, and email. They drive customer acquisition, engagement, and revenue through data-driven strategies.",
      averageSalaryIndia: { fresher: "3-6 LPA", mid: "8-18 LPA", senior: "20-40+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Google", "Facebook", "Amazon", "Flipkart", "Swiggy", "Zomato", "Nykaa", "MakeMyTrip"],
    },

    resumeSections: {
      mustHaveSkills: [
        "SEO & Content Marketing",
        "Google Ads & Facebook Ads",
        "Google Analytics",
        "Social Media Marketing",
        "Email Marketing",
        "Marketing Automation",
      ],
      niceToHaveSkills: [
        "SQL for Marketing Analytics",
        "CRM Tools (HubSpot/Salesforce)",
        "A/B Testing & CRO",
        "Affiliate Marketing",
        "Influencer Marketing",
        "Marketing Attribution",
      ],
      certifications: [
        "Google Ads Certification",
        "Google Analytics Certification",
        "HubSpot Inbound Marketing",
        "Facebook Blueprint Certification",
      ],
      keyAchievementExamples: [
        "Increased organic traffic by 200% through SEO optimization in 6 months",
        "Managed Rs. 1Cr monthly ad spend with 3.5x ROAS",
        "Built email list from 10K to 100K subscribers with 25% open rate",
        "Reduced CAC by 40% through funnel optimization and remarketing",
      ],
      actionVerbs: [
        "Managed", "Optimized", "Increased", "Launched", "Analyzed",
        "Drove", "Created", "Scaled", "Developed", "Executed",
        "Measured", "Improved", "Generated", "Automated", "Strategized",
      ],
      atsKeywords: [
        "Digital Marketing", "SEO", "SEM", "Google Ads", "Facebook Ads",
        "Social Media", "Content Marketing", "Email Marketing", "Analytics",
        "ROAS", "CAC", "LTV", "Conversion Rate", "Performance Marketing", "Growth",
      ],
    },

    summaryExamples: {
      fresher: "BBA graduate with Google Ads and Analytics certifications. Managed social media accounts with 50K+ followers during internship. Hands-on experience in SEO, content marketing, and paid campaigns. Passionate about data-driven marketing and growth.",
      midLevel: "Digital Marketing Manager with 4+ years of experience driving customer acquisition across SEO, paid ads, and social media. Managed annual marketing budget of Rs. 2Cr with consistent 3x ROAS. Expert in marketing analytics and conversion optimization.",
      senior: "Senior Marketing Manager with 7+ years of experience leading marketing teams and P&L responsibility. Scaled startup from 10K to 1M users through growth marketing strategies. Expert in performance marketing, brand building, and team leadership.",
    },

    experienceBullets: [
      "Managed Google Ads campaigns with Rs. 50L monthly budget achieving 4x ROAS",
      "Increased organic search traffic by 150% through technical SEO and content strategy",
      "Built and executed email marketing campaigns with 30% open rate and 5% CTR",
      "Launched influencer marketing program generating 10K+ new customers monthly",
      "Implemented marketing automation reducing manual effort by 20 hours/week",
    ],

    faqs: [
      {
        question: "Which digital marketing skill is most in demand?",
        answer: "Performance marketing (Google Ads, Facebook Ads) has highest demand and pays best. SEO is also crucial but takes longer to show results. Learn paid marketing first, then add SEO and content marketing.",
      },
      {
        question: "Are certifications important for digital marketing?",
        answer: "Yes, especially Google Ads and Analytics certifications. They're free and validate your skills. HubSpot and Facebook Blueprint also add value. Certifications help especially for freshers and career changers.",
      },
      {
        question: "How do I build a portfolio without work experience?",
        answer: "Run campaigns for small businesses/NGOs for free, start a blog and grow its traffic, manage social media for local businesses, create case studies of hypothetical campaigns. Document everything with screenshots and metrics.",
      },
      {
        question: "What is the career path for digital marketers?",
        answer: "Start as Executive/Analyst → Manager → Senior Manager → Head of Marketing/CMO. Specialization paths include SEO Lead, Paid Marketing Lead, or Growth Lead. Some transition to Product or Business Development roles.",
      },
    ],

    relatedJobs: ["product-manager", "business-analyst", "content-writer", "data-analyst"],
  },

  "btech-fresher": {
    slug: "btech-fresher",
    title: "B.Tech Fresher",
    titleVariants: ["Engineering Graduate", "B.E. Fresher", "Graduate Engineer Trainee", "Software Trainee"],

    overview: {
      description: "B.Tech Freshers are recent engineering graduates seeking entry-level positions in software development, IT services, core engineering, or technology consulting. They bring technical education and fresh perspectives.",
      averageSalaryIndia: { fresher: "3-8 LPA", mid: "8-15 LPA", senior: "15-30+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Capgemini", "Tech Mahindra", "HCL"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Programming (Java/Python/C++)",
        "Data Structures & Algorithms",
        "Database Management (SQL)",
        "Object-Oriented Programming",
        "Problem Solving",
        "Basic Web Technologies",
      ],
      niceToHaveSkills: [
        "Web Development (React/Angular)",
        "Cloud Basics (AWS/Azure)",
        "Git & Version Control",
        "Linux Fundamentals",
        "Testing & Debugging",
        "Soft Skills & Communication",
      ],
      certifications: [
        "AWS Cloud Practitioner",
        "Microsoft Azure Fundamentals",
        "NPTEL Certifications",
        "Coursera/Udemy Course Certificates",
      ],
      keyAchievementExamples: [
        "Developed final year project selected for college tech fest exhibition",
        "Secured top 5% rank in college coding competitions",
        "Completed 3-month internship with pre-placement offer",
        "Published research paper in IEEE conference",
      ],
      actionVerbs: [
        "Developed", "Built", "Designed", "Implemented", "Created",
        "Participated", "Completed", "Achieved", "Learned", "Collaborated",
        "Presented", "Organized", "Led", "Contributed", "Researched",
      ],
      atsKeywords: [
        "B.Tech", "Computer Science", "Engineering", "Programming", "Java",
        "Python", "SQL", "Data Structures", "Algorithms", "OOP",
        "Web Development", "Software Development", "Fresher", "Graduate",
      ],
    },

    summaryExamples: {
      fresher: "B.Tech Computer Science graduate from [College] with 8.5 CGPA. Strong foundation in Java, Python, and data structures with hands-on experience in web development. Completed internship at [Company] working on backend development. Eager to start career in software development.",
      midLevel: "Software Engineer with B.Tech and 2+ years of experience in full-stack development. Proficient in Java, Spring Boot, and React. Successfully delivered 5+ production projects. Strong problem-solving skills and passion for learning new technologies.",
      senior: "Senior Engineer with B.Tech and 5+ years of experience leading development teams. Expert in system design and architecture. Track record of mentoring freshers and delivering complex projects. Strong technical and leadership skills.",
    },

    experienceBullets: [
      "Developed e-commerce web application using Java Spring Boot and React as final year project",
      "Completed 6-month internship building REST APIs for customer management system",
      "Participated in Smart India Hackathon reaching regional finals among 500+ teams",
      "Led technical team of 4 members for college tech fest website development",
      "Achieved 5-star rating on HackerRank in Problem Solving and Java",
    ],

    faqs: [
      {
        question: "What CGPA is required for campus placements?",
        answer: "Most IT companies require 60% or 6.0 CGPA minimum. Product companies like Google, Microsoft prefer 7.0+. No active backlogs is usually mandatory. Some companies consider 10th and 12th marks as well.",
      },
      {
        question: "How important are projects on B.Tech fresher resume?",
        answer: "Very important. Projects demonstrate practical skills and problem-solving ability. Include 2-3 quality projects with GitHub links. Final year project should be highlighted prominently.",
      },
      {
        question: "Should I include 10th and 12th marks on my resume?",
        answer: "Yes, include them for fresher resumes as many companies have cutoffs. Once you have 2+ years of experience, you can remove school marks. Format: Board Name - Percentage/CGPA - Year.",
      },
      {
        question: "How to prepare for TCS NQT and similar exams?",
        answer: "Focus on aptitude (quant, verbal, reasoning), basic programming in any language, and coding practice. Use platforms like PrepInsta, GeeksForGeeks. Practice previous year papers. Give mock tests regularly.",
      },
    ],

    relatedJobs: ["software-engineer", "java-developer", "python-developer", "web-developer"],
  },

  "business-analyst": {
    slug: "business-analyst",
    title: "Business Analyst",
    titleVariants: ["BA", "IT Business Analyst", "Systems Analyst", "Requirements Analyst"],

    overview: {
      description: "Business Analysts bridge the gap between business needs and technology solutions. They analyze processes, gather requirements, and work with stakeholders to deliver solutions that meet organizational goals.",
      averageSalaryIndia: { fresher: "4-7 LPA", mid: "10-18 LPA", senior: "20-35+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Deloitte", "EY", "KPMG"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Requirements Gathering & Documentation",
        "Business Process Modeling",
        "Stakeholder Management",
        "Data Analysis & SQL",
        "Agile/Scrum Methodology",
        "Communication & Presentation",
      ],
      niceToHaveSkills: [
        "JIRA & Confluence",
        "Power BI/Tableau",
        "UML & Flowcharting",
        "Domain Knowledge (BFSI/Healthcare/Retail)",
        "API Understanding",
        "User Story Writing",
      ],
      certifications: [
        "CBAP - Certified Business Analysis Professional",
        "PMI-PBA - Professional in Business Analysis",
        "ECBA - Entry Certificate in Business Analysis",
        "Scrum Master Certification",
      ],
      keyAchievementExamples: [
        "Led requirements gathering for CRM implementation serving 50K+ customers",
        "Reduced process cycle time by 40% through workflow automation recommendations",
        "Managed UAT for banking application with zero critical defects post-launch",
        "Delivered 15+ BRDs and FRDs for enterprise digital transformation project",
      ],
      actionVerbs: [
        "Analyzed", "Documented", "Facilitated", "Gathered", "Identified",
        "Collaborated", "Translated", "Presented", "Validated", "Streamlined",
        "Coordinated", "Recommended", "Mapped", "Defined", "Managed",
      ],
      atsKeywords: [
        "Business Analysis", "Requirements", "BRD", "FRD", "User Stories",
        "Agile", "Scrum", "JIRA", "SQL", "Stakeholder Management",
        "UAT", "Process Improvement", "Data Analysis", "Documentation", "SDLC",
      ],
    },

    summaryExamples: {
      fresher: "MBA graduate with strong analytical and communication skills. Completed internship in business analysis involving requirements documentation and process mapping. Proficient in SQL, Excel, and JIRA. Eager to apply problem-solving skills in a Business Analyst role.",
      midLevel: "Business Analyst with 4+ years of experience in BFSI domain. Led requirements gathering for 10+ projects involving digital banking and payment solutions. Expert in Agile methodologies, stakeholder management, and creating comprehensive BRDs and user stories.",
      senior: "Senior Business Analyst with 8+ years of experience leading BA teams and managing complex enterprise projects. Delivered digital transformation initiatives impacting 1M+ users. Expert in domain analysis, solution design, and cross-functional team collaboration.",
    },

    experienceBullets: [
      "Gathered and documented requirements from 20+ stakeholders for enterprise CRM implementation",
      "Created detailed BRDs, FRDs, and user stories for Agile development teams",
      "Conducted gap analysis identifying 30+ process improvement opportunities",
      "Facilitated UAT sessions with business users ensuring 98% acceptance rate",
      "Collaborated with developers and QA to resolve 50+ requirement clarifications",
    ],

    faqs: [
      {
        question: "What qualifications are needed for Business Analyst roles?",
        answer: "MBA or engineering degree is preferred. Domain knowledge in BFSI, Healthcare, or Retail adds value. Technical understanding of SQL and basic programming helps. Certifications like CBAP or ECBA boost your profile.",
      },
      {
        question: "Is coding required for Business Analysts?",
        answer: "Not mandatory, but SQL knowledge is essential for data analysis. Basic understanding of APIs, databases, and software architecture helps communicate effectively with development teams.",
      },
      {
        question: "How to transition from developer to Business Analyst?",
        answer: "Leverage your technical background as an advantage. Focus on soft skills, learn BA tools and techniques, understand business processes. Your tech knowledge will help in technical BA roles.",
      },
      {
        question: "What is the difference between Business Analyst and Product Manager?",
        answer: "BA focuses on requirements and process analysis, working within defined scope. PM owns product vision, strategy, and roadmap. PMs have more decision-making authority while BAs are more execution-focused.",
      },
    ],

    relatedJobs: ["product-manager", "data-analyst", "mba-fresher", "software-engineer"],
  },

  "ui-ux-designer": {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    titleVariants: ["UX Designer", "UI Designer", "Product Designer", "Interaction Designer"],

    overview: {
      description: "UI/UX Designers create intuitive and visually appealing digital experiences. They research user needs, design interfaces, create prototypes, and ensure products are both functional and delightful to use.",
      averageSalaryIndia: { fresher: "4-7 LPA", mid: "10-20 LPA", senior: "22-45+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Google", "Microsoft", "Flipkart", "Swiggy", "Razorpay", "CRED", "Myntra", "Zomato"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Figma/Sketch/Adobe XD",
        "User Research & Personas",
        "Wireframing & Prototyping",
        "Visual Design Principles",
        "Information Architecture",
        "Usability Testing",
      ],
      niceToHaveSkills: [
        "HTML/CSS Basics",
        "Design Systems",
        "Motion Design (After Effects)",
        "A/B Testing",
        "Analytics Tools",
        "Accessibility Standards (WCAG)",
      ],
      certifications: [
        "Google UX Design Certificate",
        "Nielsen Norman UX Certification",
        "IDF Interaction Design Foundation",
        "Adobe Certified Professional",
      ],
      keyAchievementExamples: [
        "Redesigned checkout flow increasing conversion rate by 35%",
        "Created design system used across 5 products by 20+ designers",
        "Led UX research with 50+ user interviews improving NPS by 25 points",
        "Designed mobile app achieving 4.7 rating on Play Store with 1M+ downloads",
      ],
      actionVerbs: [
        "Designed", "Created", "Prototyped", "Researched", "Conducted",
        "Collaborated", "Iterated", "Tested", "Delivered", "Led",
        "Improved", "Analyzed", "Conceptualized", "Streamlined", "Developed",
      ],
      atsKeywords: [
        "UI Design", "UX Design", "Figma", "Sketch", "Adobe XD", "Prototype",
        "Wireframe", "User Research", "Usability Testing", "Design System",
        "Visual Design", "Interaction Design", "Mobile Design", "Web Design", "User Journey",
      ],
    },

    summaryExamples: {
      fresher: "Design graduate with strong visual design skills and passion for creating user-centered experiences. Proficient in Figma and Adobe Creative Suite. Completed Google UX Design certification with portfolio of 5+ projects including mobile app and e-commerce redesign.",
      midLevel: "UI/UX Designer with 4+ years of experience designing consumer products used by millions. Led end-to-end design for fintech app with 500K+ users. Expert in user research, prototyping, and creating scalable design systems.",
      senior: "Senior Product Designer with 7+ years of experience leading design teams at scale. Managed design for products generating Rs. 100Cr+ revenue. Expert in design strategy, team mentorship, and driving design culture across organizations.",
    },

    experienceBullets: [
      "Designed end-to-end user experience for mobile app with 500K+ monthly active users",
      "Conducted user research with 30+ interviews identifying key pain points and opportunities",
      "Created comprehensive design system with 100+ components used across 3 products",
      "Collaborated with PM and engineering to ship 20+ features with 95% design fidelity",
      "Improved task completion rate by 40% through iterative usability testing and refinement",
    ],

    faqs: [
      {
        question: "What software should UI/UX designers learn?",
        answer: "Figma is the industry standard now. Also learn Adobe Creative Suite (Photoshop, Illustrator) for visual assets. Sketch is still used but declining. Prototyping tools like Principle or ProtoPie are nice to have.",
      },
      {
        question: "Is coding necessary for UI/UX designers?",
        answer: "Not mandatory, but basic HTML/CSS understanding helps communicate with developers and understand technical constraints. It's increasingly valued, especially for product designer roles.",
      },
      {
        question: "How important is a portfolio for designers?",
        answer: "Extremely important - it's more valued than your resume. Include 3-5 case studies showing your process, not just final designs. Explain problems, research, iterations, and results with metrics.",
      },
      {
        question: "What is the difference between UI and UX design?",
        answer: "UX (User Experience) focuses on how products work - research, information architecture, user flows. UI (User Interface) focuses on how products look - visual design, typography, colors. Most roles combine both.",
      },
    ],

    relatedJobs: ["product-manager", "web-developer", "software-engineer", "digital-marketing-manager"],
  },

  "cloud-architect": {
    slug: "cloud-architect",
    title: "Cloud Architect",
    titleVariants: ["AWS Architect", "Azure Architect", "Solutions Architect", "Cloud Solutions Engineer"],

    overview: {
      description: "Cloud Architects design and oversee cloud computing strategy including cloud adoption plans, architecture design, and application migration. They ensure scalability, security, and cost optimization of cloud infrastructure.",
      averageSalaryIndia: { fresher: "8-12 LPA", mid: "18-35 LPA", senior: "40-80+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Amazon", "Microsoft", "Google", "TCS", "Infosys", "Wipro", "Accenture", "HCL"],
    },

    resumeSections: {
      mustHaveSkills: [
        "AWS/Azure/GCP Services",
        "Cloud Architecture Patterns",
        "Infrastructure as Code (Terraform)",
        "Containerization (Docker/Kubernetes)",
        "Security & Compliance",
        "Cost Optimization",
      ],
      niceToHaveSkills: [
        "Multi-Cloud Strategy",
        "Serverless Architecture",
        "DevOps Practices",
        "Database Migration",
        "Networking (VPC, Load Balancers)",
        "Disaster Recovery Planning",
      ],
      certifications: [
        "AWS Solutions Architect Professional",
        "Azure Solutions Architect Expert",
        "Google Cloud Professional Architect",
        "HashiCorp Terraform Associate",
      ],
      keyAchievementExamples: [
        "Designed multi-region AWS architecture supporting 10M+ users with 99.99% uptime",
        "Led cloud migration of 100+ applications reducing infrastructure costs by 45%",
        "Implemented auto-scaling solutions handling 10x traffic spikes during sales events",
        "Designed disaster recovery solution achieving RPO of 1 hour and RTO of 4 hours",
      ],
      actionVerbs: [
        "Architected", "Designed", "Implemented", "Migrated", "Optimized",
        "Led", "Automated", "Scaled", "Secured", "Transformed",
        "Managed", "Deployed", "Configured", "Evaluated", "Planned",
      ],
      atsKeywords: [
        "Cloud Architecture", "AWS", "Azure", "GCP", "Solutions Architect",
        "Terraform", "Kubernetes", "Docker", "Microservices", "Serverless",
        "Cloud Migration", "Infrastructure as Code", "DevOps", "Security", "Cost Optimization",
      ],
    },

    summaryExamples: {
      fresher: "AWS Certified Solutions Architect with strong foundation in cloud services and infrastructure. Completed hands-on projects in EC2, S3, Lambda, and VPC. B.Tech in Computer Science with passion for cloud computing and distributed systems.",
      midLevel: "Cloud Architect with 5+ years of experience designing scalable AWS solutions. Led migration of 50+ applications to cloud reducing costs by 35%. Expert in serverless architecture, container orchestration, and infrastructure automation.",
      senior: "Principal Cloud Architect with 10+ years of experience leading enterprise cloud transformations. Designed multi-cloud strategies for Fortune 500 clients managing $10M+ cloud spend. Expert in cloud security, governance, and team leadership.",
    },

    experienceBullets: [
      "Architected microservices infrastructure on AWS serving 5M+ daily active users",
      "Led cloud migration project moving 75 applications from on-premise to AWS",
      "Implemented Terraform-based IaC reducing infrastructure provisioning time by 90%",
      "Designed cost optimization strategy reducing monthly AWS spend by $200K",
      "Built CI/CD pipelines for 30+ services achieving 50+ deployments per day",
    ],

    faqs: [
      {
        question: "Which cloud platform should I learn first?",
        answer: "AWS has the largest market share (60%+) in India. Start with AWS, get certified, then learn Azure for enterprise clients. GCP is growing but has fewer jobs currently.",
      },
      {
        question: "What certifications are most valued?",
        answer: "AWS Solutions Architect (Associate then Professional) is most valued. Azure Administrator and Azure Solutions Architect are important for Microsoft shops. Multiple cloud certifications increase your market value.",
      },
      {
        question: "Can I become a Cloud Architect without coding background?",
        answer: "Development experience is valuable but not mandatory. Focus on infrastructure, networking, and scripting (Python/Bash). Understanding how applications work helps design better architectures.",
      },
      {
        question: "How do I get hands-on experience without a job?",
        answer: "Use AWS Free Tier, Azure Free Account, or GCP Free Credits. Build projects: deploy websites, set up databases, create VPCs. Document everything for your portfolio. Cloud certifications include hands-on labs.",
      },
    ],

    relatedJobs: ["devops-engineer", "software-engineer", "python-developer", "data-analyst"],
  },

  "hr-manager": {
    slug: "hr-manager",
    title: "HR Manager",
    titleVariants: ["Human Resources Manager", "HR Business Partner", "People Manager", "Talent Manager"],

    overview: {
      description: "HR Managers oversee employee relations, recruitment, training, and organizational development. They ensure compliance with labor laws, manage compensation, and drive employee engagement initiatives.",
      averageSalaryIndia: { fresher: "4-7 LPA", mid: "10-18 LPA", senior: "20-40+ LPA" },
      demandLevel: "Growing",
      topHiringCompanies: ["TCS", "Infosys", "Wipro", "Amazon", "Google", "Deloitte", "KPMG", "Flipkart"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Recruitment & Talent Acquisition",
        "Employee Relations",
        "HR Policies & Compliance",
        "Performance Management",
        "Training & Development",
        "HRMS Tools (Workday/SAP)",
      ],
      niceToHaveSkills: [
        "HR Analytics",
        "Compensation & Benefits",
        "Organizational Development",
        "Change Management",
        "Employer Branding",
        "Labor Law Knowledge",
      ],
      certifications: [
        "SHRM-CP/SHRM-SCP",
        "PHR/SPHR",
        "HRCI Certification",
        "LinkedIn Talent Insights",
      ],
      keyAchievementExamples: [
        "Reduced time-to-hire by 40% through streamlined recruitment process",
        "Improved employee retention by 25% through engagement initiatives",
        "Led HRMS implementation for 5000+ employees across 10 locations",
        "Managed campus hiring program recruiting 500+ freshers annually",
      ],
      actionVerbs: [
        "Managed", "Recruited", "Developed", "Implemented", "Led",
        "Coordinated", "Facilitated", "Designed", "Improved", "Streamlined",
        "Conducted", "Trained", "Resolved", "Administered", "Transformed",
      ],
      atsKeywords: [
        "Human Resources", "Recruitment", "Talent Acquisition", "Employee Engagement",
        "Performance Management", "Training", "HRMS", "Compensation", "Benefits",
        "Compliance", "Labor Laws", "Onboarding", "HR Analytics", "HRBP", "Retention",
      ],
    },

    summaryExamples: {
      fresher: "MBA HR graduate with internship experience in recruitment and employee engagement. Proficient in HRMS tools and MS Excel. Strong communication and interpersonal skills. Eager to contribute to talent management and organizational development.",
      midLevel: "HR Manager with 5+ years of experience in IT services industry. Managed end-to-end HR operations for 2000+ employees. Expert in talent acquisition, employee engagement, and HR analytics. Successfully reduced attrition by 30%.",
      senior: "Senior HR Director with 12+ years of experience leading HR transformation. Managed HR for 10,000+ employee organization. Expert in strategic HR planning, M&A integration, and building high-performance cultures.",
    },

    experienceBullets: [
      "Managed recruitment for 200+ positions annually with 90% offer acceptance rate",
      "Implemented employee engagement programs improving eNPS score from 30 to 65",
      "Designed and rolled out performance management system for 3000+ employees",
      "Conducted training needs analysis and delivered 100+ training hours monthly",
      "Ensured compliance with labor laws across 5 states with zero audit findings",
    ],

    faqs: [
      {
        question: "Is MBA mandatory for HR Manager roles?",
        answer: "MBA HR is preferred for managerial roles but not always mandatory. Experience and certifications like SHRM-CP can compensate. For entry-level HR, any graduate with HR aptitude can start.",
      },
      {
        question: "Which HR specialization is in most demand?",
        answer: "Talent Acquisition and HR Business Partnering have high demand. HR Analytics is growing rapidly. Compensation & Benefits experts are always needed but require specialized knowledge.",
      },
      {
        question: "What tools should HR professionals know?",
        answer: "HRMS tools like Workday, SAP SuccessFactors, or Darwinbox. ATS tools like Lever, Greenhouse. MS Excel for analytics. LinkedIn Recruiter for talent acquisition. Learning basic SQL helps.",
      },
      {
        question: "How to transition from IT to HR?",
        answer: "Start with technical recruitment or HR roles in IT companies where your tech background adds value. Get HR certifications. Your IT experience helps understand business context and communicate with technical teams.",
      },
    ],

    relatedJobs: ["mba-fresher", "business-analyst", "product-manager", "digital-marketing-manager"],
  },

  "machine-learning-engineer": {
    slug: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    titleVariants: ["ML Engineer", "AI Engineer", "Deep Learning Engineer", "Data Scientist"],

    overview: {
      description: "Machine Learning Engineers design, build, and deploy ML models that solve real-world problems. They work on data pipelines, model training, optimization, and putting models into production at scale.",
      averageSalaryIndia: { fresher: "8-15 LPA", mid: "18-35 LPA", senior: "40-80+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Google", "Microsoft", "Amazon", "Meta", "Flipkart", "Swiggy", "Razorpay", "PhonePe"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Python (NumPy, Pandas, Scikit-learn)",
        "Deep Learning (TensorFlow/PyTorch)",
        "Machine Learning Algorithms",
        "Data Preprocessing & Feature Engineering",
        "Model Training & Evaluation",
        "SQL & Data Analysis",
      ],
      niceToHaveSkills: [
        "MLOps (MLflow, Kubeflow)",
        "Cloud ML Services (SageMaker/Vertex AI)",
        "NLP/Computer Vision",
        "Big Data (Spark)",
        "Docker & Kubernetes",
        "A/B Testing & Experimentation",
      ],
      certifications: [
        "AWS Machine Learning Specialty",
        "Google Professional ML Engineer",
        "TensorFlow Developer Certificate",
        "Deep Learning Specialization (Coursera)",
      ],
      keyAchievementExamples: [
        "Built recommendation engine increasing user engagement by 40%",
        "Deployed fraud detection model saving Rs. 50Cr annually",
        "Reduced model inference latency by 70% through optimization",
        "Created NLP pipeline processing 1M+ documents daily with 95% accuracy",
      ],
      actionVerbs: [
        "Developed", "Built", "Trained", "Deployed", "Optimized",
        "Designed", "Implemented", "Analyzed", "Improved", "Automated",
        "Created", "Experimented", "Scaled", "Researched", "Delivered",
      ],
      atsKeywords: [
        "Machine Learning", "Deep Learning", "Python", "TensorFlow", "PyTorch",
        "NLP", "Computer Vision", "Data Science", "Model Deployment", "MLOps",
        "Neural Networks", "Feature Engineering", "AWS SageMaker", "Scikit-learn", "AI",
      ],
    },

    summaryExamples: {
      fresher: "M.Tech in AI/ML with strong foundation in machine learning algorithms and deep learning. Published research paper on NLP. Proficient in Python, TensorFlow, and PyTorch. Completed projects in image classification and sentiment analysis.",
      midLevel: "ML Engineer with 4+ years of experience building and deploying production ML systems. Developed recommendation engine serving 10M+ users. Expert in NLP, deep learning, and MLOps practices.",
      senior: "Senior ML Engineer with 8+ years of experience leading AI initiatives. Built ML platform serving 50+ models in production. Expert in system design for ML, team leadership, and driving AI strategy.",
    },

    experienceBullets: [
      "Developed product recommendation model increasing click-through rate by 35%",
      "Built and deployed NLP pipeline for sentiment analysis processing 500K reviews daily",
      "Implemented MLOps practices reducing model deployment time from weeks to hours",
      "Optimized deep learning models achieving 3x inference speedup on production",
      "Led data labeling and feature engineering for computer vision project",
    ],

    faqs: [
      {
        question: "What is the difference between Data Scientist and ML Engineer?",
        answer: "Data Scientists focus on analysis, insights, and model development. ML Engineers focus on putting models into production, scaling, and maintaining them. ML Engineers need more software engineering skills.",
      },
      {
        question: "Do I need a Masters degree for ML roles?",
        answer: "Not mandatory but helpful for research-focused roles. Many ML Engineers have B.Tech with strong portfolio. M.Tech/PhD from good institutes helps at top companies. Experience and projects matter more.",
      },
      {
        question: "Which framework should I learn - TensorFlow or PyTorch?",
        answer: "PyTorch is more popular in research and startups. TensorFlow is used more in production at large companies. Learn one deeply, then pick up the other. Both are essential for senior roles.",
      },
      {
        question: "How important is mathematics for ML?",
        answer: "Very important. Need strong foundation in linear algebra, calculus, probability, and statistics. Understanding math helps debug models and design better solutions. Don't just call library functions.",
      },
    ],

    relatedJobs: ["data-analyst", "python-developer", "software-engineer", "devops-engineer"],
  },

  "qa-engineer": {
    slug: "qa-engineer",
    title: "QA Engineer",
    titleVariants: ["Quality Assurance Engineer", "Test Engineer", "SDET", "Automation Tester"],

    overview: {
      description: "QA Engineers ensure software quality through testing strategies, automation frameworks, and quality processes. They identify defects, create test plans, and work with development teams to deliver reliable software.",
      averageSalaryIndia: { fresher: "3-6 LPA", mid: "8-16 LPA", senior: "18-35+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Microsoft", "Amazon", "Flipkart"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Manual Testing",
        "Test Case Design",
        "Automation Testing (Selenium)",
        "API Testing (Postman/RestAssured)",
        "Defect Management (JIRA)",
        "Agile/Scrum Testing",
      ],
      niceToHaveSkills: [
        "Performance Testing (JMeter)",
        "Mobile Testing (Appium)",
        "CI/CD Integration",
        "Security Testing Basics",
        "Programming (Java/Python)",
        "BDD (Cucumber)",
      ],
      certifications: [
        "ISTQB Foundation Level",
        "ISTQB Advanced Level",
        "Selenium Certification",
        "AWS Certified DevOps Engineer",
      ],
      keyAchievementExamples: [
        "Built automation framework reducing regression testing time by 70%",
        "Achieved 95% defect detection rate in UAT phase",
        "Automated 500+ test cases achieving 80% test coverage",
        "Reduced production defects by 60% through shift-left testing",
      ],
      actionVerbs: [
        "Tested", "Automated", "Developed", "Executed", "Identified",
        "Designed", "Validated", "Documented", "Collaborated", "Improved",
        "Reported", "Analyzed", "Implemented", "Reviewed", "Verified",
      ],
      atsKeywords: [
        "Quality Assurance", "Testing", "Selenium", "Automation", "Manual Testing",
        "API Testing", "JIRA", "Test Cases", "Defect", "Regression",
        "Agile", "ISTQB", "Test Plan", "QA", "SDET", "Performance Testing",
      ],
    },

    summaryExamples: {
      fresher: "B.Tech graduate with ISTQB Foundation certification. Completed internship in software testing involving manual and automation testing using Selenium. Proficient in Java, SQL, and JIRA. Passionate about software quality and testing methodologies.",
      midLevel: "QA Engineer with 4+ years of experience in web and mobile application testing. Built automation frameworks using Selenium and Appium. Achieved 80% automation coverage reducing testing cycles by 60%. Expert in API testing and CI/CD integration.",
      senior: "QA Lead with 8+ years of experience managing testing for enterprise applications. Led team of 10 QA engineers across multiple projects. Expert in test strategy, automation architecture, and quality metrics. Drove QA transformation initiatives.",
    },

    experienceBullets: [
      "Developed Selenium automation framework with Page Object Model for e-commerce application",
      "Executed 1000+ test cases across functional, regression, and integration testing",
      "Automated API testing using RestAssured reducing manual API testing effort by 80%",
      "Integrated automated tests with Jenkins CI/CD pipeline for continuous testing",
      "Identified and reported 500+ defects with detailed reproduction steps and severity analysis",
    ],

    faqs: [
      {
        question: "Is coding required for QA roles?",
        answer: "For manual testing, basic coding helps but isn't mandatory. For automation testing and SDET roles, programming (Java/Python) is essential. The industry is moving towards automation, so learning to code is recommended.",
      },
      {
        question: "Which automation tool should I learn?",
        answer: "Selenium is the most widely used for web testing. Learn Appium for mobile testing. Cypress is gaining popularity for modern web apps. RestAssured for API automation. Know at least one tool well.",
      },
      {
        question: "What is the career path for QA Engineers?",
        answer: "QA Engineer → Senior QA → QA Lead → QA Manager → QA Director. You can specialize in automation architecture, performance testing, or security testing. Some transition to DevOps or Product Management.",
      },
      {
        question: "Is QA a good career in 2025?",
        answer: "Yes, but the role is evolving. Pure manual testing roles are declining. SDET and automation roles are in high demand. Performance, security, and AI testing are growing areas. Upskill in automation and programming.",
      },
    ],

    relatedJobs: ["software-engineer", "devops-engineer", "python-developer", "java-developer"],
  },

  "android-developer": {
    slug: "android-developer",
    title: "Android Developer",
    titleVariants: ["Mobile Developer", "Android Engineer", "Kotlin Developer", "Mobile App Developer"],

    overview: {
      description: "Android Developers build mobile applications for Android devices using Java or Kotlin. They create user interfaces, integrate APIs, optimize performance, and publish apps on Google Play Store.",
      averageSalaryIndia: { fresher: "4-8 LPA", mid: "10-20 LPA", senior: "22-45+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Google", "Flipkart", "Swiggy", "PhonePe", "Paytm", "Amazon", "Microsoft", "Uber"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Kotlin/Java",
        "Android SDK & Android Studio",
        "MVVM/MVP Architecture",
        "REST API Integration",
        "Material Design",
        "Git Version Control",
      ],
      niceToHaveSkills: [
        "Jetpack Compose",
        "Kotlin Coroutines & Flow",
        "Dependency Injection (Dagger/Hilt)",
        "Room Database",
        "Firebase Services",
        "Unit & UI Testing",
      ],
      certifications: [
        "Associate Android Developer (Google)",
        "Kotlin Developer Certification",
        "Firebase Certification",
        "AWS Mobile Specialty",
      ],
      keyAchievementExamples: [
        "Built Android app with 1M+ downloads and 4.5 rating on Play Store",
        "Reduced app crash rate by 80% through performance optimization",
        "Implemented offline-first architecture reducing data usage by 50%",
        "Led migration from Java to Kotlin improving code maintainability",
      ],
      actionVerbs: [
        "Developed", "Built", "Designed", "Implemented", "Optimized",
        "Integrated", "Published", "Debugged", "Maintained", "Collaborated",
        "Created", "Migrated", "Tested", "Delivered", "Enhanced",
      ],
      atsKeywords: [
        "Android", "Kotlin", "Java", "Android Studio", "Mobile Development",
        "MVVM", "Jetpack", "REST API", "Firebase", "Material Design",
        "Coroutines", "Room", "Dagger", "Hilt", "Play Store", "Mobile App",
      ],
    },

    summaryExamples: {
      fresher: "B.Tech graduate with strong Android development skills. Built 3+ apps using Kotlin and published on Play Store. Proficient in MVVM architecture, Retrofit, and Room database. Google Certified Associate Android Developer.",
      midLevel: "Android Developer with 4+ years of experience building consumer apps. Delivered apps with 5M+ combined downloads. Expert in Kotlin, Jetpack components, and modern Android architecture. Strong background in performance optimization.",
      senior: "Senior Android Engineer with 7+ years of experience leading mobile teams. Architected apps serving 10M+ users. Expert in app modularization, build optimization, and team mentorship. Active contributor to Android open source community.",
    },

    experienceBullets: [
      "Developed e-commerce Android app with 2M+ downloads and 4.6 rating on Play Store",
      "Implemented Jetpack Compose UI reducing development time by 40%",
      "Built offline-first architecture using Room database and WorkManager",
      "Integrated payment gateways (Razorpay, Paytm) handling Rs. 10Cr+ monthly transactions",
      "Reduced app size by 35% through ProGuard optimization and resource shrinking",
    ],

    faqs: [
      {
        question: "Should I learn Kotlin or Java for Android?",
        answer: "Kotlin is the recommended language by Google and industry standard now. Learn Kotlin first. Java knowledge helps for legacy codebases. Most new projects use Kotlin exclusively.",
      },
      {
        question: "Is Jetpack Compose replacing XML layouts?",
        answer: "Jetpack Compose is the future of Android UI. New projects are adopting it rapidly. XML won't disappear immediately but Compose is becoming essential. Learn both, prioritize Compose for new learning.",
      },
      {
        question: "What projects should I build for portfolio?",
        answer: "Build apps that demonstrate different skills: one with REST API integration, one with local database, one with real-time features (Firebase). Publish on Play Store if possible. Clone popular apps to show capability.",
      },
      {
        question: "How to transition from web to Android development?",
        answer: "Your programming fundamentals transfer well. Learn Kotlin basics (similar to other languages), understand Android lifecycle, study common architecture patterns (MVVM). Build small apps to understand the platform.",
      },
    ],

    relatedJobs: ["software-engineer", "java-developer", "web-developer", "ui-ux-designer"],
  },

  "salesforce-developer": {
    slug: "salesforce-developer",
    title: "Salesforce Developer",
    titleVariants: ["Salesforce Engineer", "SFDC Developer", "Salesforce Consultant", "Lightning Developer"],

    overview: {
      description: "Salesforce Developers customize and extend Salesforce CRM platform using Apex, Lightning, and integrations. They build custom applications, automate processes, and implement CRM solutions for businesses.",
      averageSalaryIndia: { fresher: "5-9 LPA", mid: "12-25 LPA", senior: "28-55+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Salesforce", "Accenture", "Deloitte", "Cognizant", "Infosys", "TCS", "Capgemini", "IBM"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Apex Programming",
        "Lightning Web Components (LWC)",
        "SOQL & SOSL",
        "Salesforce Administration",
        "Process Builder & Flows",
        "Salesforce Integration",
      ],
      niceToHaveSkills: [
        "Salesforce DX",
        "REST/SOAP APIs",
        "JavaScript & HTML",
        "Visualforce (Legacy)",
        "Einstein Analytics",
        "CPQ/Service Cloud/Marketing Cloud",
      ],
      certifications: [
        "Salesforce Platform Developer I",
        "Salesforce Platform Developer II",
        "Salesforce Administrator",
        "Salesforce Application Architect",
      ],
      keyAchievementExamples: [
        "Built custom Lightning application reducing sales process time by 50%",
        "Integrated Salesforce with 5 external systems using REST APIs",
        "Automated 100+ business processes using Flows and Process Builder",
        "Led Salesforce implementation for 500+ users across 3 countries",
      ],
      actionVerbs: [
        "Developed", "Customized", "Integrated", "Automated", "Implemented",
        "Configured", "Built", "Designed", "Deployed", "Optimized",
        "Migrated", "Supported", "Collaborated", "Delivered", "Led",
      ],
      atsKeywords: [
        "Salesforce", "Apex", "Lightning", "LWC", "SOQL", "SFDC",
        "CRM", "Process Builder", "Flow", "Integration", "Visualforce",
        "Administrator", "Developer", "Platform", "Service Cloud", "Sales Cloud",
      ],
    },

    summaryExamples: {
      fresher: "Salesforce Certified Platform Developer I with hands-on experience in Apex and Lightning Web Components. Completed Trailhead Ranger status with 100+ badges. Built 3+ projects including custom applications and integrations. Eager to start career in Salesforce development.",
      midLevel: "Salesforce Developer with 4+ years of experience in Sales Cloud and Service Cloud implementations. Delivered 15+ projects including custom apps, integrations, and data migrations. Expert in Apex, LWC, and Salesforce DX practices.",
      senior: "Senior Salesforce Architect with 8+ years of experience leading CRM transformations. Architected solutions for Fortune 500 clients. Expert in multi-cloud implementations, integration patterns, and team leadership. 10+ Salesforce certifications.",
    },

    experienceBullets: [
      "Developed custom Lightning application for sales tracking used by 300+ users daily",
      "Built REST API integrations connecting Salesforce with ERP and marketing systems",
      "Created automated workflows using Flow Builder reducing manual data entry by 60%",
      "Implemented Sales Cloud features increasing sales team productivity by 35%",
      "Led data migration of 2M+ records from legacy CRM to Salesforce",
    ],

    faqs: [
      {
        question: "How to start a career in Salesforce?",
        answer: "Start with Trailhead (free learning platform by Salesforce). Get Salesforce Administrator certification first, then Platform Developer I. Build projects on free Developer Edition. Salesforce skills are in high demand globally.",
      },
      {
        question: "Is coding required for Salesforce?",
        answer: "For Administrator roles, minimal coding is needed. For Developer roles, Apex (similar to Java) and JavaScript are essential. Lightning Web Components require JavaScript knowledge. Start with admin, then learn development.",
      },
      {
        question: "What is the earning potential in Salesforce?",
        answer: "Salesforce professionals are well-paid globally. Certified developers earn 30-50% more. Senior architects can earn Rs. 50L+ in India. International remote opportunities are common. Certifications directly impact salary.",
      },
      {
        question: "Which Salesforce certification should I get first?",
        answer: "Start with Salesforce Administrator, then Platform Developer I. These two open most doors. Add Platform Developer II, App Builder, or cloud-specific certifications (Sales/Service) based on your specialization.",
      },
    ],

    relatedJobs: ["software-engineer", "java-developer", "business-analyst", "web-developer"],
  },

  "sap-consultant": {
    slug: "sap-consultant",
    title: "SAP Consultant",
    titleVariants: ["SAP Functional Consultant", "SAP Technical Consultant", "SAP ABAP Developer", "SAP FICO Consultant"],

    overview: {
      description: "SAP Consultants implement, configure, and support SAP ERP systems. They analyze business processes, customize SAP modules, and help organizations optimize operations using SAP solutions.",
      averageSalaryIndia: { fresher: "5-9 LPA", mid: "12-25 LPA", senior: "28-60+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["SAP", "Accenture", "Deloitte", "IBM", "TCS", "Infosys", "Wipro", "Capgemini"],
    },

    resumeSections: {
      mustHaveSkills: [
        "SAP Module Expertise (FICO/MM/SD/HCM)",
        "Business Process Knowledge",
        "SAP Configuration",
        "SAP Integration",
        "Requirements Analysis",
        "End-User Training",
      ],
      niceToHaveSkills: [
        "SAP S/4HANA",
        "SAP ABAP Programming",
        "SAP Fiori/UI5",
        "SAP BW/BI",
        "Data Migration",
        "Change Management",
      ],
      certifications: [
        "SAP Certified Application Associate",
        "SAP S/4HANA Certification",
        "SAP ABAP Certification",
        "SAP SuccessFactors Certification",
      ],
      keyAchievementExamples: [
        "Led SAP S/4HANA implementation for manufacturing company with 2000+ users",
        "Reduced financial close cycle by 40% through SAP FICO optimization",
        "Migrated 5M+ records from legacy ERP to SAP with 99.9% accuracy",
        "Trained 500+ end-users on SAP MM module increasing adoption by 80%",
      ],
      actionVerbs: [
        "Implemented", "Configured", "Analyzed", "Customized", "Migrated",
        "Trained", "Optimized", "Supported", "Led", "Designed",
        "Integrated", "Documented", "Tested", "Deployed", "Managed",
      ],
      atsKeywords: [
        "SAP", "ERP", "FICO", "MM", "SD", "HCM", "S/4HANA", "ABAP",
        "Fiori", "Configuration", "Implementation", "Integration", "Migration",
        "Functional Consultant", "Technical Consultant", "Business Process",
      ],
    },

    summaryExamples: {
      fresher: "SAP Certified Associate in Financial Accounting (FICO). Completed hands-on training in SAP configuration and business process mapping. Strong understanding of finance and accounting principles. Eager to start career as SAP Functional Consultant.",
      midLevel: "SAP FICO Consultant with 5+ years of experience in full lifecycle implementations. Delivered 8+ projects across manufacturing and retail industries. Expert in S/4HANA migration, financial integration, and user training.",
      senior: "Senior SAP Solution Architect with 12+ years of experience leading enterprise ERP transformations. Managed programs worth Rs. 100Cr+ across multiple SAP modules. Expert in S/4HANA, integration architecture, and team leadership.",
    },

    experienceBullets: [
      "Led SAP FICO implementation for retail company processing Rs. 1000Cr+ annual transactions",
      "Configured SAP MM module for procurement automation reducing cycle time by 50%",
      "Managed data migration of 10M+ master records from legacy system to SAP S/4HANA",
      "Conducted 50+ training sessions for end-users across finance and operations teams",
      "Designed SAP integration architecture connecting CRM, WMS, and e-commerce systems",
    ],

    faqs: [
      {
        question: "How to start a career in SAP?",
        answer: "Get SAP certification in one module (FICO is popular for commerce graduates, MM/SD for engineers). Join SAP training institutes or do online learning. Entry-level jobs available at IT services companies. Domain knowledge helps.",
      },
      {
        question: "Which SAP module has most demand?",
        answer: "SAP FICO has consistent demand across industries. SAP MM and SD are needed in manufacturing and retail. SAP HCM/SuccessFactors for HR domain. S/4HANA skills are increasingly required as companies migrate.",
      },
      {
        question: "What is the difference between Functional and Technical Consultant?",
        answer: "Functional Consultants focus on business processes and SAP configuration. Technical Consultants write ABAP code, develop custom programs, and handle integrations. Some roles require both skills (Techno-Functional).",
      },
      {
        question: "Is SAP relevant in the age of cloud?",
        answer: "Yes, SAP is evolving with S/4HANA (cloud-first), SAP BTP, and SuccessFactors. Large enterprises continue using SAP. Cloud SAP skills are in high demand. SAP jobs are stable and well-paying globally.",
      },
    ],

    relatedJobs: ["business-analyst", "software-engineer", "data-analyst", "hr-manager"],
  },

  "cybersecurity-analyst": {
    slug: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    titleVariants: ["Security Analyst", "Information Security Analyst", "SOC Analyst", "Security Engineer"],

    overview: {
      description: "Cybersecurity Analysts protect organizations from cyber threats by monitoring security systems, analyzing vulnerabilities, responding to incidents, and implementing security controls and policies.",
      averageSalaryIndia: { fresher: "5-9 LPA", mid: "12-25 LPA", senior: "28-55+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["TCS", "Infosys", "Wipro", "IBM", "Deloitte", "EY", "KPMG", "Accenture"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Security Operations (SOC)",
        "SIEM Tools (Splunk/QRadar)",
        "Vulnerability Assessment",
        "Incident Response",
        "Network Security",
        "Security Frameworks (NIST/ISO 27001)",
      ],
      niceToHaveSkills: [
        "Penetration Testing",
        "Cloud Security (AWS/Azure)",
        "Scripting (Python/Bash)",
        "Malware Analysis",
        "Digital Forensics",
        "Identity & Access Management",
      ],
      certifications: [
        "CompTIA Security+",
        "CEH - Certified Ethical Hacker",
        "CISSP",
        "AWS Security Specialty",
      ],
      keyAchievementExamples: [
        "Detected and contained ransomware attack preventing Rs. 10Cr potential loss",
        "Reduced security incident response time by 60% through automation",
        "Led vulnerability assessment identifying 200+ critical issues across infrastructure",
        "Implemented SIEM solution processing 1M+ events daily for SOC operations",
      ],
      actionVerbs: [
        "Monitored", "Analyzed", "Detected", "Responded", "Investigated",
        "Implemented", "Protected", "Assessed", "Mitigated", "Documented",
        "Configured", "Secured", "Led", "Automated", "Reported",
      ],
      atsKeywords: [
        "Cybersecurity", "Security", "SOC", "SIEM", "Incident Response",
        "Vulnerability", "Penetration Testing", "Network Security", "Firewall",
        "Malware", "Threat", "Risk", "Compliance", "NIST", "ISO 27001",
      ],
    },

    summaryExamples: {
      fresher: "B.Tech CSE graduate with CompTIA Security+ certification. Completed internship in SOC operations including monitoring, alert triage, and incident documentation. Hands-on experience with Splunk and Wireshark. Passionate about cybersecurity and threat hunting.",
      midLevel: "Cybersecurity Analyst with 4+ years of experience in enterprise security operations. Managed SOC team handling 500+ daily alerts. Expert in incident response, SIEM administration, and vulnerability management. CEH and AWS Security certified.",
      senior: "Senior Security Architect with 10+ years of experience leading security programs. Built security operations center for 10,000+ user organization. Expert in threat intelligence, security architecture, and compliance frameworks. CISSP certified.",
    },

    experienceBullets: [
      "Monitored and analyzed 1000+ daily security alerts using Splunk SIEM",
      "Led incident response for 50+ security incidents including phishing and malware attacks",
      "Conducted vulnerability assessments using Nessus identifying 500+ security gaps",
      "Implemented security automation reducing alert triage time by 70%",
      "Developed security policies and procedures achieving ISO 27001 compliance",
    ],

    faqs: [
      {
        question: "How to start a career in cybersecurity?",
        answer: "Start with CompTIA Security+ certification. Learn networking basics (CompTIA Network+). Build home lab for practice. Apply for SOC Analyst Level 1 roles. IT background helps but not mandatory. CTF competitions are great for learning.",
      },
      {
        question: "Which certifications are most valued?",
        answer: "CompTIA Security+ for entry level. CEH or OSCP for penetration testing. CISSP for senior roles (needs experience). Cloud security certs (AWS/Azure) are increasingly important. Certifications significantly impact salary.",
      },
      {
        question: "Is coding required for cybersecurity?",
        answer: "Basic scripting (Python/Bash) is very helpful for automation. For penetration testing and security research, coding is essential. SOC analyst roles need less coding. Programming skills open more opportunities.",
      },
      {
        question: "What is the career path in cybersecurity?",
        answer: "SOC Analyst L1 → L2 → L3 → SOC Manager. Or specialize: Penetration Tester, Incident Responder, Security Architect, GRC Analyst. CISO is the top role. Many paths, growing demand in all areas.",
      },
    ],

    relatedJobs: ["devops-engineer", "cloud-architect", "software-engineer", "python-developer"],
  },

  "data-scientist": {
    slug: "data-scientist",
    title: "Data Scientist",
    titleVariants: ["ML Scientist", "AI Scientist", "Research Scientist", "Applied Scientist"],

    overview: {
      description: "Data Scientists extract insights from large datasets using statistical analysis, machine learning, and programming. They build predictive models and communicate findings to drive business decisions.",
      averageSalaryIndia: { fresher: "5-10 LPA", mid: "12-22 LPA", senior: "25-50+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Amazon", "Google", "Flipkart", "Swiggy", "Zomato", "PhonePe", "Meesho", "HDFC Bank"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Python (Pandas, NumPy, Scikit-learn)",
        "Machine Learning Algorithms",
        "Statistical Analysis & Probability",
        "Data Visualization (Matplotlib, Seaborn, Tableau)",
        "SQL & Database Querying",
        "Feature Engineering",
      ],
      niceToHaveSkills: [
        "Deep Learning (TensorFlow, PyTorch)",
        "Big Data (Spark, Hadoop)",
        "Cloud ML (AWS SageMaker, Google Vertex AI)",
        "NLP & Computer Vision",
        "A/B Testing",
        "Business Intelligence Tools",
      ],
      certifications: [
        "Google Professional Data Engineer",
        "IBM Data Science Professional Certificate",
        "AWS Certified Machine Learning Specialty",
        "Coursera Deep Learning Specialization",
      ],
      keyAchievementExamples: [
        "Built churn prediction model achieving 92% accuracy, saving ₹2Cr in annual revenue",
        "Developed recommendation system increasing user engagement by 35%",
        "Reduced fraud detection false positives by 60% using ensemble methods",
        "Automated data pipeline processing 10M+ records daily, saving 40 hours/week",
      ],
      actionVerbs: [
        "Analyzed", "Modeled", "Predicted", "Visualized", "Engineered",
        "Deployed", "Optimized", "Discovered", "Automated", "Evaluated",
      ],
      atsKeywords: [
        "Machine Learning", "Data Science", "Python", "Deep Learning", "NLP",
        "Statistical Modeling", "Predictive Analytics", "Data Pipeline", "A/B Testing", "Feature Engineering",
      ],
    },

    summaryExamples: {
      fresher: "Data Science graduate with strong foundation in Python, machine learning, and statistical analysis. Completed 3 end-to-end ML projects including sentiment analysis and house price prediction. Eager to apply analytical skills to solve real-world business problems.",
      midLevel: "Data Scientist with 3+ years building and deploying ML models in production. Expertise in NLP and recommendation systems using Python and TensorFlow. Delivered models that increased revenue by 25% and reduced operational costs by 30% at e-commerce scale.",
      senior: "Senior Data Scientist with 7+ years leading data science initiatives across fintech and e-commerce. Built and managed teams of 5+ data scientists. Track record of delivering high-impact ML solutions including fraud detection systems and personalization engines serving 10M+ users.",
    },

    experienceBullets: [
      "Developed customer segmentation model using K-means clustering, identifying 8 distinct user personas improving marketing ROI by 40%",
      "Built real-time fraud detection system using XGBoost, processing 50K transactions/day with 98.5% accuracy",
      "Created NLP pipeline for sentiment analysis of 1M+ customer reviews, enabling product teams to prioritize improvements",
      "Implemented MLOps pipeline on AWS SageMaker reducing model deployment time from 2 weeks to 2 days",
      "Conducted A/B tests for pricing optimization resulting in 15% increase in conversion rate",
    ],

    faqs: [
      {
        question: "What skills are needed for a Data Scientist role in India?",
        answer: "Python is essential - master Pandas, NumPy, Scikit-learn. Statistics and probability are fundamental. SQL is mandatory for data extraction. Machine learning algorithms (regression, classification, clustering). SQL, visualization tools (Tableau/Power BI), and communication skills round out the profile.",
      },
      {
        question: "Data Scientist vs Data Analyst - what's the difference?",
        answer: "Data Analysts focus on describing past trends using SQL and visualization. Data Scientists build predictive models using ML/statistics. Data Scientists typically need stronger programming (Python) and math skills. Salaries are higher for Data Scientists. Many analysts transition to data science.",
      },
      {
        question: "Is a PhD required to become a Data Scientist?",
        answer: "No. Most industry data scientist roles in India don't require a PhD. A B.Tech/B.Sc + relevant skills + portfolio is sufficient. PhD helps for research roles at top companies (Google Brain, DeepMind). Strong projects and certifications can compensate for lack of advanced degree.",
      },
      {
        question: "How important is a portfolio for Data Scientists?",
        answer: "Extremely important. Build 3-5 end-to-end projects on GitHub covering different domains. Include Kaggle competition results. Deploy at least one model as a web app. Projects demonstrate practical skills better than degrees. Write about your projects on Medium/LinkedIn.",
      },
    ],

    relatedJobs: ["machine-learning-engineer", "data-analyst", "python-developer", "business-analyst"],
  },

  "full-stack-developer": {
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    titleVariants: ["Full Stack Engineer", "MEAN Stack Developer", "MERN Stack Developer", "Web Application Developer"],

    overview: {
      description: "Full Stack Developers work on both frontend and backend development, handling the complete web application stack from UI design to database management and server-side logic.",
      averageSalaryIndia: { fresher: "4-8 LPA", mid: "10-20 LPA", senior: "22-45+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Razorpay", "CRED", "Atlassian", "Freshworks", "Zoho", "Postman", "BrowserStack", "Startups"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Frontend: HTML, CSS, JavaScript",
        "Frontend Framework: React.js or Angular or Vue.js",
        "Backend: Node.js or Python (Django/Flask) or Java (Spring Boot)",
        "Database: MySQL/PostgreSQL + MongoDB",
        "REST API Development",
        "Version Control (Git)",
      ],
      niceToHaveSkills: [
        "TypeScript",
        "Cloud Deployment (AWS/Azure/GCP)",
        "Docker & CI/CD",
        "GraphQL",
        "Redis & Caching",
        "WebSockets & Real-time Features",
      ],
      certifications: [
        "AWS Certified Developer Associate",
        "MongoDB Developer Certification",
        "React Developer Certification (Meta)",
        "Google Associate Cloud Engineer",
      ],
      keyAchievementExamples: [
        "Built and launched SaaS product from scratch serving 10,000+ users",
        "Reduced page load time by 50% through frontend optimization and CDN implementation",
        "Designed microservices architecture handling 100K+ API requests daily",
        "Implemented real-time features (chat, notifications) using WebSockets for 5K concurrent users",
      ],
      actionVerbs: [
        "Built", "Developed", "Designed", "Integrated", "Deployed",
        "Optimized", "Launched", "Architected", "Implemented", "Maintained",
      ],
      atsKeywords: [
        "MERN Stack", "React.js", "Node.js", "Full Stack", "REST API",
        "MongoDB", "JavaScript", "TypeScript", "Microservices", "CI/CD",
      ],
    },

    summaryExamples: {
      fresher: "Computer Science graduate proficient in MERN Stack (MongoDB, Express, React, Node.js). Built 4 full-stack projects including an e-commerce platform and task management app. Comfortable with REST APIs, Git, and basic cloud deployment. Ready to contribute to production applications.",
      midLevel: "Full Stack Developer with 4 years building scalable web applications using React and Node.js. Experience across entire SDLC from design to deployment. Delivered 10+ features used by 50K+ users. Proficient in microservices, Docker, and AWS. Strong problem-solver with clean code practices.",
      senior: "Senior Full Stack Developer with 8+ years architecting and building high-traffic web applications. Led teams of 6 developers. Built platforms processing ₹100Cr+ in annual transactions. Expert in system design, performance optimization, and cloud-native development. Mentor and technical lead.",
    },

    experienceBullets: [
      "Developed responsive React.js frontend with TypeScript, improving user retention by 25% through enhanced UX",
      "Built Node.js REST API handling 500K+ requests/day with 99.9% uptime using Express and PM2",
      "Designed MongoDB schema and implemented indexing, reducing query response time by 70%",
      "Integrated Razorpay and Stripe payment gateways processing ₹5Cr+ monthly transactions",
      "Set up Docker-based CI/CD pipeline on GitHub Actions, reducing deployment time from 2 hours to 15 minutes",
    ],

    faqs: [
      {
        question: "What technologies should a Full Stack Developer know in 2025?",
        answer: "Frontend: React.js (most in-demand), TypeScript, Next.js. Backend: Node.js or Python FastAPI, REST/GraphQL APIs. Database: PostgreSQL + MongoDB. DevOps basics: Docker, AWS/GCP, CI/CD. The MERN/MEAN stack remains most popular in Indian startups.",
      },
      {
        question: "How long does it take to become a Full Stack Developer?",
        answer: "With dedicated learning: 6-12 months from scratch. Focus on one frontend framework (React) and one backend (Node.js) rather than learning everything. Build 3-4 complete projects. Most bootcamp graduates get jobs in 8-10 months. CS graduates with basics get to production-ready in 3-4 months.",
      },
      {
        question: "Full Stack vs Specialized Developer - which pays more?",
        answer: "Specialized developers (senior React or senior backend) typically earn more at FAANG/top companies. Full stack developers are more versatile and better suited for startups. At mid-level, salaries are similar. Full stack is better for entrepreneurship. Choose based on your preferred work style.",
      },
      {
        question: "Which backend language is best for full stack in India?",
        answer: "Node.js is most popular in startups (same language frontend & backend). Python (Django/FastAPI) is great for data-heavy applications. Java Spring Boot dominates enterprises and service companies. Go is growing. Node.js + React (MERN) is the most in-demand combination.",
      },
    ],

    relatedJobs: ["software-engineer", "react-developer", "web-developer", "devops-engineer"],
  },

  "react-developer": {
    slug: "react-developer",
    title: "React Developer",
    titleVariants: ["React.js Developer", "Frontend React Developer", "React Engineer", "Next.js Developer"],

    overview: {
      description: "React Developers specialize in building dynamic, component-based user interfaces using the React.js library. They work on frontend development, state management, performance optimization, and integration with backend APIs.",
      averageSalaryIndia: { fresher: "4-7 LPA", mid: "9-18 LPA", senior: "20-40+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["Razorpay", "CRED", "Freshworks", "Cleartax", "Zerodha", "Groww", "Urban Company", "Meesho"],
    },

    resumeSections: {
      mustHaveSkills: [
        "React.js (Hooks, Context API, Redux)",
        "JavaScript (ES6+)",
        "TypeScript",
        "HTML5 & CSS3",
        "REST API Integration",
        "Git & Version Control",
      ],
      niceToHaveSkills: [
        "Next.js (SSR/SSG)",
        "Testing (Jest, React Testing Library)",
        "Performance Optimization (memoization, lazy loading)",
        "Tailwind CSS or styled-components",
        "GraphQL & Apollo",
        "Webpack/Vite configuration",
      ],
      certifications: [
        "Meta React Developer Certificate",
        "JavaScript Developer Certification (W3Schools)",
        "AWS Certified Developer",
        "Google UX Design Certificate",
      ],
      keyAchievementExamples: [
        "Improved Core Web Vitals score from 45 to 92 using code splitting and lazy loading",
        "Migrated legacy jQuery application to React, reducing bundle size by 60%",
        "Built reusable component library used across 5 products in the organization",
        "Implemented micro-frontend architecture enabling independent team deployments",
      ],
      actionVerbs: [
        "Built", "Developed", "Optimized", "Implemented", "Designed",
        "Migrated", "Refactored", "Integrated", "Deployed", "Created",
      ],
      atsKeywords: [
        "React.js", "Next.js", "TypeScript", "Redux", "JavaScript",
        "Frontend Development", "Component Library", "REST API", "CSS3", "Performance Optimization",
      ],
    },

    summaryExamples: {
      fresher: "Frontend developer with strong React.js skills and hands-on experience building SPAs. Completed 5 React projects including a task manager, weather app, and e-commerce UI. Proficient in Hooks, Context API, and REST API integration. Passionate about clean code and great user experiences.",
      midLevel: "React Developer with 3+ years building production-grade web applications. Expert in React ecosystem including Next.js, Redux Toolkit, and TypeScript. Delivered 15+ features for fintech products used by 200K+ users. Strong focus on performance, accessibility, and code quality.",
      senior: "Senior React Developer with 7+ years building large-scale frontend applications. Architect of component library used by 50+ developers. Led frontend guild of 8 engineers. Expert in micro-frontends, performance optimization, and design systems. Improved app performance by 60% across product suite.",
    },

    experienceBullets: [
      "Built responsive React dashboard with 30+ custom components, serving 100K+ daily active users",
      "Implemented Redux Toolkit for state management, reducing component re-renders by 45% and improving performance",
      "Migrated Create React App to Next.js 14, improving SEO scores and reducing TTFB by 60%",
      "Developed reusable UI component library with Storybook documentation, reducing development time by 30%",
      "Optimized bundle size from 2.8MB to 800KB using code splitting, tree shaking, and lazy loading",
    ],

    faqs: [
      {
        question: "What is the difference between React Developer and Full Stack Developer?",
        answer: "React Developers specialize in frontend only (UI, browser interactions, state management). Full Stack Developers work on both frontend and backend. React developers go deeper into UI performance, accessibility, and design systems. Full stack developers have broader but shallower knowledge. Both are in high demand.",
      },
      {
        question: "Is Next.js necessary for React Developer jobs?",
        answer: "Increasingly yes. Many companies prefer Next.js for its built-in SSR/SSG, file-based routing, and SEO benefits. Most new React projects start with Next.js. For frontend roles at startups and product companies, Next.js knowledge gives you a significant edge. Learn it alongside React.",
      },
      {
        question: "Do React Developers need to know TypeScript?",
        answer: "Yes, TypeScript is now an industry standard. Most production React codebases use TypeScript. It catches bugs early, improves code quality, and is required in most job descriptions. Even if not mandatory, listing TypeScript on your resume increases interview calls significantly.",
      },
      {
        question: "How to showcase React projects in a resume?",
        answer: "Host projects on Vercel/Netlify with live URLs. Include GitHub repo links. Describe technical challenges solved (not just 'built a todo app'). Mention performance metrics, user counts, or business impact. Show progression - simple to complex projects. Contribute to open source React projects for credibility.",
      },
    ],

    relatedJobs: ["full-stack-developer", "web-developer", "ui-ux-designer", "software-engineer"],
  },

  "ios-developer": {
    slug: "ios-developer",
    title: "iOS Developer",
    titleVariants: ["Swift Developer", "iPhone App Developer", "Apple Developer", "Mobile Developer"],

    overview: {
      description: "iOS Developers design and build applications for Apple devices including iPhone, iPad, and Mac. They use Swift and Objective-C with Apple frameworks to create high-quality mobile experiences.",
      averageSalaryIndia: { fresher: "4-8 LPA", mid: "10-20 LPA", senior: "22-45+ LPA" },
      demandLevel: "Medium",
      topHiringCompanies: ["Apple", "Swiggy", "Zomato", "Ola", "Paytm", "PhonePe", "Dream11", "Byju's"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Swift (Primary Language)",
        "UIKit or SwiftUI",
        "Xcode IDE",
        "iOS SDK & Apple Frameworks",
        "MVC/MVVM Architecture Patterns",
        "REST API Integration (URLSession, Alamofire)",
      ],
      niceToHaveSkills: [
        "Objective-C",
        "Core Data & Realm",
        "Push Notifications (APNs)",
        "In-App Purchases (StoreKit)",
        "Unit Testing (XCTest)",
        "CI/CD (Fastlane, App Store Connect)",
      ],
      certifications: [
        "Apple Certified iOS Developer",
        "iOS App Development with Swift (Coursera)",
        "Stanford CS193p (free)",
        "Google Associate Android Developer (cross-platform context)",
      ],
      keyAchievementExamples: [
        "Published app to App Store achieving 4.8 rating with 100K+ downloads",
        "Reduced app crash rate from 2.5% to 0.3% through systematic debugging",
        "Decreased app launch time by 40% through performance profiling and optimization",
        "Implemented offline mode using Core Data, improving user retention by 20%",
      ],
      actionVerbs: [
        "Developed", "Published", "Optimized", "Implemented", "Designed",
        "Integrated", "Debugged", "Shipped", "Migrated", "Architected",
      ],
      atsKeywords: [
        "Swift", "SwiftUI", "UIKit", "iOS Development", "Xcode",
        "MVVM", "Core Data", "App Store", "Mobile Development", "REST API",
      ],
    },

    summaryExamples: {
      fresher: "iOS Developer with strong Swift fundamentals and hands-on app development experience. Built and published 2 apps to the App Store. Proficient in UIKit, SwiftUI, and MVC architecture. Passionate about creating intuitive Apple experiences with attention to Human Interface Guidelines.",
      midLevel: "iOS Developer with 4 years shipping apps used by millions. Expert in Swift, SwiftUI, and complex UI implementations. Track record of maintaining 4.7+ App Store ratings. Led iOS features for fintech app with ₹500Cr+ monthly transactions. Strong in performance optimization and clean architecture.",
      senior: "Senior iOS Developer with 8+ years building consumer apps from 0 to 10M+ downloads. Led iOS team of 5. Architected migration from Obj-C to Swift across 200K LOC codebase. Expert in performance, memory management, and design patterns. Published 12 apps, 5 featured by Apple.",
    },

    experienceBullets: [
      "Developed UIKit-based mobile banking app serving 2M+ users with features for transfers, investments, and bill payments",
      "Implemented SwiftUI onboarding flow reducing user drop-off by 35% through improved UX",
      "Integrated Apple Pay and in-app purchases generating ₹2Cr+ monthly revenue",
      "Built offline-first architecture using Core Data, enabling full functionality without internet connection",
      "Optimized memory usage using Instruments profiler, reducing memory footprint by 40% and eliminating crashes",
    ],

    faqs: [
      {
        question: "Swift vs Objective-C - which should I learn?",
        answer: "Learn Swift first - it's Apple's primary language and used in all new iOS projects. Objective-C is legacy code you may maintain but won't write new. Most job descriptions require Swift. Start with Swift + UIKit, then add SwiftUI. Objective-C knowledge is a bonus, not a requirement for most roles.",
      },
      {
        question: "UIKit vs SwiftUI - which is more important?",
        answer: "Both. UIKit is mature and still used in most large apps. SwiftUI is Apple's future and growing fast. Many companies have both. Learn UIKit fundamentals first (better debugging, more resources), then learn SwiftUI. Being proficient in both makes you much more hireable.",
      },
      {
        question: "How important is having apps on the App Store?",
        answer: "Very important for freshers. Even a simple app shows you understand the complete development cycle - building, testing, App Store submission, and maintenance. Aim for at least 1-2 published apps. Active apps with reviews are better. If your app isn't ready, a well-documented GitHub project works too.",
      },
      {
        question: "Is iOS development in demand in India?",
        answer: "Yes, especially in consumer apps (fintech, food delivery, e-commerce). iOS developers are slightly fewer than Android developers, making them somewhat premium. Top companies like Swiggy, Zomato, PhonePe, and Zerodha actively hire iOS developers. Average salaries are comparable to Android and backend roles.",
      },
    ],

    relatedJobs: ["android-developer", "software-engineer", "react-developer", "ui-ux-designer"],
  },

  "project-manager": {
    slug: "project-manager",
    title: "Project Manager",
    titleVariants: ["Program Manager", "IT Project Manager", "Technical Project Manager", "Delivery Manager"],

    overview: {
      description: "Project Managers plan, execute, and close projects while managing scope, timeline, budget, and stakeholders. They ensure projects are delivered on time, within budget, and meet quality standards.",
      averageSalaryIndia: { fresher: "5-9 LPA", mid: "12-22 LPA", senior: "25-50+ LPA" },
      demandLevel: "High",
      topHiringCompanies: ["TCS", "Infosys", "Wipro", "Accenture", "IBM", "Capgemini", "HCL", "Cognizant"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Project Planning & Scheduling (MS Project, Jira)",
        "Agile & Scrum Methodology",
        "Stakeholder Management",
        "Risk Management & Mitigation",
        "Budget & Resource Management",
        "Team Leadership & Communication",
      ],
      niceToHaveSkills: [
        "PMP Certification",
        "Program Management (multiple projects)",
        "Change Management",
        "PRINCE2 Methodology",
        "Technical Background (IT/Software)",
        "Client-facing & Presentation Skills",
      ],
      certifications: [
        "PMP (Project Management Professional) - PMI",
        "PRINCE2 Foundation/Practitioner",
        "CSM (Certified Scrum Master)",
        "CAPM (Certified Associate in Project Management)",
      ],
      keyAchievementExamples: [
        "Delivered 15+ projects on time and within budget managing ₹5Cr+ total value",
        "Led agile transformation for 3 teams, improving sprint velocity by 40%",
        "Managed cross-functional team of 25 members across 3 countries for ERP implementation",
        "Reduced project delivery time by 20% through process improvements and automation",
      ],
      actionVerbs: [
        "Led", "Managed", "Delivered", "Coordinated", "Planned",
        "Executed", "Facilitated", "Monitored", "Implemented", "Stakeholder",
      ],
      atsKeywords: [
        "Project Management", "Agile", "Scrum", "PMP", "Stakeholder Management",
        "Risk Management", "SDLC", "Jira", "Budget Management", "Resource Planning",
      ],
    },

    summaryExamples: {
      fresher: "MBA graduate with project management internship experience and CSM certification. Managed 3 academic projects end-to-end using Agile methodology. Proficient in Jira, MS Project, and stakeholder communication. Eager to deliver value through structured project execution in IT services.",
      midLevel: "Project Manager with 5 years delivering IT projects in BFSI and e-commerce sectors. PMP certified with track record of managing ₹2Cr+ projects on time and within budget. Experienced in Agile/Waterfall hybrid models. Led teams of 10-15 across distributed locations.",
      senior: "Senior Project Manager / Program Manager with 10+ years overseeing multi-million dollar technology programs. PMP and PRINCE2 certified. Managed portfolios of 8-10 concurrent projects with 50+ team members. Delivered digital transformation programs for Fortune 500 clients. Expert in governance, risk, and executive stakeholder management.",
    },

    experienceBullets: [
      "Led end-to-end delivery of banking digital transformation project worth ₹3.5Cr, completed 2 weeks ahead of schedule",
      "Managed cross-functional team of 18 developers, QA, and BA professionals across India and Singapore",
      "Implemented Agile/Scrum framework for 4 product teams, improving sprint completion rate from 65% to 92%",
      "Created comprehensive risk management framework identifying and mitigating 25 project risks",
      "Conducted weekly executive steering committee meetings maintaining 100% stakeholder satisfaction score",
    ],

    faqs: [
      {
        question: "Is PMP certification necessary for a Project Manager role?",
        answer: "PMP significantly boosts your profile but isn't always required. It's highly valued at large IT services companies (TCS, Infosys, Accenture). For startup/product company PM roles, Agile/Scrum certifications (CSM, CSPO) are often preferred. PMP shows commitment to the profession and typically commands 20-30% higher salary.",
      },
      {
        question: "What is the career path for a Project Manager?",
        answer: "Business Analyst/Team Lead → Project Manager → Senior PM → Program Manager → Portfolio Manager → PMO Head/VP of Delivery. Alternatively, move to Product Management (PM to Product Manager is common). Consulting is another high-paying path. PMP + domain expertise in BFSI or Healthcare pays very well.",
      },
      {
        question: "Do Project Managers need technical knowledge?",
        answer: "Technical background is a big advantage in IT projects. You don't need to code but understanding software development, infrastructure, and technical constraints helps greatly. Non-technical PMs do succeed but may face credibility issues with technical teams. Basic IT literacy is minimum; technical degree or experience is a bonus.",
      },
      {
        question: "Agile PM vs Traditional PM - which is more in demand?",
        answer: "Agile is dominant in product companies and startups. Traditional/Waterfall is still used in government projects, large enterprises, and compliance-heavy industries. Hybrid is most common in IT services. Learn both: Agile/Scrum for flexibility and PMP for comprehensive project management knowledge.",
      },
    ],

    relatedJobs: ["business-analyst", "product-manager", "scrum-master", "hr-manager"],
  },

  "network-engineer": {
    slug: "network-engineer",
    title: "Network Engineer",
    titleVariants: ["Network Administrator", "Network Architect", "Infrastructure Engineer", "Network Security Engineer"],

    overview: {
      description: "Network Engineers design, implement, and manage computer networks including LAN, WAN, and cloud networking. They ensure network security, performance, and reliability for organizations.",
      averageSalaryIndia: { fresher: "3-6 LPA", mid: "7-15 LPA", senior: "16-30+ LPA" },
      demandLevel: "Medium",
      topHiringCompanies: ["Cisco", "HCL", "Wipro", "TCS", "Airtel", "Jio", "BSNL", "IBM"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Cisco Routing & Switching (IOS)",
        "TCP/IP Protocols & Networking Fundamentals",
        "Firewall Configuration (Cisco ASA, Fortinet, Palo Alto)",
        "LAN/WAN Design & Implementation",
        "Network Monitoring Tools (SolarWinds, Nagios)",
        "VPN Configuration & Management",
      ],
      niceToHaveSkills: [
        "Software Defined Networking (SDN)",
        "Cloud Networking (AWS VPC, Azure Virtual Network)",
        "Network Automation (Python, Ansible)",
        "BGP, OSPF, EIGRP Routing Protocols",
        "Load Balancing (F5, HAProxy)",
        "Wireless Networking (802.11)",
      ],
      certifications: [
        "CCNA (Cisco Certified Network Associate)",
        "CCNP (Cisco Certified Network Professional)",
        "CompTIA Network+",
        "Juniper Networks JNCIA",
      ],
      keyAchievementExamples: [
        "Designed and implemented network infrastructure for 3,000-user enterprise reducing downtime by 99.5%",
        "Migrated on-premise network to hybrid cloud reducing infrastructure costs by ₹50L annually",
        "Deployed SD-WAN solution across 15 branch offices improving bandwidth efficiency by 40%",
        "Responded to and resolved 500+ network incidents maintaining 99.9% SLA adherence",
      ],
      actionVerbs: [
        "Configured", "Deployed", "Monitored", "Troubleshot", "Designed",
        "Implemented", "Maintained", "Optimized", "Secured", "Migrated",
      ],
      atsKeywords: [
        "CCNA", "Cisco", "Networking", "Routing & Switching", "Firewall",
        "TCP/IP", "Network Security", "LAN/WAN", "VPN", "Network Monitoring",
      ],
    },

    summaryExamples: {
      fresher: "CCNA certified Network Engineer with hands-on lab experience in Cisco routing, switching, and network security. Completed networking internship managing enterprise LAN/WAN for 500+ users. Strong foundation in TCP/IP, BGP, and firewall configuration. Eager to maintain and optimize complex network environments.",
      midLevel: "Network Engineer with 4 years managing enterprise network infrastructure for large organizations. CCNP certified with expertise in Cisco, Fortinet, and cloud networking. Managed networks serving 5,000+ users with 99.9% uptime. Experienced in network automation using Python and Ansible.",
      senior: "Senior Network Architect with 9+ years designing and implementing large-scale network infrastructures. Led network design for ₹10Cr data center migration. Expert in SD-WAN, cloud networking, and zero-trust security architecture. CCIE certified with experience across telecom, BFSI, and manufacturing sectors.",
    },

    experienceBullets: [
      "Managed enterprise network infrastructure of 200+ Cisco switches and routers across 5 locations with 99.95% uptime",
      "Implemented next-generation firewall (Palo Alto) replacing legacy systems, reducing security incidents by 75%",
      "Deployed SD-WAN for 20 branch offices, reducing WAN costs by 40% while improving performance",
      "Automated network configuration backups and compliance checks using Python scripts, saving 10 hours/week",
      "Led network migration to AWS hybrid cloud architecture supporting 10,000+ concurrent users",
    ],

    faqs: [
      {
        question: "Is CCNA sufficient to get a Network Engineer job?",
        answer: "CCNA is a great foundation and opens entry-level doors. For better roles, pursue CCNP or specialize in security/cloud. Many companies require CCNA + 1-2 years experience. Fresh CCNA holders can get NOC analyst roles to build experience. Practical lab skills matter as much as the cert.",
      },
      {
        question: "Is Network Engineering a good career in 2025?",
        answer: "Yes, but evolving. Cloud networking (AWS/Azure VPC) and network automation are growing. Traditional on-premise networking is stable in enterprises and telecom. Adding cloud and programming skills (Python for automation) future-proofs your career. Demand from Jio, Airtel, and enterprises remains strong in India.",
      },
      {
        question: "Network Engineer vs Network Security Engineer?",
        answer: "Network Engineers handle overall infrastructure design and maintenance. Network Security Engineers focus on firewalls, IDS/IPS, VPN, and threat management. Security roles typically pay 20-30% more. Many network engineers specialize in security as their career progresses. CISSP or CEH certifications help transition.",
      },
      {
        question: "What is the salary growth path for Network Engineers?",
        answer: "Network Engineer (3-6 LPA) → Senior Network Engineer (7-15 LPA) → Network Architect (16-25 LPA) → Infrastructure Manager (25-40 LPA). Specializing in cloud networking or security accelerates growth. Telecom companies (Jio, Airtel) and IT services offer stable career paths.",
      },
    ],

    relatedJobs: ["cybersecurity-analyst", "cloud-architect", "devops-engineer", "software-engineer"],
  },

  "database-administrator": {
    slug: "database-administrator",
    title: "Database Administrator",
    titleVariants: ["DBA", "SQL DBA", "Oracle DBA", "Database Engineer", "Data Engineer"],

    overview: {
      description: "Database Administrators manage, secure, and optimize databases for organizations. They handle installation, configuration, performance tuning, backups, and disaster recovery to ensure data availability and integrity.",
      averageSalaryIndia: { fresher: "3-6 LPA", mid: "7-16 LPA", senior: "18-35+ LPA" },
      demandLevel: "Medium",
      topHiringCompanies: ["Oracle", "IBM", "TCS", "Infosys", "HDFC Bank", "ICICI Bank", "Accenture", "HCL"],
    },

    resumeSections: {
      mustHaveSkills: [
        "SQL (Advanced queries, stored procedures, triggers)",
        "Database Platforms (Oracle, MySQL, PostgreSQL or SQL Server)",
        "Performance Tuning & Query Optimization",
        "Backup & Recovery (RMAN, mysqldump)",
        "Database Security & Access Management",
        "High Availability & Disaster Recovery",
      ],
      niceToHaveSkills: [
        "NoSQL Databases (MongoDB, Cassandra, Redis)",
        "Cloud Databases (AWS RDS, Azure SQL, Google Cloud SQL)",
        "Database Automation (Python, Shell scripting)",
        "Replication & Clustering",
        "Data Migration & ETL",
        "DBMS Monitoring (OEM, SolarWinds DPA)",
      ],
      certifications: [
        "Oracle Certified Professional (OCP) DBA",
        "Microsoft SQL Server certification",
        "AWS Database Specialty",
        "MongoDB Certified DBA",
      ],
      keyAchievementExamples: [
        "Reduced database query response time by 80% through indexing and query optimization",
        "Implemented Oracle RAC achieving 99.99% database availability for critical banking system",
        "Automated database maintenance tasks saving 20 hours/week through scripting",
        "Successfully executed zero-downtime migration of 5TB database to AWS RDS",
      ],
      actionVerbs: [
        "Administered", "Optimized", "Automated", "Migrated", "Configured",
        "Implemented", "Monitored", "Tuned", "Secured", "Recovered",
      ],
      atsKeywords: [
        "DBA", "Oracle", "SQL Server", "PostgreSQL", "Database Administration",
        "Performance Tuning", "Backup Recovery", "High Availability", "SQL", "Database Security",
      ],
    },

    summaryExamples: {
      fresher: "Database Administration graduate with strong SQL fundamentals and hands-on experience with Oracle and MySQL. Completed DBA internship managing production databases for 10+ applications. OCP certified with expertise in backup, recovery, and performance monitoring. Ready to maintain mission-critical database environments.",
      midLevel: "Oracle DBA with 5 years managing large-scale databases in BFSI sector. Expertise in Oracle RAC, performance tuning, and disaster recovery. Maintained 99.9% availability for databases supporting 1M+ daily transactions. AWS RDS experience with successful cloud migration projects.",
      senior: "Senior DBA / Database Architect with 10+ years in enterprise database management. Managed Oracle, SQL Server, and PostgreSQL environments across multiple data centers. Led database modernization initiatives saving ₹1Cr+ annually. Expert in cloud migration, NoSQL integration, and database DevOps.",
    },

    experienceBullets: [
      "Administered Oracle 19c RAC database cluster supporting core banking transactions for 2M+ customers",
      "Performed query optimization and indexing strategy, reducing average query execution time by 70%",
      "Implemented automated backup and recovery solution with RPO of 15 minutes and RTO of 1 hour",
      "Migrated 8TB on-premise Oracle database to AWS RDS with zero data loss and 4-hour downtime window",
      "Created monitoring dashboards for 15 production databases, proactively resolving 90% of issues before user impact",
    ],

    faqs: [
      {
        question: "Which database is best to specialize in for India?",
        answer: "Oracle is highest-paying and most in-demand in enterprise/BFSI. MySQL/PostgreSQL dominate startups and web companies. SQL Server is common in Microsoft-heavy enterprises. MongoDB for NoSQL. Oracle DBA certification (OCP) commands premium salaries. Cloud databases (AWS RDS) are the future - learn at least one cloud platform.",
      },
      {
        question: "Is Database Administration a good career in 2025?",
        answer: "Yes, with evolution towards cloud. Cloud DBAs managing AWS RDS, Aurora, DynamoDB are in high demand. Traditional DBAs must add cloud skills to stay relevant. Data engineering (ETL, data pipelines) is a natural adjacent skill. BFSI, healthcare, and government sectors have strong traditional DBA demand.",
      },
      {
        question: "DBA vs Data Engineer - which to choose?",
        answer: "DBAs focus on database operations, performance, security, and availability. Data Engineers build data pipelines, ETL processes, and data warehouses. Data Engineering pays more and is faster growing (linked to Data Science demand). DBAs provide more stable, operations-focused career. Your interest in operations vs development should guide the choice.",
      },
      {
        question: "What scripting skills does a DBA need?",
        answer: "Shell scripting (Bash) for automation is essential. PL/SQL for Oracle or T-SQL for SQL Server is mandatory. Python is increasingly important for automation, ETL, and data processing. PowerShell for Windows environments. Good scripting skills can automate 30-40% of routine DBA work.",
      },
    ],

    relatedJobs: ["data-analyst", "data-scientist", "cloud-architect", "software-engineer"],
  },

  "scrum-master": {
    slug: "scrum-master",
    title: "Scrum Master",
    titleVariants: ["Agile Coach", "Agile Scrum Master", "Release Train Engineer", "Agile Delivery Manager"],

    overview: {
      description: "Scrum Masters facilitate Agile/Scrum processes, remove impediments, and help development teams deliver value iteratively. They coach teams on Agile principles and serve as a bridge between stakeholders and development teams.",
      averageSalaryIndia: { fresher: "5-9 LPA", mid: "12-22 LPA", senior: "22-45+ LPA" },
      demandLevel: "Growing",
      topHiringCompanies: ["TCS", "Infosys", "Wipro", "Accenture", "IBM", "Capgemini", "Ericsson", "SAP"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Scrum Framework (Sprints, Ceremonies, Artifacts)",
        "Agile Principles & Manifesto",
        "Impediment Removal & Team Facilitation",
        "Backlog Grooming & Sprint Planning",
        "Jira & Confluence",
        "Stakeholder Communication",
      ],
      niceToHaveSkills: [
        "SAFe (Scaled Agile Framework)",
        "Kanban Methodology",
        "Coaching & Conflict Resolution",
        "Metrics & Reporting (velocity, burndown)",
        "Technical background (development experience)",
        "Change Management",
      ],
      certifications: [
        "CSM (Certified Scrum Master) - Scrum Alliance",
        "PSM I (Professional Scrum Master) - Scrum.org",
        "SAFe Scrum Master",
        "PMI-ACP (Agile Certified Practitioner)",
      ],
      keyAchievementExamples: [
        "Improved team sprint velocity by 35% within 6 months through coaching and process improvements",
        "Led Agile transformation for 3 teams reducing time-to-market by 40%",
        "Facilitated 100+ sprint ceremonies maintaining team satisfaction score of 4.5/5",
        "Reduced bug backlog by 60% by implementing Definition of Done and quality practices",
      ],
      actionVerbs: [
        "Facilitated", "Coached", "Led", "Mentored", "Removed",
        "Improved", "Implemented", "Guided", "Organized", "Resolved",
      ],
      atsKeywords: [
        "Scrum Master", "Agile", "Scrum", "SAFe", "CSM",
        "Sprint Planning", "Retrospectives", "Kanban", "Jira", "Team Coaching",
      ],
    },

    summaryExamples: {
      fresher: "CSM-certified Scrum Master with strong Agile foundation and team facilitation skills. Supported 2 Scrum teams as part of Agile transformation internship. Proficient in Jira, sprint ceremonies, and impediment tracking. Passionate about helping teams achieve high performance through servant leadership.",
      midLevel: "Experienced Scrum Master with 4 years facilitating Agile teams in IT services. Coached 4 teams to consistently deliver sprint goals with 90%+ completion rate. SAFe certified with experience in scaled agile environments. Expertise in conflict resolution, metrics tracking, and continuous improvement.",
      senior: "Senior Scrum Master / Agile Coach with 8+ years transforming organizations to Agile. Led SAFe implementation for 6 Agile Release Trains (50+ teams). Coached 200+ team members and stakeholders. Reduced average cycle time by 45% across programs. Speaker at Agile India conferences.",
    },

    experienceBullets: [
      "Facilitated daily standups, sprint planning, retrospectives, and reviews for 2 cross-functional teams of 8-10 members",
      "Identified and removed 30+ impediments per quarter enabling teams to maintain 92% sprint goal achievement",
      "Implemented team health metrics dashboard tracking velocity, happiness, and quality leading to 40% productivity improvement",
      "Coached product owners on backlog prioritization and user story writing, improving story quality by 60%",
      "Led SAFe PI Planning for 4 Agile Release Trains coordinating dependencies across 120+ team members",
    ],

    faqs: [
      {
        question: "CSM vs PSM - which Scrum Master certification is better?",
        answer: "Both are well-recognized. CSM (Scrum Alliance) requires a 2-day training course - better for networking and brand recognition. PSM I (Scrum.org) is exam-only, harder to pass, and generally considered more rigorous technically. PSM I is often preferred in global product companies. CSM is more common in Indian IT services. Get either to start.",
      },
      {
        question: "Do Scrum Masters need a technical background?",
        answer: "Not mandatory but very helpful. Understanding code, testing, and deployment helps you remove impediments more effectively and credibility with development teams. Many Scrum Masters come from developer or QA backgrounds. Non-technical SMs succeed in business-domain projects. Technical background opens higher-paying roles in product companies.",
      },
      {
        question: "What is the career growth path for Scrum Masters?",
        answer: "Scrum Master → Senior Scrum Master → Agile Coach → Release Train Engineer (SAFe) → Enterprise Agile Coach. Alternatively transition to Product Management or Project Management. SAFe certification (SPC, RTE) significantly increases salary. Agile Coaches at large enterprises earn 30-45 LPA+.",
      },
      {
        question: "Is Scrum Master a permanent role or transitional?",
        answer: "Both. Many professionals see it as a stepping stone to Product Manager, Program Manager, or Engineering Manager. Others build entire careers as Agile Coaches. In India, the role is most common in IT services companies. In product companies, Scrum Masters often evolve into Engineering Managers or Head of Delivery.",
      },
    ],

    relatedJobs: ["project-manager", "product-manager", "business-analyst", "hr-manager"],
  },

  "angular-developer": {
    slug: "angular-developer",
    title: "Angular Developer",
    titleVariants: ["Angular.js Developer", "Frontend Angular Developer", "Angular Engineer", "AngularTS Developer"],

    overview: {
      description: "Angular Developers build enterprise-grade web applications using Google's Angular framework. They work with TypeScript, component architecture, RxJS, and Angular CLI to create scalable, maintainable frontend applications.",
      averageSalaryIndia: { fresher: "4-7 LPA", mid: "8-16 LPA", senior: "18-35+ LPA" },
      demandLevel: "Medium",
      topHiringCompanies: ["TCS", "Infosys", "Capgemini", "Wipro", "Oracle", "SAP", "Accenture", "L&T Infotech"],
    },

    resumeSections: {
      mustHaveSkills: [
        "Angular (v12+) Framework",
        "TypeScript",
        "RxJS & Reactive Programming",
        "Angular CLI & Component Architecture",
        "HTML5, CSS3, SCSS",
        "REST API Integration (HttpClient)",
      ],
      niceToHaveSkills: [
        "NgRx State Management",
        "Angular Material & PrimeNG",
        "Unit Testing (Jasmine, Karma, Cypress)",
        "Performance Optimization (lazy loading, tree shaking)",
        "Micro Frontend Architecture",
        "Node.js & Express (full stack)",
      ],
      certifications: [
        "Google Angular Developer Certification",
        "JavaScript Developer Certification",
        "AWS Certified Developer",
        "TypeScript Advanced (Udemy/Pluralsight)",
      ],
      keyAchievementExamples: [
        "Built Angular enterprise portal used by 50,000 employees across 30 countries",
        "Reduced initial bundle size by 65% using lazy loading and code splitting",
        "Migrated AngularJS application to Angular 15, improving performance by 80%",
        "Developed reusable Angular component library with 40+ components, adopted by 8 teams",
      ],
      actionVerbs: [
        "Developed", "Built", "Migrated", "Optimized", "Implemented",
        "Designed", "Refactored", "Integrated", "Maintained", "Created",
      ],
      atsKeywords: [
        "Angular", "TypeScript", "RxJS", "NgRx", "Frontend Development",
        "Angular Material", "SPA", "REST API", "Jasmine", "Lazy Loading",
      ],
    },

    summaryExamples: {
      fresher: "Frontend Developer specializing in Angular with strong TypeScript and RxJS skills. Built 4 Angular projects including an enterprise dashboard and e-commerce SPA. Proficient in component-driven development, HttpClient, and Angular Material. Eager to contribute to large-scale enterprise applications.",
      midLevel: "Angular Developer with 4 years building complex enterprise web applications for BFSI and IT services. Expert in Angular 15+, RxJS, and NgRx state management. Delivered 10+ features for applications with 20K+ daily users. Strong focus on performance, testing, and Angular best practices.",
      senior: "Senior Angular Architect with 7+ years building large-scale enterprise frontends. Led migration of 5 AngularJS applications to Angular 16. Designed component library used by 15 teams. Expert in micro-frontends, performance optimization, and Angular DevOps. Mentored 8 junior Angular developers.",
    },

    experienceBullets: [
      "Developed enterprise HR management portal using Angular 16 with NgRx, serving 25,000 employees across multiple business units",
      "Implemented lazy loading and route-based code splitting, reducing initial load time from 8 seconds to 2.5 seconds",
      "Built reusable Angular component library with 35+ components using Angular Material, standardizing UI across 6 applications",
      "Integrated real-time notifications using WebSockets and RxJS, handling 10,000+ concurrent connections",
      "Wrote comprehensive unit tests with Jasmine/Karma achieving 85% code coverage across all Angular modules",
    ],

    faqs: [
      {
        question: "Angular vs React - which should I learn?",
        answer: "React is more popular overall, especially in startups and product companies. Angular is dominant in enterprise projects, IT services (TCS, Infosys, Wipro), and government applications. If you want startup jobs, learn React. If you target IT services or enterprise roles, Angular is very relevant. Angular developers face less competition.",
      },
      {
        question: "Is Angular still relevant in 2025?",
        answer: "Yes, especially in enterprise and IT services. Angular's opinionated structure, built-in TypeScript, and comprehensive tooling make it preferred for large teams. Google continues actively maintaining it. Banking, insurance, and enterprise software companies heavily use Angular. The market is smaller than React but still strong.",
      },
      {
        question: "How important is RxJS for Angular development?",
        answer: "Very important - RxJS is fundamental to Angular's async operations, HTTP calls, and event handling. You can build basic apps without deep RxJS knowledge, but for production work, understanding Observables, operators (map, switchMap, mergeMap), and Subject is essential. Most Angular interview questions include RxJS.",
      },
      {
        question: "What is the difference between AngularJS and Angular?",
        answer: "AngularJS (Angular 1.x) is the old JavaScript-based framework, largely legacy. Angular (2+) is a complete rewrite in TypeScript with component-based architecture, better performance, and modern features. They are entirely different frameworks. Most new projects use Angular 15+. If a job says 'AngularJS', be aware it's older technology.",
      },
    ],

    relatedJobs: ["react-developer", "full-stack-developer", "web-developer", "software-engineer"],
  },

  "embedded-systems-engineer": {
    slug: "embedded-systems-engineer",
    title: "Embedded Systems Engineer",
    titleVariants: ["Embedded Software Engineer", "Firmware Engineer", "RTOS Developer", "IoT Engineer"],

    overview: {
      description: "Embedded Systems Engineers design and develop software for embedded hardware systems found in automotive, consumer electronics, industrial, and IoT devices. They work close to hardware with real-time operating systems and microcontrollers.",
      averageSalaryIndia: { fresher: "4-8 LPA", mid: "10-18 LPA", senior: "20-40+ LPA" },
      demandLevel: "Growing",
      topHiringCompanies: ["Texas Instruments", "Qualcomm", "Intel", "Bosch", "Continental", "Tata Elxsi", "L&T Technology", "KPIT"],
    },

    resumeSections: {
      mustHaveSkills: [
        "C/C++ Programming (embedded)",
        "Microcontrollers (ARM Cortex, STM32, PIC, AVR)",
        "RTOS (FreeRTOS, AUTOSAR, VxWorks)",
        "Device Drivers Development",
        "Communication Protocols (UART, SPI, I2C, CAN)",
        "Debugging (JTAG, oscilloscope, logic analyzer)",
      ],
      niceToHaveSkills: [
        "Automotive Standards (AUTOSAR, MISRA C)",
        "IoT Protocols (MQTT, CoAP, BLE)",
        "Python for test automation",
        "FPGA (Verilog/VHDL)",
        "Linux Kernel & BSP development",
        "Functional Safety (ISO 26262, IEC 61508)",
      ],
      certifications: [
        "ARM Accredited Engineer (AAE)",
        "AUTOSAR System & Software Design",
        "Certified Embedded Systems Engineer (CEES)",
        "FreeRTOS Developer Certification",
      ],
      keyAchievementExamples: [
        "Developed AUTOSAR-compliant firmware for automotive ECU reducing boot time by 35%",
        "Implemented CAN/LIN communication stack for body control module in production vehicle",
        "Optimized FreeRTOS task scheduling reducing CPU utilization by 25% on ARM Cortex-M4",
        "Developed OTA firmware update mechanism for IoT fleet of 50,000+ devices",
      ],
      actionVerbs: [
        "Developed", "Implemented", "Optimized", "Integrated", "Debugged",
        "Designed", "Ported", "Tested", "Validated", "Programmed",
      ],
      atsKeywords: [
        "Embedded Systems", "C/C++", "RTOS", "ARM", "Microcontroller",
        "Firmware", "Device Drivers", "CAN Protocol", "FreeRTOS", "IoT",
      ],
    },

    summaryExamples: {
      fresher: "Electronics & Communication graduate with strong embedded C programming skills and hands-on microcontroller experience. Completed projects on STM32 including a PID motor controller and IoT weather station. Proficient in FreeRTOS, SPI/I2C protocols, and hardware debugging. Ready to develop reliable firmware for embedded products.",
      midLevel: "Embedded Software Engineer with 4 years developing firmware for automotive and IoT products. Expertise in ARM Cortex-M, FreeRTOS, and CAN/LIN protocols. Contributed to 3 AUTOSAR-compliant ECU projects in production vehicles. Strong debugging skills with oscilloscope, JTAG, and trace tools.",
      senior: "Senior Embedded Systems Architect with 9+ years in automotive and industrial embedded software. Led firmware development for 5 mass-production automotive ECUs. Expert in AUTOSAR, ISO 26262 functional safety, and real-time system design. Technical lead for 8-person embedded team delivering ADAS features.",
    },

    experienceBullets: [
      "Developed AUTOSAR Classic firmware for body control module in BS6-compliant vehicle using Vector tools (CANoe, CAPL)",
      "Implemented FreeRTOS-based embedded application on STM32H7, managing 12 concurrent tasks with hard real-time requirements",
      "Designed and validated CAN communication stack for vehicle diagnostics conforming to ISO 15765-2 (ISO-TP) standard",
      "Reduced memory footprint of firmware from 512KB to 380KB through code optimization enabling port to lower-cost MCU",
      "Developed automated hardware-in-the-loop (HIL) test framework, increasing test coverage from 40% to 85%",
    ],

    faqs: [
      {
        question: "Which microcontroller is best to learn for embedded systems?",
        answer: "ARM Cortex-M (STM32 boards) is industry standard and highly recommended. Arduino for beginners to understand basics. Raspberry Pi for Linux-based embedded. ESP32 for IoT and wireless projects. In India, automotive companies use NXP S32 and Renesas RH850. STM32 + FreeRTOS gives you the most transferable skills.",
      },
      {
        question: "Is embedded systems a good career in India?",
        answer: "Yes, especially with EV and automotive growth. Companies like Bosch, Continental, KPIT, Tata Elxsi, and L&T Technology have large embedded teams in Bangalore, Pune, and Chennai. Automotive embedded is the highest paying vertical. IoT and semiconductor design (Qualcomm, Intel) also pay very well. Niche but high-value skill.",
      },
      {
        question: "Do embedded engineers need to know Linux?",
        answer: "Linux kernel and device driver knowledge is crucial for embedded Linux roles (automotive infotainment, industrial computers, networking equipment). For bare-metal or RTOS development, Linux kernel knowledge is less critical but helpful. Embedded Linux and bare-metal RTOS are two distinct tracks in embedded systems.",
      },
      {
        question: "What is the career growth for Embedded Engineers?",
        answer: "Embedded Engineer → Senior → Lead/Architect → Technical Fellow or Engineering Manager. Automotive embedded is fastest growing in India. Semiconductor companies (Qualcomm, Texas Instruments) offer top salaries. Specializing in AUTOSAR functional safety (ISO 26262) or ADAS commands significant salary premium.",
      },
    ],

    relatedJobs: ["software-engineer", "cybersecurity-analyst", "network-engineer", "qa-engineer"],
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

  "infosys": {
    slug: "infosys",
    name: "Infosys",
    description: "Infosys is a global leader in next-generation digital services and consulting. Founded in 1981, it helps clients in 50+ countries navigate their digital transformation journey.",
    industry: "IT Services & Consulting",
    headquarter: "Bengaluru, India",
    employeeCount: "340,000+",
    popularRoles: [
      "Systems Engineer",
      "Senior Systems Engineer",
      "Technology Analyst",
      "Digital Specialist",
      "Consultant",
      "Data Engineer",
    ],
    hiringProcess: [
      "Online Application via Infosys Careers",
      "InfyTQ Assessment (for freshers) or HackWithInfy",
      "Technical Interview (1-2 rounds)",
      "HR Interview",
      "Offer & Background Verification",
    ],
    resumeTips: [
      "Highlight digital skills: Cloud, AI/ML, Data Analytics",
      "Include certifications especially Infosys Springboard courses",
      "Emphasize problem-solving and client interaction experience",
      "Mention any experience with Infosys platforms or Finacle",
      "Keep resume ATS-friendly with clear sections",
    ],
    atsKeywords: [
      "Infosys", "Digital Transformation", "Cloud", "AI/ML", "Java",
      "Python", "AWS", "Azure", "Agile", "DevOps", "Consulting",
      "Client Delivery", "SDLC", "Full Stack", "Data Analytics",
    ],
    faqs: [
      {
        question: "What is InfyTQ and how to prepare?",
        answer: "InfyTQ is Infosys certification program for engineering students. It tests hands-on programming skills and includes learning modules. Complete the certification to get direct interview opportunity. Practice on InfyTQ platform itself.",
      },
      {
        question: "What is the difference between SP and DSE roles at Infosys?",
        answer: "Systems Engineer (SE/SP) is entry-level role with 3.6 LPA package. Digital Specialist Engineer (DSE) requires stronger technical skills with 5+ LPA package. DSE works on specialized tech stacks and has faster growth.",
      },
      {
        question: "Does Infosys sponsor higher education?",
        answer: "Yes, Infosys has tie-ups with universities for part-time MS programs. They also have internal learning platforms and certifications. After certain tenure, employees can pursue higher studies with company support.",
      },
      {
        question: "What is the training period at Infosys?",
        answer: "Infosys has 3-6 months training at Mysore campus for freshers. Training covers technical skills, soft skills, and domain knowledge. You get stipend during training. Performance in training affects initial project allocation.",
      },
    ],
    relatedCompanies: ["tcs", "wipro", "cognizant", "hcl"],
  },

  "wipro": {
    slug: "wipro",
    name: "Wipro",
    description: "Wipro Limited is a leading global IT, consulting, and business process services company. It harnesses the power of cognitive computing, hyper-automation, and cloud to help clients adapt to the digital world.",
    industry: "IT Services & Consulting",
    headquarter: "Bengaluru, India",
    employeeCount: "250,000+",
    popularRoles: [
      "Project Engineer",
      "Senior Software Engineer",
      "Technical Lead",
      "Solution Architect",
      "Business Analyst",
      "Quality Analyst",
    ],
    hiringProcess: [
      "Online Application via Wipro Careers or Campus",
      "Wipro NLTH (National Level Talent Hunt) Assessment",
      "Technical Interview",
      "HR Interview",
      "Document Verification & Offer",
    ],
    resumeTips: [
      "Highlight experience with emerging technologies",
      "Include Wipro-relevant skills: WILP, TopGear",
      "Emphasize adaptability and continuous learning",
      "Mention any automation or process improvement work",
      "Keep format clean with quantified achievements",
    ],
    atsKeywords: [
      "Wipro", "Digital", "Automation", "Cloud", "Java", ".NET",
      "Python", "AWS", "Azure", "DevOps", "Agile", "Quality",
      "Testing", "Consulting", "SDLC", "Offshore",
    ],
    faqs: [
      {
        question: "What is Wipro NLTH exam pattern?",
        answer: "NLTH has Aptitude (Verbal, Analytical, Quantitative), Written English test, and Online Programming Test. Duration is about 2 hours. Cutoff varies by role (Elite, Turbo, etc.). Practice aptitude and basic coding.",
      },
      {
        question: "What is WILP program at Wipro?",
        answer: "WILP (Work Integrated Learning Program) allows you to pursue degree/diploma while working at Wipro. Programs available in B.Tech, M.Tech, and MBA. Good for those who want to enhance qualifications while earning.",
      },
      {
        question: "What is the salary structure at Wipro for freshers?",
        answer: "Wipro offers different packages: Project Engineer (3.5 LPA), Elite (3.8 LPA), and Turbo (6.5 LPA). Turbo requires higher technical skills and coding proficiency. Variable pay and bonuses are additional.",
      },
      {
        question: "How is work-life balance at Wipro?",
        answer: "Generally good compared to product companies. Depends on project and client. Most projects follow standard 9-hour workday. Overtime expectations vary by team. Wipro emphasizes employee wellness programs.",
      },
    ],
    relatedCompanies: ["tcs", "infosys", "cognizant", "hcl"],
  },

  "cognizant": {
    slug: "cognizant",
    name: "Cognizant",
    description: "Cognizant is one of the world's leading professional services companies, transforming clients' business, operating, and technology models for the digital era. Headquartered in the US with major presence in India.",
    industry: "IT Services & Consulting",
    headquarter: "Teaneck, New Jersey (Major operations in Chennai)",
    employeeCount: "350,000+",
    popularRoles: [
      "Programmer Analyst",
      "Associate",
      "Senior Associate",
      "Technology Specialist",
      "Manager",
      "Quality Engineering Analyst",
    ],
    hiringProcess: [
      "Online Application via Cognizant Careers",
      "GenC Assessment (Aptitude + Coding)",
      "Technical Interview (1-2 rounds)",
      "HR Interview",
      "Background Verification & Offer",
    ],
    resumeTips: [
      "Highlight full-stack development skills",
      "Include cloud certifications (AWS/Azure preferred)",
      "Emphasize client communication and teamwork",
      "Mention any experience with healthcare, banking, or retail domains",
      "Use action verbs and quantify achievements",
    ],
    atsKeywords: [
      "Cognizant", "GenC", "Digital", "Cloud", "Java", "Python",
      ".NET", "AWS", "Azure", "DevOps", "Agile", "Full Stack",
      "Testing", "Automation", "Healthcare", "BFSI",
    ],
    faqs: [
      {
        question: "What is Cognizant GenC and GenC Next?",
        answer: "GenC is entry-level role (4 LPA) for graduates. GenC Next (6.75 LPA) requires stronger technical skills. GenC Elevate is for candidates with specialized skills. Assessment includes aptitude, coding, and communication tests.",
      },
      {
        question: "Does Cognizant hire from non-CS branches?",
        answer: "Yes, Cognizant hires from ECE, EEE, Mechanical, and other engineering branches. They provide training to bridge technical gaps. However, CS/IT students generally have advantage in technical rounds.",
      },
      {
        question: "What is the training process at Cognizant?",
        answer: "Training is 2-3 months covering technical skills, domain knowledge, and soft skills. Training is usually at Chennai or Coimbatore campus. You receive full salary during training. Assessment at end determines project allocation.",
      },
      {
        question: "How is the appraisal cycle at Cognizant?",
        answer: "Annual appraisal cycle typically in April-May. Average hike is 6-10% for good performers. Promotions follow defined timelines (2-3 years per level). High performers can get accelerated promotions and better hikes.",
      },
    ],
    relatedCompanies: ["tcs", "infosys", "wipro", "accenture"],
  },

  "accenture": {
    slug: "accenture",
    name: "Accenture",
    description: "Accenture is a global professional services company with leading capabilities in digital, cloud, and security. Serving clients in 120+ countries, it provides strategy, consulting, technology, and operations services.",
    industry: "Professional Services & Consulting",
    headquarter: "Dublin, Ireland (Major presence in India)",
    employeeCount: "738,000+ globally",
    popularRoles: [
      "Associate Software Engineer",
      "Software Engineer",
      "Analyst",
      "Consultant",
      "Solution Architect",
      "Technology Architect",
    ],
    hiringProcess: [
      "Online Application via Accenture Careers",
      "Cognitive and Technical Assessment",
      "Technical Interview",
      "HR Interview",
      "Background Verification & Offer",
    ],
    resumeTips: [
      "Highlight consulting and client-facing experience",
      "Include certifications in cloud, security, or SAP",
      "Emphasize problem-solving and analytical skills",
      "Mention cross-functional collaboration experience",
      "Show continuous learning mindset",
    ],
    atsKeywords: [
      "Accenture", "Consulting", "Digital", "Cloud", "Security",
      "Java", "Python", "AWS", "Azure", "SAP", "Salesforce",
      "DevOps", "Agile", "Strategy", "Technology", "Innovation",
    ],
    faqs: [
      {
        question: "What is the difference between ASE and SE roles at Accenture?",
        answer: "Associate Software Engineer (ASE) is entry-level with 4.5 LPA package. Software Engineer (SE) requires better technical skills with 6.5 LPA. SE goes through shorter training and works on more complex projects.",
      },
      {
        question: "Does Accenture provide good career growth?",
        answer: "Yes, Accenture has well-defined career levels from Analyst to Managing Director. Promotions are performance-based with annual reviews. Internal mobility allows switching between technology, consulting, and operations tracks.",
      },
      {
        question: "What is Accenture's training program like?",
        answer: "Training is 1-3 months depending on role and technology. Training covers technical skills, Accenture processes, and soft skills. Accenture has extensive online learning platform (myLearning) with thousands of courses.",
      },
      {
        question: "How is work culture at Accenture India?",
        answer: "Generally professional with exposure to global clients. Work hours depend on project and client timezone. Strong focus on diversity and inclusion. Good learning opportunities and certifications supported by company.",
      },
    ],
    relatedCompanies: ["cognizant", "tcs", "infosys", "deloitte"],
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
