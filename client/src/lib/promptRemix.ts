// Prompt Iteration - Remix and refine prompts intelligently

export type RemixType = 
  | "more-viral" 
  | "simplify" 
  | "add-detail" 
  | "change-tone" 
  | "different-hook"
  | "add-humor"
  | "more-emotional"
  | "trending-format";

export interface RemixOptions {
  type: RemixType;
  currentPrompt: string;
  tone?: string;
  platform?: string;
  category?: string;
}

export function remixPrompt(options: RemixOptions): string {
  const { type, currentPrompt, tone, platform, category } = options;

  switch (type) {
    case "more-viral":
      return makeMoreViral(currentPrompt, platform, category);

    case "simplify":
      return simplifyPrompt(currentPrompt);

    case "add-detail":
      return addMoreDetail(currentPrompt, category);

    case "change-tone":
      return changeTone(currentPrompt, tone);

    case "different-hook":
      return generateNewHook(currentPrompt, category);

    case "add-humor":
      return addHumor(currentPrompt);

    case "more-emotional":
      return makeMoreEmotional(currentPrompt);

    case "trending-format":
      return addTrendingFormat(currentPrompt, platform);

    default:
      return currentPrompt;
  }
}

function makeMoreViral(prompt: string, platform?: string, category?: string): string {
  const viralElements = [
    "\n\n🔥 VIRAL BOOST ADDITIONS:",
    "- Start with a pattern interrupt: 'Wait, WHAT?!' or 'Stop scrolling!'",
    "- Add controversy or unpopular opinion angle",
    "- Include a 'Comment [X] if you agree' CTA",
    "- Use trending sounds/music",
    "- Add text overlays with key points",
    "- Create a cliffhanger for Part 2",
    "- Include relatable pain points",
    "- End with 'Follow for more [niche] content'",
  ];

  if (platform?.includes("TikTok")) {
    viralElements.push("- Use duet/stitch opportunity");
    viralElements.push("- Leverage trending hashtag challenges");
  }

  return prompt + "\n" + viralElements.join("\n");
}

function simplifyPrompt(prompt: string): string {
  // Extract core message
  const coreMessage = `SIMPLIFIED VERSION:

Create a ${prompt.includes("video") ? "video" : "piece of content"} that:

1. Opens with ONE attention-grabbing hook (3 seconds)
2. Delivers ONE main point clearly
3. Shows simple visuals (no complex editing needed)
4. Ends with ONE clear call-to-action

Keep it short, simple, and focused on ONE idea.

Avoid:
- Multiple storylines
- Complex explanations
- Too many points
- Advanced editing techniques

Goal: Make something you can create TODAY with minimal equipment.`;

  return coreMessage;
}

function addMoreDetail(prompt: string, category?: string): string {
  const detailAdditions = `

📋 ADDITIONAL DETAILED REQUIREMENTS:

TECHNICAL SPECS:
- Lighting: Natural light or ring light (specify which scenes)
- Camera: Phone camera acceptable, suggest angles (eye-level, low-angle, etc.)
- Audio: Use phone mic or lavalier, note where to add voiceover
- Location: Specify indoor/outdoor, background requirements

CONTENT STRUCTURE (Expanded):
- 0-3s: Hook (exact opening line + visual)
- 3-10s: Context (what problem/situation you're addressing)
- 10-25s: Main content (the "meat" of your video)
- 25-40s: Supporting points or B-roll
- 40-50s: Transition to conclusion
- 50-60s: CTA and final frame

EDITING CHECKLIST:
□ Add captions (for accessibility and scrollers)
□ Include 2-3 text overlays highlighting key points
□ Use 1-2 transitions (cuts, zooms)
□ Add background music (suggest energy level)
□ Color grade for consistency
□ Add sound effects for emphasis (optional)

ENGAGEMENT TACTICS:
- Question in caption to drive comments
- Controversial or surprising angle
- Tag relevant creators/brands (when appropriate)
- Create series potential (Part 1 of ?)

POST-PRODUCTION:
- Thumbnail selection: [which frame to use]
- Best posting time: [based on audience]
- Caption strategy: [hook + body + CTA]
- First comment: [pin a conversation starter]`;

  return prompt + detailAdditions;
}

function changeTone(prompt: string, newTone?: string): string {
  const toneGuidelines: Record<string, string> = {
    "Friendly": "Use casual language, 'you/your', contractions, emoji, conversational style. Like talking to a friend.",
    "Professional": "Use industry terminology, clear structure, authoritative voice. Like a conference presentation.",
    "Simple": "Use short sentences, common words, explain jargon. Like teaching a beginner.",
    "Confident": "Use strong statements, 'will/should', actionable advice. Like an expert sharing proven methods.",
    "Creative": "Use metaphors, storytelling, unique perspectives. Like an artist explaining their process.",
    "Humorous": "Add jokes, self-deprecating humor, relatable observations. Make them laugh while learning.",
    "Emotional": "Focus on feelings, personal connection, vulnerability. Touch their heart.",
  };

  const selectedTone = newTone || "Friendly";
  const toneGuide = toneGuidelines[selectedTone] || toneGuidelines["Friendly"];

  return `${prompt}

🎭 TONE ADJUSTMENT to ${selectedTone.toUpperCase()}:

${toneGuide}

Rewrite key sections with this tone:
- Opening hook
- Main message delivery
- Call-to-action
- Caption text

Example phrases for ${selectedTone} tone:
${getToneExamples(selectedTone)}`;
}

function getToneExamples(tone: string): string {
  const examples: Record<string, string[]> = {
    "Friendly": [
      "Hey friend! Let me show you...",
      "So basically what happened was...",
      "I'm SO excited to share this!",
      "Drop a comment if you've experienced this!"
    ],
    "Professional": [
      "Today I'll demonstrate...",
      "The key insight here is...",
      "Research shows that...",
      "Consider implementing this approach:"
    ],
    "Simple": [
      "Here's what you need to know:",
      "Step 1 is easy:",
      "Think of it like this:",
      "Let me break it down:"
    ],
    "Confident": [
      "This will change everything:",
      "Stop wasting time on [X].",
      "The truth is...",
      "Here's exactly what to do:"
    ],
    "Humorous": [
      "Plot twist: nobody tells you this!",
      "Me: *tries this once* Also me: expert 😂",
      "POV: You just discovered...",
      "Why is this so accurate? 💀"
    ],
  };

  return (examples[tone] || examples["Friendly"]).map(ex => `  • ${ex}`).join("\n");
}

function generateNewHook(prompt: string, category?: string): string {
  const hookTemplates = [
    "🎣 ALTERNATIVE HOOK OPTIONS:\n",
    "1. QUESTION HOOK: 'Did you know that [surprising fact]?'",
    "2. CHALLENGE HOOK: 'Everyone says you can't [X], but I did it in [Y days]'",
    "3. PROBLEM HOOK: 'If you struggle with [X], watch this'",
    "4. BOLD STATEMENT: 'Stop doing [common thing]. Here's why:'",
    "5. POV HOOK: 'POV: You just realized [relatable situation]'",
    "6. SHOCK HOOK: 'This changed everything I thought about [topic]'",
    "7. URGENCY HOOK: 'Do this before it's too late:'",
    "8. CURIOSITY HOOK: 'The secret nobody talks about:'",
    "9. RELATABILITY HOOK: 'If you're tired of [X], this is for you'",
    "10. RESULT HOOK: 'I went from [bad] to [good] in [timeframe]'",
    "\n💡 Test 2-3 hooks and see which performs best!",
  ];

  return prompt + "\n\n" + hookTemplates.join("\n");
}

function addHumor(prompt: string): string {
  return `${prompt}

😂 HUMOR ENHANCEMENT:

Add these comedic elements:

1. SELF-DEPRECATING HUMOR
   - "Me thinking I'm an expert after 1 video: 🤡"
   - "My confidence before vs after trying this"

2. RELATABLE OBSERVATIONS
   - "Why is this so specific yet so accurate?"
   - "Tell me you [X] without telling me you [X]"

3. UNEXPECTED COMPARISONS
   - "This is like [absurd comparison] but make it [your niche]"
   - "Nobody: ... Me: [your topic]"

4. TRENDING HUMOR FORMATS
   - "I'm sorry but [unpopular opinion]"
   - "Hot take: [controversial statement]"
   - "This is your sign to [action]"

5. VISUAL HUMOR
   - Use funny facial expressions
   - Add meme-style text overlays
   - Include reaction clips/green screen

Remember: Humor should enhance, not distract from your message!`;
}

function makeMoreEmotional(prompt: string): string {
  return `${prompt}

💗 EMOTIONAL DEPTH ADDITIONS:

Connect on a deeper level:

1. VULNERABILITY OPENING
   - Share a personal struggle related to this topic
   - "I never thought I'd be the person to..."
   - Be authentic about your journey

2. EMOTIONAL STORYTELLING ELEMENTS
   - Build tension: What was at stake?
   - Show transformation: Before vs after (emotionally)
   - Include a moment of realization
   - End with hope/inspiration

3. RELATABLE PAIN POINTS
   - Acknowledge common struggles
   - "If you've ever felt [emotion]..."
   - Validate their experience

4. MUSIC SELECTION
   - Use emotional, not just trendy sounds
   - Match music to the emotional arc
   - Consider: nostalgic, uplifting, or contemplative

5. VISUAL EMOTIONAL CUES
   - Close-ups for intimate moments
   - Show genuine expressions
   - Use slower pacing for emotional beats

6. POWERFUL ENDING
   - Leave them feeling: inspired, understood, hopeful
   - "You're not alone in this"
   - "This is your reminder that..."

Goal: Make them feel something, not just learn something.`;
}

function addTrendingFormat(prompt: string, platform?: string): string {
  const trendingFormats = [
    "🔥 TRENDING FORMAT OPTIONS:\n",
    "1. 'THINGS NOBODY TELLS YOU ABOUT [topic]' series",
    "2. 'Day in the life as a [niche] creator'",
    "3. 'Unpopular opinion: [controversial take]'",
    "4. 'How to [X] without [common requirement]'",
    "5. 'I tried [topic] for [timeframe] - here's what happened'",
    "6. 'What I wish I knew before starting [topic]'",
    "7. '[Topic] but make it aesthetic'",
    "8. 'Signs you're [relatable characteristic]'",
    "9. 'POV: You just discovered [topic]'",
    "10. 'The [topic] iceberg explained'",
    "\n📱 Platform-Specific:",
  ];

  if (platform?.includes("TikTok")) {
    trendingFormats.push("   • Use duet/stitch features");
    trendingFormats.push("   • Green screen with screenshot");
    trendingFormats.push("   • Text-to-speech narration");
  }

  if (platform?.includes("Reels")) {
    trendingFormats.push("   • Transition-heavy content");
    trendingFormats.push("   • Before/after reveals");
    trendingFormats.push("   • Music-synced cuts");
  }

  return prompt + "\n\n" + trendingFormats.join("\n");
}

// A/B Testing Suggestions
export function generateABTestVariations(basePrompt: string): {
  variantA: string;
  variantB: string;
  whatToTest: string;
}[] {
  return [
    {
      variantA: "Hook: Question format",
      variantB: "Hook: Bold statement format",
      whatToTest: "Which opening style gets more engagement?",
    },
    {
      variantA: "Pacing: Fast cuts (every 2-3s)",
      variantB: "Pacing: Slower, more cinematic",
      whatToTest: "What pacing keeps viewers watching longer?",
    },
    {
      variantA: "CTA: 'Follow for more'",
      variantB: "CTA: 'Comment your experience'",
      whatToTest: "Which drives more engagement?",
    },
    {
      variantA: "Music: Trending upbeat song",
      variantB: "Music: Emotional/storytelling track",
      whatToTest: "How does music choice affect shares?",
    },
  ];
}
