// Universal Use Cases - PromptWise works for everything

export interface UseCase {
  id: string;
  name: string;
  icon: string;
  description: string;
  examples: string[];
  categories: string[];
}

export const useCases: UseCase[] = [
  {
    id: "video-content",
    name: "Video Content",
    icon: "🎬",
    description: "TikTok, YouTube Shorts, Reels, long-form videos",
    examples: ["Tutorial video", "Product review", "Storytelling clip"],
    categories: ["Tutorial", "Entertainment", "Education", "Lifestyle", "Product Review", "Storytelling"]
  },
  {
    id: "resume-cv",
    name: "Resume & CV",
    icon: "📄",
    description: "Professional resumes, CVs, cover letters, portfolios",
    examples: ["Software engineer resume", "Medical CV", "Executive portfolio"],
    categories: ["Entry-Level", "Mid-Career", "Executive", "Academic CV", "Creative Portfolio", "Federal Resume"]
  },
  {
    id: "academic-research",
    name: "Academic Research",
    icon: "🎓",
    description: "Bachelor's, Master's, PhD projects, theses, papers",
    examples: ["Master's thesis proposal", "PhD research topic", "Undergraduate project"],
    categories: ["Bachelor's Project", "Master's Thesis", "PhD Dissertation", "Research Paper", "Literature Review", "Proposal"]
  },
  {
    id: "business-writing",
    name: "Business Documents",
    icon: "💼",
    description: "Proposals, reports, business plans, presentations",
    examples: ["Business plan", "Project proposal", "Executive summary"],
    categories: ["Business Plan", "Proposal", "Report", "Presentation", "Pitch Deck", "Case Study"]
  },
  {
    id: "creative-writing",
    name: "Creative Writing",
    icon: "✍️",
    description: "Stories, scripts, novels, poetry, articles",
    examples: ["Short story", "Screenplay", "Blog article"],
    categories: ["Novel", "Short Story", "Screenplay", "Poetry", "Blog Post", "Article"]
  },
  {
    id: "marketing-content",
    name: "Marketing & Ads",
    icon: "📢",
    description: "Ads, social posts, email campaigns, landing pages",
    examples: ["Facebook ad", "Email sequence", "Landing page copy"],
    categories: ["Social Media", "Email Marketing", "Ad Copy", "Landing Page", "SEO Content", "Product Description"]
  },
  {
    id: "technical-docs",
    name: "Technical Documentation",
    icon: "⚙️",
    description: "API docs, user guides, technical specs, tutorials",
    examples: ["API documentation", "User manual", "Technical guide"],
    categories: ["API Docs", "User Guide", "Technical Spec", "Tutorial", "README", "Architecture Doc"]
  },
  {
    id: "personal-development",
    name: "Personal Development",
    icon: "🌱",
    description: "Goal planning, habit tracking, journal prompts, learning plans",
    examples: ["Career development plan", "Learning roadmap", "Life goals"],
    categories: ["Goal Setting", "Habit Building", "Learning Plan", "Career Planning", "Self-Reflection", "Productivity"]
  },
  {
    id: "legal-documents",
    name: "Legal & Formal",
    icon: "⚖️",
    description: "Contracts, agreements, formal letters, legal briefs",
    examples: ["Service agreement", "Formal complaint", "Legal brief"],
    categories: ["Contract", "Agreement", "Formal Letter", "Legal Brief", "Policy Document", "Terms of Service"]
  },
  {
    id: "education-teaching",
    name: "Education & Teaching",
    icon: "👨‍🏫",
    description: "Lesson plans, curricula, assessments, educational content",
    examples: ["Lesson plan", "Course curriculum", "Quiz design"],
    categories: ["Lesson Plan", "Curriculum", "Assessment", "Educational Material", "Syllabus", "Teaching Strategy"]
  }
];

export function getUseCase(id: string): UseCase | undefined {
  return useCases.find(uc => uc.id === id);
}

export function getUseCasesBySearch(query: string): UseCase[] {
  const lowerQuery = query.toLowerCase();
  return useCases.filter(uc => 
    uc.name.toLowerCase().includes(lowerQuery) ||
    uc.description.toLowerCase().includes(lowerQuery) ||
    uc.examples.some(ex => ex.toLowerCase().includes(lowerQuery))
  );
}
