'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  Lock,
  Layers
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import {
  playClickSound,
  playToggleSwitch,
  playBookFlip,
  playOfflineCacheSuccess
} from '@/lib/audioEngine';
import { BilingualLanguageToggle } from '@/components/ui/BilingualLanguageToggle';
import { FloatingStudyCompanion } from '@/components/mascot/FloatingStudyCompanion';

// Subject Definition with Deep Sub-Categories
export interface SubCategory {
  id: string;
  title: string;
  hindiTitle: string;
  totalChapters: number;
  completedChapters: number;
  iconPath: string;
  chapters: Array<{ num: number; id: string; title: string; hindiTitle: string }>;
}

export interface SubjectData {
  id: string;
  title: string;
  hindiTitle: string;
  classTag: string;
  totalChapters: number;
  bookSvg: string;
  themeColor: string;
  parts: SubCategory[];
}

export const DEEP_SUBJECTS: SubjectData[] = [
  // 1. MATHEMATICS (3 parts) - Matches Screenshot 1
  {
    id: 'math',
    title: 'Mathematics',
    hindiTitle: 'गणित',
    classTag: 'Class 10 NCERT',
    totalChapters: 14,
    bookSvg: '/subjects/math.svg',
    themeColor: '#3B82F6',
    parts: [
      {
        id: 'math_algebra',
        title: 'Number Systems & Algebra',
        hindiTitle: 'संख्या पद्धति व बीजगणित',
        totalChapters: 5,
        completedChapters: 4,
        iconPath: '/subjects/math.svg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'Real Numbers', hindiTitle: 'वास्तविक संख्याएँ' },
          { num: 2, id: 'ch_02', title: 'Polynomials', hindiTitle: 'बहुपद' },
          { num: 3, id: 'ch_03', title: 'Linear Equations in Two Variables', hindiTitle: 'दो चर वाले रैखिक समीकरण युग्म' },
          { num: 4, id: 'ch_04', title: 'Quadratic Equations', hindiTitle: 'द्विघात समीकरण' },
          { num: 5, id: 'ch_05', title: 'Arithmetic Progressions', hindiTitle: 'समांतर श्रेढ़ियाँ' }
        ]
      },
      {
        id: 'math_geometry',
        title: 'Geometry & Trigonometry',
        hindiTitle: 'ज्यामिति व त्रिकोणमिति',
        totalChapters: 5,
        completedChapters: 3,
        iconPath: '/subjects/math.svg',
        chapters: [
          { num: 6, id: 'ch_06', title: 'Triangles', hindiTitle: 'त्रिभुज' },
          { num: 7, id: 'ch_07', title: 'Coordinate Geometry', hindiTitle: 'निर्देशांक ज्यामिति' },
          { num: 8, id: 'ch_08', title: 'Introduction to Trigonometry', hindiTitle: 'त्रिकोणमिति का परिचय' },
          { num: 9, id: 'ch_09', title: 'Applications of Trigonometry', hindiTitle: 'त्रिकोणमिति के कुछ अनुप्रयोग' },
          { num: 10, id: 'ch_10', title: 'Circles', hindiTitle: 'वृत्त' }
        ]
      },
      {
        id: 'math_mensuration',
        title: 'Mensuration, Statistics & Probability',
        hindiTitle: 'क्षेत्रमिति व सांख्यिकी',
        totalChapters: 4,
        completedChapters: 3,
        iconPath: '/subjects/math.svg',
        chapters: [
          { num: 11, id: 'ch_11', title: 'Areas Related to Circles', hindiTitle: 'वृत्तों से संबंधित क्षेत्रफल' },
          { num: 12, id: 'ch_12', title: 'Surface Areas and Volumes', hindiTitle: 'पृष्ठीय क्षेत्रफल और आयतन' },
          { num: 13, id: 'ch_13', title: 'Statistics', hindiTitle: 'सांख्यिकी' },
          { num: 14, id: 'ch_14', title: 'Probability', hindiTitle: 'प्रायिकता' }
        ]
      }
    ]
  },

  // 2. SCIENCE (3 parts: Physics, Chemistry, Biology)
  {
    id: 'science',
    title: 'Science',
    hindiTitle: 'विज्ञान',
    classTag: 'Class 10 NCERT',
    totalChapters: 13,
    bookSvg: '/subjects/science.svg',
    themeColor: '#10B981',
    parts: [
      {
        id: 'sci_chem',
        title: 'Chemistry',
        hindiTitle: 'रसायन विज्ञान',
        totalChapters: 5,
        completedChapters: 5,
        iconPath: '/subjects/science.svg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'Chemical Reactions and Equations', hindiTitle: 'रासायनिक अभिक्रियाएँ एवं समीकरण' },
          { num: 2, id: 'ch_02', title: 'Acids, Bases and Salts', hindiTitle: 'अम्ल, क्षारक एवं लवण' },
          { num: 3, id: 'ch_03', title: 'Metals and Non-metals', hindiTitle: 'धातु एवं अधातु' },
          { num: 4, id: 'ch_04', title: 'Carbon and its Compounds', hindiTitle: 'कार्बन एवं उसके यौगिक' },
          { num: 5, id: 'ch_05', title: 'Periodic Classification of Elements', hindiTitle: 'तत्वों का आवर्त वर्गीकरण' }
        ]
      },
      {
        id: 'sci_bio',
        title: 'Biology',
        hindiTitle: 'जीव विज्ञान',
        totalChapters: 4,
        completedChapters: 3,
        iconPath: '/subjects/science.svg',
        chapters: [
          { num: 6, id: 'ch_06', title: 'Life Processes', hindiTitle: 'जैव प्रक्रम' },
          { num: 7, id: 'ch_07', title: 'Control and Coordination', hindiTitle: 'नियंत्रण एवं समन्वय' },
          { num: 8, id: 'ch_08', title: 'How do Organisms Reproduce?', hindiTitle: 'जीव जनन कैसे करते हैं?' },
          { num: 9, id: 'ch_09', title: 'Heredity and Evolution', hindiTitle: 'आनुवंशिकता एवं जैव विकास' }
        ]
      },
      {
        id: 'sci_physics',
        title: 'Physics',
        hindiTitle: 'भौतिकी',
        totalChapters: 4,
        completedChapters: 3,
        iconPath: '/subjects/science.svg',
        chapters: [
          { num: 10, id: 'ch_10', title: 'Light - Reflection and Refraction', hindiTitle: 'प्रकाश - परावर्तन तथा अपवर्तन' },
          { num: 11, id: 'ch_11', title: 'The Human Eye and Colourful World', hindiTitle: 'मानव नेत्र तथा रंगबिरंगा संसार' },
          { num: 12, id: 'ch_12', title: 'Electricity', hindiTitle: 'विद्युत' },
          { num: 13, id: 'ch_13', title: 'Magnetic Effects of Electric Current', hindiTitle: 'विद्युत धारा के चुंबकीय प्रभाव' }
        ]
      }
    ]
  },

  // 3. ENGLISH (2 parts: First Flight, Footprints Without Feet)
  {
    id: 'english',
    title: 'English',
    hindiTitle: 'अंग्रेज़ी',
    classTag: 'Class 10 NCERT',
    totalChapters: 11,
    bookSvg: '/subjects/english.svg',
    themeColor: '#F59E0B',
    parts: [
      {
        id: 'eng_first_flight',
        title: 'First Flight',
        hindiTitle: 'मुख्य पाठ्यपुस्तक',
        totalChapters: 6,
        completedChapters: 4,
        iconPath: '/subjects/english.svg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'A Letter to God', hindiTitle: 'भगवान के नाम पत्र' },
          { num: 2, id: 'ch_02', title: 'Nelson Mandela: Long Walk to Freedom', hindiTitle: 'नेल्सन मंडेला: आज़ादी की लंबी यात्रा' },
          { num: 3, id: 'ch_03', title: 'Two Stories about Flying', hindiTitle: 'उड़ान की दो कहानियाँ' },
          { num: 4, id: 'ch_04', title: 'From the Diary of Anne Frank', hindiTitle: 'ऐनी फ्रैंक की डायरी से' },
          { num: 5, id: 'ch_05', title: 'Glimpses of India', hindiTitle: 'भारत की झलकियाँ' },
          { num: 6, id: 'ch_06', title: 'Madam Rides the Bus', hindiTitle: 'मैडम ने की बस की सवारी' }
        ]
      },
      {
        id: 'eng_footprints',
        title: 'Footprints Without Feet',
        hindiTitle: 'पूरक पाठ्यपुस्तक',
        totalChapters: 5,
        completedChapters: 3,
        iconPath: '/subjects/english.svg',
        chapters: [
          { num: 7, id: 'ch_07', title: 'A Triumph of Surgery', hindiTitle: 'शल्य चिकित्सा की जीत' },
          { num: 8, id: 'ch_08', title: 'The Thief\'s Story', hindiTitle: 'चोर की कहानी' },
          { num: 9, id: 'ch_09', title: 'The Midnight Visitor', hindiTitle: 'आधी रात का आगंतुक' },
          { num: 10, id: 'ch_10', title: 'A Question of Trust', hindiTitle: 'विश्वास का प्रश्न' },
          { num: 11, id: 'ch_11', title: 'Footprints Without Feet', hindiTitle: 'पैरों के निशान बिना पैर' }
        ]
      }
    ]
  },

  // 4. SOCIAL SCIENCE (SST) (4 parts: History, Geography, Civics, Economics)
  {
    id: 'sst',
    title: 'Social Science',
    hindiTitle: 'सामाजिक विज्ञान',
    classTag: 'Class 10 NCERT',
    totalChapters: 11,
    bookSvg: '/subjects/sst.svg',
    themeColor: '#F43F5E',
    parts: [
      {
        id: 'sst_history',
        title: 'History',
        hindiTitle: 'इतिहास (भारत और समकालीन विश्व II)',
        totalChapters: 3,
        completedChapters: 2,
        iconPath: '/subjects/sst.svg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'The Rise of Nationalism in Europe', hindiTitle: 'यूरोप में राष्ट्रवाद का उदय' },
          { num: 2, id: 'ch_02', title: 'Nationalism in India', hindiTitle: 'भारत में राष्ट्रवाद' },
          { num: 3, id: 'ch_03', title: 'The Making of a Global World', hindiTitle: 'भूमंडलीकृत विश्व का बनना' }
        ]
      },
      {
        id: 'sst_geography',
        title: 'Geography',
        hindiTitle: 'भूगोल (समकालीन भारत II)',
        totalChapters: 3,
        completedChapters: 3,
        iconPath: '/subjects/sst.svg',
        chapters: [
          { num: 4, id: 'ch_04', title: 'Resources and Development', hindiTitle: 'संसाधन एवं विकास' },
          { num: 5, id: 'ch_05', title: 'Forest and Wildlife Resources', hindiTitle: 'वन एवं वन्य जीव संसाधन' },
          { num: 6, id: 'ch_06', title: 'Water Resources & Agriculture', hindiTitle: 'जल संसाधन एवं कृषि' }
        ]
      },
      {
        id: 'sst_civics',
        title: 'Civics',
        hindiTitle: 'नागरिक शास्त्र (लोकतांत्रिक राजनीति II)',
        totalChapters: 3,
        completedChapters: 2,
        iconPath: '/subjects/sst.svg',
        chapters: [
          { num: 7, id: 'ch_07', title: 'Power Sharing', hindiTitle: 'सत्ता की साझेदारी' },
          { num: 8, id: 'ch_08', title: 'Federalism', hindiTitle: 'संघवाद' },
          { num: 9, id: 'ch_09', title: 'Gender, Religion and Caste', hindiTitle: 'जाति, धर्म और लैंगिक मसले' }
        ]
      },
      {
        id: 'sst_economics',
        title: 'Economics',
        hindiTitle: 'अर्थशास्त्र (आर्थिक विकास की समझ)',
        totalChapters: 2,
        completedChapters: 2,
        iconPath: '/subjects/sst.svg',
        chapters: [
          { num: 10, id: 'ch_10', title: 'Development', hindiTitle: 'विकास' },
          { num: 11, id: 'ch_11', title: 'Sectors of the Indian Economy', hindiTitle: 'भारतीय अर्थव्यवस्था के क्षेत्रक' }
        ]
      }
    ]
  },

  // 5. HINDI (Course A) (2 parts: Kshitij, Kritika)
  {
    id: 'hindi',
    title: 'Hindi (Course A)',
    hindiTitle: 'हिंदी (कोर्स ए)',
    classTag: 'Class 10 NCERT',
    totalChapters: 8,
    bookSvg: '/subjects/hindi.svg',
    themeColor: '#A855F7',
    parts: [
      {
        id: 'hin_kshitij',
        title: 'Kshitij',
        hindiTitle: 'क्षितिज भाग 2',
        totalChapters: 5,
        completedChapters: 4,
        iconPath: '/subjects/hindi.svg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'Surdas - Pad', hindiTitle: 'सूरदास - पद' },
          { num: 2, id: 'ch_02', title: 'Ram-Lakshman-Parshuram Samvad', hindiTitle: 'राम-लक्ष्मण-परशुराम संवाद' },
          { num: 3, id: 'ch_03', title: 'Utsah & At Nahi Rahi', hindiTitle: 'उत्साह और अट नहीं रही' },
          { num: 4, id: 'ch_04', title: 'Netaji Ka Chashma', hindiTitle: 'नेताजी का चश्मा' },
          { num: 5, id: 'ch_05', title: 'Balgobin Bhagat', hindiTitle: 'बालगोबिन भगत' }
        ]
      },
      {
        id: 'hin_kritika',
        title: 'Kritika',
        hindiTitle: 'कृतिका भाग 2',
        totalChapters: 3,
        completedChapters: 2,
        iconPath: '/subjects/hindi.svg',
        chapters: [
          { num: 6, id: 'ch_06', title: 'Mata Ka Aanchal', hindiTitle: 'माता का आँचल' },
          { num: 7, id: 'ch_07', title: 'George Pancham Ki Naak', hindiTitle: 'जॉर्ज पंचम की नाक' },
          { num: 8, id: 'ch_08', title: 'Sana-Sana Hath Jodi', hindiTitle: 'साना-साना हाथ जोड़ि...' }
        ]
      }
    ]
  }
];

export default function SubjectsPage() {
  const router = useRouter();
  const { profile, setActiveSubjectId } = useUserStore();
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [offlineToggles, setOfflineToggles] = useState<Record<string, boolean>>({
    math_algebra: true,
    math_geometry: true,
    math_mensuration: true,
    sci_chem: true,
    sci_bio: true,
    sci_physics: true
  });
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({
    math_algebra: true,
    sci_chem: true
  });

  const streakDays = profile?.streak || 7;
  const avatarPreset = profile?.customAvatar?.preset || 'steve';

  const handleToggleOffline = (partId: string) => {
    playToggleSwitch();
    setOfflineToggles(prev => {
      const next = !prev[partId];
      if (next) playOfflineCacheSuccess();
      return { ...prev, [partId]: next };
    });
  };

  const handleToggleAccordion = (partId: string) => {
    playClickSound();
    setExpandedParts(prev => ({ ...prev, [partId]: !prev[partId] }));
  };

  const handleStartChapterQuiz = (subjectId: string, chId: string) => {
    playClickSound();
    setActiveSubjectId(subjectId === 'science' ? 'sci' : subjectId);
    router.push(`/quiz/${subjectId === 'science' ? 'sci' : subjectId}/${chId}/1`);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-3 pb-28 select-none">
      {/* =========================================================================
          VIEW MODE 1: SUB-CATEGORIES DETAIL SCREEN (Matches Screenshot 1)
          ========================================================================= */}
      {selectedSubject ? (
        <div className="space-y-4 animate-fade-in">
          {/* Top Bar with Back Arrow + Subject Title + Status Pill */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                playClickSound();
                setSelectedSubject(null);
              }}
              className="flex items-center gap-1.5 py-1 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Subjects</span>
            </button>

            {/* "Ready for chapter 4?" Badge Pill from Screenshot 1 */}
            <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-amber-500/10 border border-amber-500/30">
              <span className="text-[11px] font-bold text-amber-300">
                Ready for chapter 4?
              </span>
              <div className="w-5 h-5 rounded-md overflow-hidden bg-black/40">
                <Image
                  src={`/avatars/${avatarPreset}.svg`}
                  alt="Avatar Head"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <div className="pb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {selectedSubject.title}
            </h1>
            <p className="text-xs text-slate-400">
              {selectedSubject.hindiTitle} • {selectedSubject.totalChapters} Chapters • Class 10 NCERT
            </p>
          </div>

          {/* Sub-Category Cards Container (Matching Screenshot 1 Layout) */}
          <div className="space-y-3.5">
            {selectedSubject.parts.map(part => {
              const isExpanded = expandedParts[part.id];
              const isOffline = !!offlineToggles[part.id];

              return (
                <div
                  key={part.id}
                  className="rounded-3xl p-4 bg-gradient-to-b from-[#181310] via-[#120D0A] to-[#0A0706] border border-[#78350F]/60 shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex items-start gap-3.5">
                    {/* 3D Geometry / Book Icon Widget */}
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-black/60">
                      <Image
                        src={part.iconPath}
                        alt={part.title}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Sub-Category Title & Progress */}
                    <div className="flex-1 min-w-0 pr-1">
                      <h3 className="text-sm font-black text-white leading-snug">
                        {part.title}
                      </h3>
                      <p className="text-xs font-semibold text-amber-200/80 mt-0.5">
                        ({part.hindiTitle})
                      </p>
                      <div className="mt-1 text-[11px] font-bold text-[#F97316]">
                        {part.completedChapters}/{part.totalChapters} chapters done
                      </div>
                    </div>
                  </div>

                  {/* Download Offline Toggle Switch Row (Exact replica of Screenshot 1) */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-amber-900/30">
                    <div>
                      <div className="text-xs font-black text-white">
                        Download offline
                      </div>
                      <div className="text-[10px] text-amber-600/90 font-medium">
                        Download data offline (pre-bundled)
                      </div>
                    </div>

                    {/* Neon Orange Toggle Switch */}
                    <button
                      onClick={() => handleToggleOffline(part.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer p-0.5 ${
                        isOffline ? 'bg-[#EA580C]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-slate-950 transition-transform duration-200 ease-in-out ${
                          isOffline ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Chapters Drill-down Accordion Toggle */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleToggleAccordion(part.id)}
                      className="w-full flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-black text-amber-300 transition-all cursor-pointer"
                    >
                      <span>
                        {isExpanded ? 'Hide Chapter List' : `View ${part.chapters.length} Chapters`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {/* Expanded Chapter List */}
                    {isExpanded && (
                      <div className="mt-2 space-y-2 pt-1">
                        {part.chapters.map(ch => (
                          <div
                            key={ch.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-all"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-[10px] font-mono font-bold text-amber-400 block">
                                Chapter {ch.num}
                              </span>
                              <h5 className="text-xs font-bold text-white truncate">
                                {ch.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate">
                                {ch.hindiTitle}
                              </p>
                            </div>

                            <button
                              onClick={() => handleStartChapterQuiz(selectedSubject.id, ch.id)}
                              className="py-1 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black shrink-0 active:scale-95 transition-all cursor-pointer shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
                            >
                              Start Quiz →
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* =========================================================================
           VIEW MODE 2: MAIN SUBJECTS SCREEN (Matches Screenshot 2)
           ========================================================================= */
        <div className="space-y-3.5">
          {/* Header Title & Bilingual Selector */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Subjects
            </h1>
            <BilingualLanguageToggle size="sm" />
          </div>

          {/* Streak Banner Pill with 3D Avatar Robot (From Screenshot 2) */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-orange-950/40 border border-orange-500/40 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-black/40 border border-amber-400/40 p-0.5">
                <Image
                  src={`/avatars/${avatarPreset}.svg`}
                  alt="Avatar"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-black text-amber-200 truncate">
                Choose a subject to keep your {streakDays}-day streak!
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span className="text-xs font-black text-amber-300">{streakDays}</span>
            </div>
          </div>

          {/* 5 Core Subject Cards (Exact replica of Screenshot 2) */}
          <div className="space-y-3">
            {DEEP_SUBJECTS.map(sub => (
              <div
                key={sub.id}
                className="relative rounded-3xl p-4 bg-gradient-to-b from-[#181310] via-[#120D0A] to-[#0A0706] border border-[#78350F]/60 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 hover:border-amber-500/50 transition-all"
              >
                {/* 3D Book Icon + Subject Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-[0_0_12px_rgba(0,0,0,0.4)] bg-black/60">
                    <Image
                      src={sub.bookSvg}
                      alt={sub.title}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white leading-tight truncate">
                      {sub.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-amber-600/90 mt-0.5">
                      {sub.totalChapters} Chapters • {sub.classTag}
                    </p>
                  </div>
                </div>

                {/* Orange "Start learning ->" Pill Button (From Screenshot 2) */}
                <button
                  onClick={() => {
                    playBookFlip();
                    setSelectedSubject(sub);
                  }}
                  className="flex items-center gap-1.5 py-2.5 px-4 rounded-2xl bg-[#EA580C] hover:bg-[#F97316] text-white font-black text-xs shadow-[0_4px_0_#9A3412,0_0_15px_rgba(234,88,12,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#9A3412] transition-all cursor-pointer shrink-0"
                >
                  <span>Start learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Interactive Study Companion Robot from Screenshot 1 & 2 */}
      <FloatingStudyCompanion
        customMessage={
          selectedSubject
            ? `Ready to conquer ${selectedSubject.title}?`
            : `Choose a subject to keep your ${streakDays}-day streak!`
        }
      />
    </div>
  );
}
