export type ExplanationDepth = 'easy' | 'normal' | 'medium' | 'high' | 'extreme';
export type LanguageTone = 'hinglish' | 'delhi' | 'bihar' | 'english' | 'hindi';

export interface AIPreset {
  code: string;
  name: string;
  title: string;
  badge: string;
  definition: string;
  hinglishDesc: string;
  whatItDoes: string;
  icon: string;
  accentColor: string;
  supports: {
    text: boolean;
    image: boolean;
    file: boolean;
    voice: boolean;
    diagram: boolean;
  };
  promptTemplate: string;
}

export const EXPLANATION_LEVELS: { id: ExplanationDepth; label: string; desc: string; icon: string }[] = [
  { id: 'easy', label: 'EASY', desc: 'Simple words, short answer, everyday familiar example, no jargon.', icon: '🟢' },
  { id: 'normal', label: 'NORMAL', desc: 'Clear school exam level, key points, 1 solid example.', icon: '🟡' },
  { id: 'medium', label: 'MEDIUM', desc: 'Step-by-step detail, key technical terms, practical exam steps.', icon: '🟠' },
  { id: 'high', label: 'HIGH', desc: 'Deep dive, edge cases, formula derivations, structured reasoning.', icon: '🔴' },
  { id: 'extreme', label: 'EXTREME', desc: 'Max depth, comprehensive coverage, diagrams, tables & caveats.', icon: '🟣' }
];

export const TONE_STYLES: { id: LanguageTone; label: string; desc: string }[] = [
  { id: 'hinglish', label: 'Neutral Hinglish', desc: 'Friendly everyday Hindi + English study companion' },
  { id: 'delhi', label: 'Delhi Casual', desc: 'Energetic, bhai-style quick relatable explanation' },
  { id: 'bihar', label: 'Bihar Casual', desc: 'Grounded, respectful, focused exam-oriented approach' },
  { id: 'english', label: 'Clear English', desc: 'Clean, structured academic English' },
  { id: 'hindi', label: 'शुद्ध हिंदी', desc: 'स्पष्ट और प्रामाणिक हिंदी माध्यम शब्दावली' }
];

export const AI_PRESETS: AIPreset[] = [
  {
    code: '01-ELI5',
    name: 'ELI5 / ELI12',
    title: 'Concept Simplification',
    badge: 'SIMPLIFIER',
    definition: 'Explains complex ideas using simple everyday real-world analogies, then links to technical terms.',
    hinglishDesc: 'Mushkil se mushkil topic ko bilkul aasan daily life example ke sath samjhao.',
    whatItDoes: 'Breaks complex JAC Class 10 concepts into crystal clear stories and analogies.',
    icon: '🧸',
    accentColor: 'text-amber-400',
    supports: { text: true, image: true, file: true, voice: true, diagram: false },
    promptTemplate: 'Explain this like I am 12 years old. Use an everyday relatable analogy first, then explain the exact Class 10 JAC terms. Depth: {level}. Tone: {tone}. Question/Topic: {user_input}'
  },
  {
    code: '02-FEYNMAN',
    name: 'Feynman Technique',
    title: 'Deep Concept Mastery',
    badge: 'MASTERY',
    definition: 'Teaches simply without jargon, identifies common misconceptions, and cements understanding.',
    hinglishDesc: 'Topic aise samjhao jaise kisi dost ko padha rahe ho, aur galatiyan clear karo.',
    whatItDoes: 'Identifies why students get confused in this topic and explains it clearly.',
    icon: '💡',
    accentColor: 'text-cyan-400',
    supports: { text: true, image: true, file: true, voice: true, diagram: false },
    promptTemplate: 'Apply the Feynman Technique. Explain simply as if teaching a peer, pinpoint the 2 biggest misconceptions students make, and clear them cleanly. Depth: {level}. Topic: {user_input}'
  },
  {
    code: '03-FIRST-PRINCIPLES',
    name: 'First Principles',
    title: 'Core Fundamental Logic',
    badge: 'LOGIC',
    definition: 'Breaks a topic down into basic proven laws and rebuilds the concept from scratch.',
    hinglishDesc: 'Basic physics/maths ke fundamental rules se step-by-step build karo.',
    whatItDoes: 'Reconstructs scientific and mathematical logic from fundamental axioms.',
    icon: '⚛️',
    accentColor: 'text-emerald-400',
    supports: { text: true, image: true, file: true, voice: false, diagram: true },
    promptTemplate: 'Break down this topic to its fundamental first principles. What are the basic laws that cannot be broken? Build up from there. Depth: {level}. Input: {user_input}'
  },
  {
    code: '04-STEP-BY-STEP',
    name: 'Step-by-Step Solver',
    title: 'Structured Problem Solving',
    badge: 'NUMERICAL',
    definition: 'Provides a clean numbered solution with verification checkpoints and formula citations.',
    hinglishDesc: 'Har ek step ko number daal ke, formula aur calculation ke sath solve karo.',
    whatItDoes: 'Calculates math, physics and chemistry numericals with zero skipped steps.',
    icon: '🔢',
    accentColor: 'text-blue-400',
    supports: { text: true, image: true, file: true, voice: false, diagram: false },
    promptTemplate: 'Solve this strictly step-by-step. Number every step (Step 1, Step 2...), cite formulas used, show all intermediate math, and double check final answer. Depth: {level}. Problem: {user_input}'
  },
  {
    code: '05-TLDR-8020',
    name: 'TL;DR + 80/20 Rule',
    title: 'Speed Revision & Pareto High-Yield',
    badge: 'FAST REVISION',
    definition: 'Summarizes the main point and isolates the 20% high-yield concepts that score 80% marks.',
    hinglishDesc: 'Exam me aane wale top high-yield points aur quick summary turant lo.',
    whatItDoes: 'Pinpoints board exam favorite questions and high-yield summary.',
    icon: '⚡',
    accentColor: 'text-yellow-400',
    supports: { text: true, image: true, file: true, voice: true, diagram: false },
    promptTemplate: 'Give a 2-sentence TL;DR summary, then list the top 20% high-yield concepts in this chapter that carry 80% weightage in Class 10 JAC Board exams. Depth: {level}. Topic: {user_input}'
  },
  {
    code: '06-STEELMAN',
    name: 'Steelman Argument',
    title: 'Critical Thinking & Perspectives',
    badge: 'CRITICAL',
    definition: 'Builds the strongest reasonable counterargument and explains how to defend a scientific view.',
    hinglishDesc: 'Opposing points ko sabse mazboot bana ke samjhao aur analyze karo.',
    whatItDoes: 'Explores debate and assertion-reasoning questions.',
    icon: '🛡️',
    accentColor: 'text-indigo-400',
    supports: { text: true, image: true, file: true, voice: true, diagram: false },
    promptTemplate: 'Construct the strongest counterargument (Steelman) to this point, then explain the definitive scientific consensus with evidence. Depth: {level}. Statement: {user_input}'
  },
  {
    code: '07-AUDIT-THIS',
    name: 'Audit This',
    title: 'Error & Misconception Inspector',
    badge: 'AUDITOR',
    definition: 'Reviews student answers, math calculations, or text for mistakes, omissions, and weak logic.',
    hinglishDesc: 'Apna answer ya calculation bhejo, ye har ek galati dhoondh ke theek karega.',
    whatItDoes: 'Grades handwritten/typed answers and flags missing exam keywords.',
    icon: '🔍',
    accentColor: 'text-rose-400',
    supports: { text: true, image: true, file: true, voice: false, diagram: false },
    promptTemplate: 'Audit the provided student answer or calculation. Flag: (1) Mistakes, (2) Missing board exam keywords, (3) Marks out of 5, (4) Corrected model answer. Input: {user_input}'
  },
  {
    code: '08-SOCRATIC',
    name: 'Socratic Tutor',
    title: 'Active Recall & Guided Inquiry',
    badge: 'TUTOR',
    definition: 'Guides you to the answer with probing questions rather than spoiling the answer directly.',
    hinglishDesc: 'Direct answer dene ke bajaye aapse sawal pooch kar sahi raste par layega.',
    whatItDoes: 'Interactive 1-on-1 question-guided study session.',
    icon: '🏛️',
    accentColor: 'text-purple-400',
    supports: { text: true, image: false, file: false, voice: true, diagram: false },
    promptTemplate: 'Act as a Socratic Teacher. Do NOT give the direct answer immediately. Ask 1 focused leading question to help the student realize the answer themselves. Depth: {level}. Query: {user_input}'
  },
  {
    code: '09-ANALOGY-ENGINE',
    name: 'Analogy Engine',
    title: 'Memory Hooks & Metaphors',
    badge: 'ANALOGY',
    definition: 'Maps an abstract concept to a physical, mechanical, or daily life system.',
    hinglishDesc: 'Topic ko electricity/water pipes, factory ya cricket match se compare karke samjhao.',
    whatItDoes: 'Turns abstract science into unforgettable mental pictures.',
    icon: '🪝',
    accentColor: 'text-teal-400',
    supports: { text: true, image: true, file: true, voice: true, diagram: false },
    promptTemplate: 'Build 2 vivid, highly memorable analogies for this concept (e.g. plumbing, city traffic, factory). Explain where the analogy fits and where it breaks down. Depth: {level}. Topic: {user_input}'
  },
  {
    code: '10-COMPARE-MATRIX',
    name: 'Compare Matrix',
    title: 'Structured Comparison Table',
    badge: 'TABLE',
    definition: 'Builds side-by-side Markdown comparison tables (e.g. Mitosis vs Meiosis, Acid vs Base).',
    hinglishDesc: 'Do cheezon ke beech antar (difference table) exam format me generate karo.',
    whatItDoes: 'Outputs high-scoring board exam tabular differences.',
    icon: '📊',
    accentColor: 'text-sky-400',
    supports: { text: true, image: true, file: true, voice: false, diagram: true },
    promptTemplate: 'Create a clean, 6-parameter Markdown comparison table for the requested topics (Definition, Mechanism, Example, Pros, Cons, Board Exam Key Point). Depth: {level}. Topics: {user_input}'
  },
  {
    code: '11-MERMAID-FLOW',
    name: 'Mermaid Flowchart',
    title: 'Diagram Code Generator',
    badge: 'MERMAID',
    definition: 'Produces valid Mermaid.js syntax for biological cycles, chemical reactions, and process flows.',
    hinglishDesc: 'Processes, food webs aur chemical pathways ka Mermaid flow code generate karo.',
    whatItDoes: 'Renders flowcharts, state diagrams, and mind maps directly.',
    icon: '🔀',
    accentColor: 'text-emerald-400',
    supports: { text: true, image: false, file: false, voice: false, diagram: true },
    promptTemplate: 'Generate clean, valid, copyable Mermaid.js diagram markup (flowchart TD or sequenceDiagram) illustrating this process, followed by a 3-bullet explanation. Process: {user_input}'
  },
  {
    code: '12-ASCII-BLUEPRINT',
    name: 'ASCII Blueprint',
    title: 'Text-Based Diagrams & Schematics',
    badge: 'ASCII',
    definition: 'Draws readable box-and-arrow diagrams using text characters (useful in any terminal or chat).',
    hinglishDesc: 'Bina kisi tool ke chat ke andar hi box aur arrows wala clear text diagram banao.',
    whatItDoes: 'Draws electrical circuits, ray diagrams, and digestive tracks in pure text.',
    icon: '📐',
    accentColor: 'text-amber-300',
    supports: { text: true, image: false, file: false, voice: false, diagram: true },
    promptTemplate: 'Draw an ASCII text-based blueprint schematic diagram showing this system/circuit/process with clear arrows and labels. Explain below. Depth: {level}. System: {user_input}'
  },
  {
    code: '13-SVG-DIAGRAM',
    name: 'SVG Vector Diagram',
    title: 'Direct Vector Graphic Generator',
    badge: 'SVG',
    definition: 'Produces safe, self-contained SVG code with clean labels, gradients, and proper proportions.',
    hinglishDesc: 'High-res scalable vector graphic code generate karo jo bilkul crisp dikhe.',
    whatItDoes: 'Outputs rendered vector graphics for scientific apparatus and geometric figures.',
    icon: '🎨',
    accentColor: 'text-pink-400',
    supports: { text: true, image: false, file: false, voice: false, diagram: true },
    promptTemplate: 'Create clean, standalone, safe SVG markup (viewBox="0 0 600 400") that visually illustrates this concept. No external scripts. Depth: {level}. Topic: {user_input}'
  },
  {
    code: '14-IMAGE-PROMPT-PRO',
    name: 'Image Prompt Pro',
    title: 'Photorealistic Education Prompts',
    badge: 'PROMPT PRO',
    definition: 'Drafts detailed educational Midjourney/DALL-E prompts to visualize scientific phenomena.',
    hinglishDesc: 'Scientific visualization ke liye ultra-detailed AI image prompt taiyaar karo.',
    whatItDoes: 'Creates cinematic 3D renders of microscopic atoms, human cells, and space.',
    icon: '🖼️',
    accentColor: 'text-fuchsia-400',
    supports: { text: true, image: false, file: false, voice: false, diagram: false },
    promptTemplate: 'Create 2 ultra-detailed prompts for Midjourney/DALL-E 3 visualizing this scientific concept in 3D realistic cutaway educational style. Concept: {user_input}'
  },
  {
    code: '15-EXAM-SIMULATOR',
    name: 'Exam Simulator',
    title: 'Class 10 JAC Board Practice Test',
    badge: 'MOCK TEST',
    definition: 'Generates 3 MCQs, 2 Short Answer, and 1 Long Answer question matching latest JAC Board pattern.',
    hinglishDesc: 'Exact board pattern ke mutabik questions, marks distribution aur marking scheme banao.',
    whatItDoes: 'Simulates official board exam question paper sections with marking scheme.',
    icon: '📝',
    accentColor: 'text-red-400',
    supports: { text: true, image: true, file: true, voice: false, diagram: false },
    promptTemplate: 'Act as the Official Class 10 JAC Board Paper Setter. Create: (1) 3 MCQs with options, (2) 2 Short 2-mark questions, (3) 1 Long 5-mark question with marking scheme. Chapter: {user_input}'
  },
  {
    code: '16-MNEMONIC-VAULT',
    name: 'Mnemonic Vault',
    title: 'Memory Acronyms & Rhymes',
    badge: 'MEMORY',
    definition: 'Builds funny, catchy Hinglish acronyms and rhyme stories to remember lists and sequences forever.',
    hinglishDesc: 'Reactivity series, periodic table ya formulas ko yaad rakhne ke fun memory tricks.',
    whatItDoes: 'Creates acronyms and mental stories for permanent recall.',
    icon: '🧠',
    accentColor: 'text-violet-400',
    supports: { text: true, image: true, file: true, voice: true, diagram: false },
    promptTemplate: 'Create 3 catchy, unforgettable Hinglish mnemonics (acronym, funny sentence, and rhyme) to remember this order/list forever. Topic: {user_input}'
  },
  {
    code: '17-CODE-XRAY',
    name: 'Code X-Ray',
    title: 'Programming Logic Trace',
    badge: 'CODE',
    definition: 'Traces code execution with variable tracking tables, time complexity, and potential bugs.',
    hinglishDesc: 'Code ko line-by-line trace karo, variables ki value change hote hue dikhao.',
    whatItDoes: 'Analyzes Python, JS, C++ algorithms and identifies logical traps.',
    icon: '💻',
    accentColor: 'text-emerald-300',
    supports: { text: true, image: false, file: true, voice: false, diagram: false },
    promptTemplate: 'Perform an in-depth Code X-Ray. Provide: (1) Line-by-line dry run table with variable states, (2) Time/Space complexity, (3) Edge case vulnerabilities. Code: {user_input}'
  },
  {
    code: '18-MULTI-PERSPECTIVE',
    name: '360° Multi-Perspective',
    title: 'Multi-Angle Exploration',
    badge: '360 VIEW',
    definition: 'Explains the subject from Beginner, Practical/Engineering, Historical, and Exam Grader viewpoints.',
    hinglishDesc: 'Topic ko 4 alag nazariye se dekho taaki koi bhi doubt na bache.',
    whatItDoes: 'Provides 360-degree holistic depth across humanities and science.',
    icon: '🌐',
    accentColor: 'text-sky-300',
    supports: { text: true, image: true, file: true, voice: true, diagram: false },
    promptTemplate: 'Analyze this topic from 4 distinct lenses: (1) Beginner intuitive, (2) Practical application, (3) Historical origin, (4) JAC Board Examiner perspective. Depth: {level}. Topic: {user_input}'
  },
  {
    code: '19-ANTI-HALLUCINATION',
    name: 'Anti-Hallucination Fact-Check',
    title: 'Evidence-Based Verification',
    badge: 'VERIFIED',
    definition: 'Separates verified NCERT/JAC syllabus facts from assumptions, flags uncertainties strictly.',
    hinglishDesc: 'Sirf wahi batao jo 100% verified hai, doubtful cheezon ko clearly flag karo.',
    whatItDoes: 'Filters fake shortcuts and guarantees syllabus accuracy.',
    icon: '🛡️',
    accentColor: 'text-amber-400',
    supports: { text: true, image: true, file: true, voice: false, diagram: false },
    promptTemplate: 'Apply strict Anti-Hallucination verification. Separate: (1) Verified NCERT/JAC Facts, (2) What is beyond Class 10 syllabus, (3) Crucial caveats. Topic: {user_input}'
  },
  {
    code: '20-MASTER-SYNTHESIS',
    name: 'Master Synthesis',
    title: 'The Ultimate Study Blueprint',
    badge: 'COMPLETE',
    definition: 'Combines summary, analogy, core formulas, ASCII/Mermaid diagram, mistakes, and practice question.',
    hinglishDesc: 'Summary, analogy, formula, diagram aur mock test sab kuch ek hi complete sheet me.',
    whatItDoes: 'Generates an end-to-end master revision cheat sheet for any chapter.',
    icon: '👑',
    accentColor: 'text-amber-300',
    supports: { text: true, image: true, file: true, voice: true, diagram: true },
    promptTemplate: 'Generate the Ultimate Master Study Blueprint for this chapter/topic. Include: (1) 2-sentence Core Concept, (2) Everyday Analogy, (3) Must-Know Formulas & Definitions, (4) Flow Diagram, (5) 3 Trap Mistakes, (6) 1 High-Probable Exam Question. Depth: {level}. Tone: {tone}. Topic: {user_input}'
  }
];

export const STUDY_SUBJECTS = [
  {
    id: 'sci',
    name: 'Science (विज्ञान)',
    icon: '🔬',
    bg: 'from-emerald-950/70 to-teal-950/40',
    border: 'border-emerald-400/40',
    text: 'text-emerald-300',
    chapters: [
      { id: 1, name: 'Chemical Reactions and Equations (रासायनिक अभिक्रियाएँ एवं समीकरण)' },
      { id: 2, name: 'Acids, Bases and Salts (अम्ल, क्षारक एवं लवण)' },
      { id: 3, name: 'Metals and Non-metals (धातु एवं अधातु)' },
      { id: 4, name: 'Carbon and its Compounds (कार्बन एवं उसके यौगिक)' },
      { id: 5, name: 'Life Processes (जैव प्रक्रम)' },
      { id: 6, name: 'Control and Coordination (नियंत्रण एवं समन्वय)' },
      { id: 7, name: 'How do Organisms Reproduce? (जीव जनन कैसे करते हैं?)' },
      { id: 8, name: 'Heredity and Evolution (आनुवंशिकता एवं जैव विकास)' },
      { id: 9, name: 'Light - Reflection and Refraction (प्रकाश - परावर्तन तथा अपवर्तन)' },
      { id: 10, name: 'The Human Eye and Colourful World (मानव नेत्र तथा रंगबिरंगा संसार)' },
      { id: 11, name: 'Electricity (विद्युत)' },
      { id: 12, name: 'Magnetic Effects of Electric Current (विद्युत धारा के चुंबकीय प्रभाव)' },
      { id: 13, name: 'Our Environment (हमारा पर्यावरण)' }
    ]
  },
  {
    id: 'math',
    name: 'Mathematics (गणित)',
    icon: '📐',
    bg: 'from-amber-950/70 to-yellow-950/40',
    border: 'border-amber-400/40',
    text: 'text-amber-300',
    chapters: [
      { id: 1, name: 'Real Numbers (वास्तविक संख्याएँ)' },
      { id: 2, name: 'Polynomials (बहुपद)' },
      { id: 3, name: 'Pair of Linear Equations in Two Variables (दो चर वाले रैखिक समीकरण युग्म)' },
      { id: 4, name: 'Quadratic Equations (द्विघात समीकरण)' },
      { id: 5, name: 'Arithmetic Progressions (समांतर श्रेढ़ियाँ)' },
      { id: 6, name: 'Triangles (त्रिभुज)' },
      { id: 7, name: 'Coordinate Geometry (निर्देशांक ज्यामिति)' },
      { id: 8, name: 'Introduction to Trigonometry (त्रिकोणमिति का परिचय)' },
      { id: 9, name: 'Some Applications of Trigonometry (त्रिकोणमिति के कुछ अनुप्रयोग)' },
      { id: 10, name: 'Circles (वृत्त)' },
      { id: 11, name: 'Areas Related to Circles (वृत्तों से संबंधित क्षेत्रफल)' },
      { id: 12, name: 'Surface Areas and Volumes (पृष्ठीय क्षेत्रफल और आयतन)' },
      { id: 13, name: 'Statistics (सांख्यिकी)' },
      { id: 14, name: 'Probability (प्रायिकता)' }
    ]
  },
  {
    id: 'sst',
    name: 'Social Science (सामाजिक विज्ञान)',
    icon: '🌍',
    bg: 'from-blue-950/70 to-indigo-950/40',
    border: 'border-blue-400/40',
    text: 'text-blue-300',
    chapters: [
      { id: 1, name: 'The Rise of Nationalism in Europe (यूरोप में राष्ट्रवाद का उदय)' },
      { id: 2, name: 'Nationalism in India (भारत में राष्ट्रवाद)' },
      { id: 3, name: 'Resources and Development (संसाधन एवं विकास)' },
      { id: 4, name: 'Forest and Wildlife Resources (वन एवं वन्यजीव संसाधन)' },
      { id: 5, name: 'Water Resources (जल संसाधन)' },
      { id: 6, name: 'Agriculture (कृषि)' },
      { id: 7, name: 'Power Sharing (सत्ता की साझेदारी)' },
      { id: 8, name: 'Federalism (संघवाद)' },
      { id: 9, name: 'Development (विकास)' },
      { id: 10, name: 'Sectors of the Indian Economy (भारतीय अर्थव्यवस्था के क्षेत्रक)' }
    ]
  },
  {
    id: 'eng',
    name: 'English (अंग्रेजी)',
    icon: '📖',
    bg: 'from-purple-950/70 to-violet-950/40',
    border: 'border-purple-400/40',
    text: 'text-purple-300',
    chapters: [
      { id: 1, name: 'A Letter to God' },
      { id: 2, name: 'Nelson Mandela: Long Walk to Freedom' },
      { id: 3, name: 'Two Stories about Flying' },
      { id: 4, name: 'From the Diary of Anne Frank' },
      { id: 5, name: 'Glimpses of India' },
      { id: 6, name: 'A Triumph of Surgery' },
      { id: 7, name: 'The Thief\'s Story' },
      { id: 8, name: 'The Midnight Visitor' }
    ]
  },
  {
    id: 'hin',
    name: 'Hindi (हिंदी)',
    icon: '✍️',
    bg: 'from-rose-950/70 to-orange-950/40',
    border: 'border-rose-400/40',
    text: 'text-rose-300',
    chapters: [
      { id: 1, name: 'सूरदास के पद' },
      { id: 2, name: 'राम-लक्ष्मण-परशुराम संवाद' },
      { id: 3, name: 'उत्साह और अट नहीं रही है' },
      { id: 4, name: 'यह दंतुरित मुस्कान और फसल' },
      { id: 5, name: 'नेताजी का चश्मा' },
      { id: 6, name: 'बालगोबिन भगत' },
      { id: 7, name: 'लखनवी अंदाज़' }
    ]
  }
];
