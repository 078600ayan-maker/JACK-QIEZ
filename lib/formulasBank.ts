export interface BoardFormulaItem {
  id: string;
  category: 'Math' | 'Science' | 'Hindi & English Tips';
  chapter: string;
  title: string;
  formula: string;
  tip: string;
  highYield?: boolean;
}

export const JAC_CLASS_10_FORMULAS: BoardFormulaItem[] = [
  // --- MATHEMATICS (1-20) ---
  {
    id: 'm_01',
    category: 'Math',
    chapter: 'Real Numbers',
    title: 'Euclid Division & LCM-HCF Relation',
    formula: 'HCF(a, b) × LCM(a, b) = a × b',
    tip: 'Board Question: If HCF is given, find LCM directly by dividing product of numbers by HCF.',
    highYield: true
  },
  {
    id: 'm_02',
    category: 'Math',
    chapter: 'Polynomials',
    title: 'Relationship Between Zeroes & Coefficients',
    formula: 'α + β = -b/a  |  αβ = c/a',
    tip: 'Quadratic Polynomial: p(x) = k[x² - (α + β)x + αβ].',
    highYield: true
  },
  {
    id: 'm_03',
    category: 'Math',
    chapter: 'Linear Equations',
    title: 'Consistency & Graphical Conditions',
    formula: 'a1/a2 ≠ b1/b2 (Unique) | a1/a2 = b1/b2 = c1/c2 (Infinitely Many) | a1/a2 = b1/b2 ≠ c1/c2 (No Solution)',
    tip: 'Intersecting lines = Consistent. Parallel lines = Inconsistent.',
    highYield: true
  },
  {
    id: 'm_04',
    category: 'Math',
    chapter: 'Quadratic Equations',
    title: 'Discriminant & Quadratic Formula (Shreedharacharya)',
    formula: 'D = b² - 4ac  |  x = (-b ± √D) / 2a',
    tip: 'If D > 0 (Two distinct real roots), D = 0 (Two equal real roots -b/2a), D < 0 (No real roots).',
    highYield: true
  },
  {
    id: 'm_05',
    category: 'Math',
    chapter: 'Arithmetic Progression',
    title: 'nth Term of an AP',
    formula: 'an = a + (n - 1)d',
    tip: 'Common difference d = a2 - a1 = ak - a(k-1). Can be negative or zero.',
    highYield: true
  },
  {
    id: 'm_06',
    category: 'Math',
    chapter: 'Arithmetic Progression',
    title: 'Sum of First n Terms of an AP',
    formula: 'Sn = n/2 [2a + (n - 1)d]  or  Sn = n/2 [a + l]',
    tip: 'If l is the last term, use n/2(a + l) for fastest calculation in MCQ.',
    highYield: true
  },
  {
    id: 'm_07',
    category: 'Math',
    chapter: 'Coordinate Geometry',
    title: 'Distance Formula',
    formula: 'd = √[(x2 - x1)² + (y2 - y1)²]',
    tip: 'Distance from origin (0, 0) to point (x, y) is simply √(x² + y²).',
    highYield: true
  },
  {
    id: 'm_08',
    category: 'Math',
    chapter: 'Coordinate Geometry',
    title: 'Section Formula (Internal Division)',
    formula: 'P(x, y) = [ (m1·x2 + m2·x1)/(m1 + m2), (m1·y2 + m2·y1)/(m1 + m2) ]',
    tip: 'Midpoint formula when ratio is 1:1: M = [(x1 + x2)/2, (y1 + y2)/2].',
    highYield: true
  },
  {
    id: 'm_09',
    category: 'Math',
    chapter: 'Trigonometry',
    title: 'Fundamental Trigonometric Identities',
    formula: 'sin²θ + cos²θ = 1  |  1 + tan²θ = sec²θ  |  1 + cot²θ = cosec²θ',
    tip: 'Crucial for 5-mark board proofs. Rewrite tan/cot/sec/cosec in terms of sin and cos.',
    highYield: true
  },
  {
    id: 'm_10',
    category: 'Math',
    chapter: 'Trigonometry',
    title: 'Standard Angle Values Table (0°, 30°, 45°, 60°, 90°)',
    formula: 'sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2, tan 45° = 1, tan 60° = √3',
    tip: 'Remember: tan 90° and cot 0° are undefined (Not defined).',
    highYield: true
  },
  {
    id: 'm_11',
    category: 'Math',
    chapter: 'Applications of Trigonometry',
    title: 'Heights & Distances',
    formula: 'tan θ = Opposite (Height) / Adjacent (Distance)',
    tip: 'Angle of Elevation is measured looking UP; Angle of Depression looking DOWN. Always draw right triangle first.',
    highYield: true
  },
  {
    id: 'm_12',
    category: 'Math',
    chapter: 'Circles',
    title: 'Tangents from an External Point',
    formula: 'Length of PA = Length of PB  |  Radius ⊥ Tangent at point of contact',
    tip: 'OP is the angle bisector of ∠APB and ∠AOB.',
    highYield: true
  },
  {
    id: 'm_13',
    category: 'Math',
    chapter: 'Areas Related to Circles',
    title: 'Sector Area & Arc Length',
    formula: 'Area of Sector = (θ/360°) × πr²  |  Length of Arc = (θ/360°) × 2πr',
    tip: 'Area of Segment = Area of Sector - Area of corresponding triangle.',
    highYield: true
  },
  {
    id: 'm_14',
    category: 'Math',
    chapter: 'Surface Areas & Volumes',
    title: 'Right Circular Cylinder',
    formula: 'CSA = 2πrh  |  TSA = 2πr(r + h)  |  Volume = πr²h',
    tip: 'When a solid is melted and recast, its VOLUME remains constant.',
    highYield: true
  },
  {
    id: 'm_15',
    category: 'Math',
    chapter: 'Surface Areas & Volumes',
    title: 'Right Circular Cone',
    formula: 'Slant Height l = √(r² + h²)  |  CSA = πrl  |  Volume = (1/3)πr²h',
    tip: 'Cone volume is exactly 1/3 of a cylinder having same base radius and height.',
    highYield: true
  },
  {
    id: 'm_16',
    category: 'Math',
    chapter: 'Surface Areas & Volumes',
    title: 'Sphere & Hemisphere',
    formula: 'Sphere Vol = (4/3)πr³, TSA = 4πr²  |  Hemisphere TSA = 3πr², Vol = (2/3)πr³',
    tip: 'Watch out: Hemisphere TSA includes flat circular base (2πr² + πr² = 3πr²).',
    highYield: true
  },
  {
    id: 'm_17',
    category: 'Math',
    chapter: 'Statistics',
    title: 'Mean (Direct & Assumed Mean Methods)',
    formula: 'Direct: x̄ = Σ(fi·xi) / Σfi  |  Assumed: x̄ = a + [Σ(fi·di) / Σfi]',
    tip: 'Class mark xi = (Upper Limit + Lower Limit) / 2.',
    highYield: true
  },
  {
    id: 'm_18',
    category: 'Math',
    chapter: 'Statistics',
    title: 'Mode of Grouped Data',
    formula: 'Mode = l + [ (f1 - f0) / (2f1 - f0 - f2) ] × h',
    tip: 'f1 = frequency of modal class, f0 = preceding class, f2 = succeeding class.',
    highYield: true
  },
  {
    id: 'm_19',
    category: 'Math',
    chapter: 'Statistics',
    title: 'Median & Empirical Relationship',
    formula: 'Median = l + [ (n/2 - cf) / f ] × h  |  3 Median = Mode + 2 Mean',
    tip: 'Empirical formula is tested in 100% of JAC board objective questions.',
    highYield: true
  },
  {
    id: 'm_20',
    category: 'Math',
    chapter: 'Probability',
    title: 'Classical Probability & Certainty',
    formula: 'P(E) = (Favorable Outcomes) / (Total Outcomes)  |  0 ≤ P(E) ≤ 1  |  P(E) + P(not E) = 1',
    tip: 'Probability of sure event is 1; impossible event is 0.',
    highYield: true
  },

  // --- SCIENCE (21-40) ---
  {
    id: 's_01',
    category: 'Science',
    chapter: 'Electricity',
    title: 'Ohm’s Law & Electric Current',
    formula: 'V = I × R  |  I = Q / t  (1 Ampere = 1 Coulomb / 1 Second)',
    tip: 'Temperature must remain constant. Slope of V-I graph gives resistance R.',
    highYield: true
  },
  {
    id: 's_02',
    category: 'Science',
    chapter: 'Electricity',
    title: 'Resistance & Resistivity Factor',
    formula: 'R = ρ × (L / A)',
    tip: 'Doubling wire length doubles resistance; doubling area halves resistance.',
    highYield: true
  },
  {
    id: 's_03',
    category: 'Science',
    chapter: 'Electricity',
    title: 'Resistors in Series & Parallel',
    formula: 'Series: Req = R1 + R2 + R3  |  Parallel: 1/Req = 1/R1 + 1/R2 + 1/R3',
    tip: 'Series: Current is same, voltage divides. Parallel: Voltage same, current divides.',
    highYield: true
  },
  {
    id: 's_04',
    category: 'Science',
    chapter: 'Electricity',
    title: 'Joule’s Law of Heating & Electric Power',
    formula: 'H = I²Rt  |  P = V·I = I²R = V² / R  |  1 kWh = 3.6 × 10⁶ Joules',
    tip: '1 Board unit of commercial electricity = 1 kilowatt-hour (kWh).',
    highYield: true
  },
  {
    id: 's_05',
    category: 'Science',
    chapter: 'Light - Reflection & Refraction',
    title: 'Mirror Formula & Magnification',
    formula: '1/f = 1/v + 1/u  |  m = -v/u = h\'/h  |  f = R/2',
    tip: 'Sign Convention: u is ALWAYS negative. Concave mirror f is negative; convex f is positive.',
    highYield: true
  },
  {
    id: 's_06',
    category: 'Science',
    chapter: 'Light - Reflection & Refraction',
    title: 'Lens Formula & Power of Lens',
    formula: '1/f = 1/v - 1/u  |  m = +v/u = h\'/h  |  P = 1 / f(in meters)',
    tip: 'Unit of Power is Dioptre (D). Convex lens has +P; Concave lens has -P.',
    highYield: true
  },
  {
    id: 's_07',
    category: 'Science',
    chapter: 'Light - Reflection & Refraction',
    title: 'Snell’s Law of Refraction & Refractive Index',
    formula: 'n21 = sin i / sin r = v1 / v2  |  n = c / v',
    tip: 'Light travels fastest in vacuum (3 × 10⁸ m/s). Diamond has highest refractive index (2.42).',
    highYield: true
  },
  {
    id: 's_08',
    category: 'Science',
    chapter: 'Human Eye & Colourful World',
    title: 'Eye Defects & Corrective Lenses',
    formula: 'Myopia (Near-sighted) -> Concave Lens  |  Hypermetropia (Far-sighted) -> Convex Lens',
    tip: 'Presbyopia in elderly is corrected by Bifocal lenses (upper concave, lower convex).',
    highYield: true
  },
  {
    id: 's_09',
    category: 'Science',
    chapter: 'Chemical Reactions & Equations',
    title: 'Balancing Chemical Equations & Law of Conservation of Mass',
    formula: 'Mass of Reactants = Mass of Products  (Atoms of each element remain equal)',
    tip: 'Always balance atoms with largest number first (usually oxygen or hydrogen).',
    highYield: true
  },
  {
    id: 's_10',
    category: 'Science',
    chapter: 'Chemical Reactions & Equations',
    title: 'Types of Reactions',
    formula: 'Combination (A+B->AB), Decomposition (AB->A+B), Displacement (A+BC->AC+B), Double Displacement',
    tip: 'Rusting of iron and respiration are exothermic redox reactions.',
    highYield: true
  },
  {
    id: 's_11',
    category: 'Science',
    chapter: 'Acids, Bases and Salts',
    title: 'pH Scale & Neutralization',
    formula: 'Acid + Base -> Salt + Water  |  pH < 7 (Acidic), pH = 7 (Neutral), pH > 7 (Basic)',
    tip: 'Human blood pH is strictly 7.35 - 7.45. Acid rain has pH < 5.6.',
    highYield: true
  },
  {
    id: 's_12',
    category: 'Science',
    chapter: 'Acids, Bases and Salts',
    title: 'Key Chemical Formulas of Salts',
    formula: 'Bleaching Powder: CaOCl₂ | Baking Soda: NaHCO₃ | Washing Soda: Na₂CO₃·10H₂O | Plaster of Paris: CaSO₄·½H₂O',
    tip: 'POP reacts with water to form hard gypsum (CaSO₄·2H₂O).',
    highYield: true
  },
  {
    id: 's_13',
    category: 'Science',
    chapter: 'Metals and Non-Metals',
    title: 'Reactivity Series of Metals',
    formula: 'K > Na > Ca > Mg > Al > Zn > Fe > Pb > [H] > Cu > Hg > Ag > Au',
    tip: 'Metals above Hydrogen liberate H₂ gas with dilute HCl/H₂SO₄.',
    highYield: true
  },
  {
    id: 's_14',
    category: 'Science',
    chapter: 'Carbon and its Compounds',
    title: 'Homologous Series General Formulas',
    formula: 'Alkanes: CnH2n+2  |  Alkenes: CnH2n  |  Alkynes: CnH2n-2',
    tip: 'Consecutive members differ by a -CH₂- unit and 14u molecular mass.',
    highYield: true
  },
  {
    id: 's_15',
    category: 'Science',
    chapter: 'Carbon and its Compounds',
    title: 'Saponification & Esterification',
    formula: 'Carboxylic Acid + Alcohol --(Acid)--> Ester (Sweet Fruity Smell) + Water',
    tip: 'Alkaline hydrolysis of ester with NaOH yields soap (Saponification).',
    highYield: true
  },
  {
    id: 's_16',
    category: 'Science',
    chapter: 'Life Processes',
    title: 'Photosynthesis Overall Equation',
    formula: '6CO₂ + 12H₂O --(Sunlight / Chlorophyll)--> C₆H₁₂O₆ + 6O₂ + 6H₂O',
    tip: 'Oxygen released during photosynthesis originates from WATER (H₂O), not carbon dioxide.',
    highYield: true
  },
  {
    id: 's_17',
    category: 'Science',
    chapter: 'Life Processes',
    title: 'Breakdown of Glucose by Various Pathways',
    formula: 'Aerobic (Mitochondria) -> CO₂ + H₂O + 38 ATP | Anaerobic in Muscle -> Lactic Acid + 2 ATP',
    tip: 'Accumulation of Lactic Acid in muscles causes sudden cramps during heavy exercise.',
    highYield: true
  },
  {
    id: 's_18',
    category: 'Science',
    chapter: 'Heredity',
    title: 'Mendel’s Monohybrid & Dihybrid Cross Ratios',
    formula: 'Monohybrid F2: Phenotypic = 3:1, Genotypic = 1:2:1  |  Dihybrid F2 Phenotypic = 9:3:3:1',
    tip: 'Father determines the sex of the child (passes either X or Y chromosome).',
    highYield: true
  },
  {
    id: 's_19',
    category: 'Science',
    chapter: 'Magnetic Effects of Electric Current',
    title: 'Fleming’s Left-Hand & Right-Hand Rules',
    formula: 'Left-Hand (Electric Motor): Thumb=Force, Forefinger=Magnetic Field, Center Finger=Current',
    tip: 'Right-Hand Thumb Rule gives the direction of concentric magnetic field lines around a straight wire.',
    highYield: true
  },
  {
    id: 's_20',
    category: 'Science',
    chapter: 'Our Environment',
    title: '10% Law of Energy Transfer (Lindeman)',
    formula: 'Energy at Trophic Level (N) = 10% of Energy at Level (N - 1)',
    tip: 'Biological magnification of harmful pesticides is highest at top carnivore level.',
    highYield: true
  },

  // --- HINDI & ENGLISH EXAM WRITING TIPS (41-50) ---
  {
    id: 'tip_01',
    category: 'Hindi & English Tips',
    chapter: 'Hindi Kshitij & Vyakaran',
    title: 'पत्र लेखन (Formal & Informal Letter Format)',
    formula: 'प्रेषक का पता -> दिनांक -> सेवा में (पद/पता) -> विषय -> महोदय -> मुख्य भाग -> धन्यवाद -> भवदीय/नाम',
    tip: 'विषय (Subject) को केवल एक पंक्ति में संक्षिप्त और रेखांकित (underline) करके लिखें।',
    highYield: true
  },
  {
    id: 'tip_02',
    category: 'Hindi & English Tips',
    chapter: 'Hindi Vyakaran',
    title: 'समास के 6 भेद और पहचान ट्रिक',
    formula: 'अव्ययीभाव (पहला पद अव्यय) | तत्पुरुष (कारक विभक्ति लोप) | कर्मधारय (विशेषण-विशेष्य) | द्विगु (संख्यावाची) | द्वंद्व (और/योजक) | बहुव्रीहि (अन्य पद प्रधान)',
    tip: 'दशानन = दस आनन हैं जिसके अर्थात रावण (बहुव्रीहि समास)।',
    highYield: true
  },
  {
    id: 'tip_03',
    category: 'Hindi & English Tips',
    chapter: 'Hindi Vyakaran',
    title: 'वाक्य रूपांतरण नियम (सरल, संयुक्त, मिश्र)',
    formula: 'सरल: 1 उद्देश्य + 1 विधेय | संयुक्त: दो स्वतंत्र वाक्य (और, परंतु, इसलिए) | मिश्र: प्रधान + आश्रित (जो, क्योंकि, जब-तब)',
    tip: 'बोर्ड में सरल से मिश्र वाक्य बनाने का 2 अंक का सवाल 100% आता है।',
    highYield: true
  },
  {
    id: 'tip_04',
    category: 'Hindi & English Tips',
    chapter: 'Hindi Writing Skills',
    title: 'निबंध व अनुच्छेद लेखन में पूरे 5 अंक की ट्रिक',
    formula: 'प्रस्तावना/भूमिका -> मुख्य विचार (3 उपशीर्षक) -> लाभ/हानि/समाधान -> उपसंहार',
    tip: 'निबंध की शुरुआत किसी प्रासंगिक कविता की पंक्ति या सुविचार से करने पर परीक्षक पूरे अंक देता है।',
    highYield: true
  },
  {
    id: 'tip_05',
    category: 'Hindi & English Tips',
    chapter: 'English Writing Skills',
    title: 'Formal Letter to Editor Format',
    formula: 'Sender Address -> Date -> The Editor, Newspaper -> Subject -> Sir/Madam -> Body (3 paras) -> Yours faithfully',
    tip: 'Standard opening line: "Through the columns of your esteemed newspaper, I wish to draw the attention..."',
    highYield: true
  },
  {
    id: 'tip_06',
    category: 'Hindi & English Tips',
    chapter: 'English Writing Skills',
    title: 'Analytical Paragraph Format',
    formula: 'Introduction (rephrase title) -> Data Analysis (trends, comparisons, contrasts) -> Concluding summary',
    tip: 'Use linking words: "In contrast to", "Significant rise", "Whereas", "Approximately". Never give personal opinion.',
    highYield: true
  },
  {
    id: 'tip_07',
    category: 'Hindi & English Tips',
    chapter: 'English Grammar',
    title: 'Subject-Verb Concord Golden Rules',
    formula: 'Either/Neither of + Plural Noun -> Singular Verb | Along with / As well as -> Follows First Subject',
    tip: 'Example: "The teacher, along with the students, WAS present." (Singular verb).',
    highYield: true
  },
  {
    id: 'tip_08',
    category: 'Hindi & English Tips',
    chapter: 'English Grammar',
    title: 'Reported Speech (Direct to Indirect)',
    formula: 'Simple Present -> Simple Past | Present Perfect -> Past Perfect | Will -> Would | Now -> Then | Today -> That day',
    tip: 'Universal truths and scientific facts DO NOT change tense in indirect speech.',
    highYield: true
  },
  {
    id: 'tip_09',
    category: 'Hindi & English Tips',
    chapter: 'General Board Presentation',
    title: '5-Mark Subjective Answers Formatting',
    formula: 'Point-wise presentation + Underline scientific keywords + Draw neat pencil diagrams with labelled parts',
    tip: 'Never write continuous long paragraphs in Science or SST; break into 5 distinct numbered points.',
    highYield: true
  },
  {
    id: 'tip_10',
    category: 'Hindi & English Tips',
    chapter: 'General Board Presentation',
    title: 'Time Management in 3-Hour JAC Board Exam',
    formula: 'First 15 min: Question paper analysis -> Next 45 min: MCQs (Sec A) -> 75 min: Short answers -> 30 min: Long answers -> 15 min: Revision',
    tip: 'Tie supplement sheets securely with thread and check question numbers match serial exactly.',
    highYield: true
  }
];
