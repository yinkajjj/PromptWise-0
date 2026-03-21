export interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tool: string;
  tone: string;
  tags: string[];
  copies: number;
  rating: number;
  dateAdded: string;
  tip?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export const mockPrompts: Prompt[] = [
  {
    id: "1",
    title: "Creative Blog Post Generator",
    description: "Generate engaging blog posts with a unique perspective",
    prompt: "Write a {tone} 800-word blog post about {topic}. Start with a compelling hook that challenges conventional wisdom. Include 3 practical examples, 2 expert quotes (you can create realistic ones), and end with an actionable takeaway. Use subheadings for better readability.",
    category: "writing",
    tool: "chatgpt",
    tone: "conversational",
    tags: ["blogging", "content", "seo"],
    copies: 1247,
    rating: 4.8,
    dateAdded: "2025-10-20",
    tip: "Replace {topic} and {tone} with your specific needs. Ask for multiple headline variations.",
    isFeatured: true,
    isTrending: true
  },
  {
    id: "2",
    title: "Product Photography Prompt",
    description: "Create stunning product shots with perfect lighting",
    prompt: "Professional product photography of {product}, studio lighting, white background, 85mm lens, shallow depth of field, commercial quality, high resolution, clean composition, centered, soft shadows --ar 1:1 --v 6 --style raw",
    category: "image",
    tool: "midjourney",
    tone: "professional",
    tags: ["product", "photography", "ecommerce"],
    copies: 892,
    rating: 4.9,
    dateAdded: "2025-10-18",
    tip: "Adjust aspect ratio (--ar) for different platforms. Try 16:9 for web banners or 4:5 for Instagram.",
    isFeatured: true
  },
  {
    id: "3",
    title: "Social Media Campaign Planner",
    description: "Plan a complete week of social media content",
    prompt: "Create a 7-day social media content calendar for {brand/topic}. For each day provide:\n- Platform (Instagram, LinkedIn, or TikTok)\n- Post type (carousel, reel, story, or static)\n- Hook/headline\n- Caption with emojis\n- 5 relevant hashtags\n- Call-to-action\n- Suggested visual description\n\nMake it {tone} and optimized for engagement.",
    category: "business",
    tool: "claude",
    tone: "professional",
    tags: ["marketing", "social-media", "content-strategy"],
    copies: 1056,
    rating: 4.7,
    dateAdded: "2025-10-15",
    tip: "Specify your target audience and brand voice for more tailored results."
  },
  {
    id: "4",
    title: "YouTube Script with Hooks",
    description: "Write engaging video scripts with retention hooks",
    prompt: "Write a 5-7 minute YouTube script about {topic} with these elements:\n\n1. HOOK (first 8 seconds): Start with a bold statement or question\n2. INTRO: Briefly introduce yourself and what viewers will learn\n3. MAIN CONTENT: Break into 3 key points with examples\n4. B-ROLL SUGGESTIONS: Note where to add supporting visuals\n5. ENGAGEMENT PROMPTS: 2-3 moments to ask for likes/comments\n6. OUTRO: Recap and strong CTA\n\nKeep it {tone} and conversational. Include [PAUSE] markers for emphasis.",
    category: "video",
    tool: "chatgpt",
    tone: "conversational",
    tags: ["youtube", "video-script", "content-creation"],
    copies: 743,
    rating: 4.6,
    dateAdded: "2025-10-12",
    tip: "Add specific time markers if you need a different video length."
  },
  {
    id: "5",
    title: "Cinematic Scene Generator",
    description: "Create movie-quality scene descriptions",
    prompt: "{scene description}, cinematic lighting, shot on ARRI Alexa, anamorphic lens, film grain, dramatic atmosphere, golden hour, depth of field, 8k, ultra detailed, professional color grading --ar 21:9 --v 6",
    category: "image",
    tool: "midjourney",
    tone: "professional",
    tags: ["cinematic", "film", "atmosphere"],
    copies: 654,
    rating: 4.8,
    dateAdded: "2025-10-10",
    tip: "Experiment with different times of day (golden hour, blue hour, twilight) for varied moods."
  },
  {
    id: "6",
    title: "Customer Persona Builder",
    description: "Create detailed ideal customer profiles",
    prompt: "Create 3 detailed customer personas for {product/service}. For each persona include:\n\n**Demographics:**\n- Name and age\n- Occupation and income range\n- Location type (urban/suburban/rural)\n- Family situation\n\n**Psychographics:**\n- Goals and aspirations\n- Pain points and frustrations\n- Values and beliefs\n- Daily routine\n\n**Buying Behavior:**\n- Where they research products\n- Decision-making factors\n- Budget sensitivity\n- Preferred communication channels\n\n**How to Reach Them:**\n- Best marketing channels\n- Content they engage with\n- Messaging that resonates\n- Potential objections and how to address them",
    category: "business",
    tool: "claude",
    tone: "professional",
    tags: ["marketing", "personas", "strategy"],
    copies: 521,
    rating: 4.9,
    dateAdded: "2025-10-08",
    tip: "Use real customer data if available to make personas more accurate.",
    isFeatured: true
  },
  {
    id: "7",
    title: "Email Marketing Sequence",
    description: "Build a complete email nurture sequence",
    prompt: "Create a 5-email welcome sequence for {business/product}. Make it {tone}.\n\nEmail 1 (Day 0): Welcome & Set Expectations\n- Warm welcome\n- What they'll receive\n- Quick win or freebie\n\nEmail 2 (Day 2): Educational Content\n- Solve a specific problem\n- Establish authority\n- Soft CTA\n\nEmail 3 (Day 4): Social Proof\n- Customer success story\n- Results/testimonials\n- Address common objection\n\nEmail 4 (Day 6): Product/Service Deep Dive\n- Features and benefits\n- Use cases\n- Strong CTA\n\nEmail 5 (Day 8): Urgency & Offer\n- Limited-time incentive\n- Clear next steps\n- Multiple CTAs\n\nInclude subject lines and preview text for each email.",
    category: "business",
    tool: "chatgpt",
    tone: "conversational",
    tags: ["email", "marketing", "automation"],
    copies: 687,
    rating: 4.7,
    dateAdded: "2025-10-05",
    tip: "Adjust timing based on your sales cycle. B2B might need longer intervals."
  },
  {
    id: "8",
    title: "Architectural Visualization",
    description: "Generate photorealistic architecture renders",
    prompt: "Architectural visualization of {building type}, modern minimalist design, large glass windows, natural lighting, surrounded by landscaping, professional photography, shot with tilt-shift lens, clean lines, high-end materials, 8k resolution, architectural digest style --ar 16:9 --v 6",
    category: "image",
    tool: "midjourney",
    tone: "professional",
    tags: ["architecture", "design", "visualization"],
    copies: 445,
    rating: 4.6,
    dateAdded: "2025-10-03",
    tip: "Add specific architectural styles like 'brutalist', 'bauhaus', or 'organic architecture' for different aesthetics."
  },
  {
    id: "9",
    title: "Tutorial Video Storyboard",
    description: "Plan educational video content with visual cues",
    prompt: "Create a detailed storyboard for a {duration}-minute tutorial video about {topic}. Include:\n\n**For each scene:**\n- Timestamp\n- Visual description (what's on screen)\n- Voiceover/dialogue\n- On-screen text or graphics\n- Camera angle/movement\n- Transition type\n\n**Additional elements:**\n- Background music suggestions\n- Sound effects needed\n- Color grading notes\n- Pacing notes (fast/slow moments)\n\nMake it {tone} and suitable for {platform}.",
    category: "video",
    tool: "claude",
    tone: "professional",
    tags: ["tutorial", "storyboard", "education"],
    copies: 389,
    rating: 4.5,
    dateAdded: "2025-10-01",
    tip: "Specify your target audience's skill level for appropriate pacing and complexity."
  },
  {
    id: "10",
    title: "Character Concept Art",
    description: "Design unique character concepts for games or stories",
    prompt: "Character concept art, {character description}, full body shot, three-quarter view, detailed costume design, fantasy RPG style, digital painting, concept art, trending on ArtStation, highly detailed, professional illustration, character sheet style, neutral background --ar 2:3 --v 6",
    category: "image",
    tool: "midjourney",
    tone: "creative",
    tags: ["character", "concept-art", "game-design"],
    copies: 567,
    rating: 4.8,
    dateAdded: "2025-09-28",
    tip: "Add 'multiple angles' or 'turnaround sheet' for character design reference sheets.",
    isTrending: true
  },
  {
    id: "11",
    title: "SEO Content Brief",
    description: "Create comprehensive content briefs for writers",
    prompt: "Create a detailed SEO content brief for an article about {topic}. Include:\n\n**Target Keyword:** [primary keyword]\n**Secondary Keywords:** [5-7 related terms]\n**Search Intent:** [informational/transactional/navigational]\n**Target Word Count:** [recommended length]\n\n**Outline:**\n- H1 (title with keyword)\n- Introduction (what to cover)\n- H2 sections (4-6 main points)\n- H3 subsections where needed\n- Conclusion\n\n**Content Requirements:**\n- Questions to answer (from 'People Also Ask')\n- Statistics or data to include\n- Internal linking opportunities\n- External sources to reference\n- Images/media needed\n\n**Competitor Analysis:**\n- Top 3 ranking articles (what they cover)\n- Content gaps to fill\n- Unique angle for this piece\n\n**Meta Data:**\n- SEO title (60 chars)\n- Meta description (155 chars)\n- URL slug",
    category: "writing",
    tool: "claude",
    tone: "professional",
    tags: ["seo", "content-strategy", "writing"],
    copies: 712,
    rating: 4.9,
    dateAdded: "2025-09-25",
    tip: "Use actual keyword research data for better results. Tools like Ahrefs or SEMrush help.",
    isFeatured: true
  },
  {
    id: "12",
    title: "Product Launch Announcement",
    description: "Craft compelling product launch messages",
    prompt: "Write a product launch announcement for {product name}. Make it {tone}.\n\n**Structure:**\n\n1. **Attention-Grabbing Headline**\n   - Create curiosity or highlight main benefit\n\n2. **The Problem**\n   - What pain point does this solve?\n   - Make it relatable\n\n3. **The Solution**\n   - Introduce your product\n   - Key features (3-5 bullet points)\n   - What makes it different?\n\n4. **Social Proof**\n   - Early user testimonials or beta results\n   - Credibility indicators\n\n5. **How It Works**\n   - Simple 3-step process\n   - Remove complexity\n\n6. **Pricing & Offer**\n   - Clear pricing\n   - Launch special/discount\n   - Urgency element\n\n7. **Strong CTA**\n   - What to do next\n   - Multiple CTA buttons\n\n8. **FAQ Section**\n   - Address 5 common questions\n\nProvide versions for: email, landing page, and social media.",
    category: "business",
    tool: "chatgpt",
    tone: "professional",
    tags: ["product-launch", "marketing", "copywriting"],
    copies: 834,
    rating: 4.7,
    dateAdded: "2025-09-22",
    tip: "A/B test different headlines and CTAs to optimize conversion rates."
  }
];

export const categories = [
  { key: "all", label: "All", icon: "Sparkles", count: mockPrompts.length },
  { key: "writing", label: "Writing", icon: "PenTool", count: mockPrompts.filter(p => p.category === "writing").length },
  { key: "image", label: "Image", icon: "Image", count: mockPrompts.filter(p => p.category === "image").length },
  { key: "business", label: "Business", icon: "Briefcase", count: mockPrompts.filter(p => p.category === "business").length },
  { key: "video", label: "Video", icon: "Video", count: mockPrompts.filter(p => p.category === "video").length },
];

export const tools = [
  { key: "all", label: "All Tools" },
  { key: "chatgpt", label: "ChatGPT" },
  { key: "claude", label: "Claude" },
  { key: "midjourney", label: "Midjourney" },
  { key: "runway", label: "Runway" },
];

export const tones = [
  "All Tones",
  "Conversational",
  "Professional",
  "Creative",
  "Playful",
  "Inspirational",
  "Technical",
];

