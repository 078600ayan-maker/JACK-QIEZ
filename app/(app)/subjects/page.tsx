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
  // 1. MATHEMATICS (14 Chapters)
  {
    id: 'math',
    title: 'Mathematics',
    hindiTitle: 'गणित',
    classTag: 'Class 10 NCERT • 14 Chapters',
    totalChapters: 14,
    bookSvg: '/images/subjects/math_ncert.jpg',
    themeColor: '#3B82F6',
    parts: [
      {
        id: 'math_algebra',
        title: 'Number Systems & Algebra',
        hindiTitle: 'संख्या पद्धति व बीजगणित',
        totalChapters: 5,
        completedChapters: 5,
        iconPath: '/images/subjects/math.jpg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'Real Numbers', hindiTitle: 'वास्तविक संख्याएँ' },
          { num: 2, id: 'ch_02', title: 'Polynomials', hindiTitle: 'बहुपद' },
          { num: 3, id: 'ch_03', title: 'Pair of Linear Equations in Two Variables', hindiTitle: 'दो चरों वाले रैखिक समीकरण युग्म' },
          { num: 4, id: 'ch_04', title: 'Quadratic Equations', hindiTitle: 'द्विघात समीकरण' },
          { num: 5, id: 'ch_05', title: 'Arithmetic Progressions', hindiTitle: 'समांतर श्रेढ़ियाँ' }
        ]
      },
      {
        id: 'math_geometry',
        title: 'Geometry & Trigonometry',
        hindiTitle: 'ज्यामिति व त्रिकोणमिति',
        totalChapters: 5,
        completedChapters: 4,
        iconPath: '/images/subjects/math.jpg',
        chapters: [
          { num: 6, id: 'ch_06', title: 'Triangles', hindiTitle: 'त्रिभुज' },
          { num: 7, id: 'ch_07', title: 'Coordinate Geometry', hindiTitle: 'निर्देशांक ज्यामिती' },
          { num: 8, id: 'ch_08', title: 'Introduction to Trigonometry', hindiTitle: 'त्रिकोणमिति का परिचय' },
          { num: 9, id: 'ch_09', title: 'Some Applications of Trigonometry', hindiTitle: 'त्रिकोणमिति के कुछ अनुप्रयोग' },
          { num: 10, id: 'ch_10', title: 'Circles', hindiTitle: 'वृत्त' }
        ]
      },
      {
        id: 'math_mensuration',
        title: 'Mensuration, Statistics & Probability',
        hindiTitle: 'क्षेत्रमिति, सांख्यिकी व प्रायिकता',
        totalChapters: 4,
        completedChapters: 4,
        iconPath: '/images/subjects/math.jpg',
        chapters: [
          { num: 11, id: 'ch_11', title: 'Areas Related to Circles', hindiTitle: 'वृत्तों से संबंधित क्षेत्रफल' },
          { num: 12, id: 'ch_12', title: 'Surface Areas and Volumes', hindiTitle: 'पृष्ठीय क्षेत्रफल और आयतन' },
          { num: 13, id: 'ch_13', title: 'Statistics', hindiTitle: 'सांख्यिकी' },
          { num: 14, id: 'ch_14', title: 'Probability', hindiTitle: 'प्रायिकता' }
        ]
      }
    ]
  },

  // 2. SCIENCE (13 Chapters)
  {
    id: 'science',
    title: 'Science',
    hindiTitle: 'विज्ञान',
    classTag: 'Class 10 NCERT • 13 Chapters',
    totalChapters: 13,
    bookSvg: '/images/subjects/science_ncert.jpg',
    themeColor: '#10B981',
    parts: [
      {
        id: 'sci_chem',
        title: 'Chemistry',
        hindiTitle: 'रसायन विज्ञान',
        totalChapters: 4,
        completedChapters: 4,
        iconPath: '/images/subjects/science.jpg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'Chemical Reactions and Equations', hindiTitle: 'रासायनिक अभिक्रियाएँ एवं समीकरण' },
          { num: 2, id: 'ch_02', title: 'Acids, Bases and Salts', hindiTitle: 'अम्ल, क्षारक एवं लवण' },
          { num: 3, id: 'ch_03', title: 'Metals and Non-metals', hindiTitle: 'धातु एवं अधातु' },
          { num: 4, id: 'ch_04', title: 'Carbon and its Compounds', hindiTitle: 'कार्बन एवं उसके यौगिक' }
        ]
      },
      {
        id: 'sci_bio',
        title: 'Biology & Ecology',
        hindiTitle: 'जीव विज्ञान व पर्यावरण',
        totalChapters: 5,
        completedChapters: 5,
        iconPath: '/images/subjects/science.jpg',
        chapters: [
          { num: 5, id: 'ch_05', title: 'Life Processes', hindiTitle: 'जैव प्रक्रम' },
          { num: 6, id: 'ch_06', title: 'Control and Coordination', hindiTitle: 'नियंत्रण एवं समन्वय' },
          { num: 7, id: 'ch_07', title: 'How do Organisms Reproduce?', hindiTitle: 'जीव जनन कैसे करते हैं?' },
          { num: 8, id: 'ch_08', title: 'Heredity', hindiTitle: 'आनुवंशिकता' },
          { num: 13, id: 'ch_13', title: 'Our Environment', hindiTitle: 'हमारा पर्यावरण' }
        ]
      },
      {
        id: 'sci_physics',
        title: 'Physics',
        hindiTitle: 'भौतिकी',
        totalChapters: 4,
        completedChapters: 4,
        iconPath: '/images/subjects/science.jpg',
        chapters: [
          { num: 9, id: 'ch_09', title: 'Light – Reflection and Refraction', hindiTitle: 'प्रकाश – परावर्तन तथा अपवर्तन' },
          { num: 10, id: 'ch_10', title: 'The Human Eye and Colourful World', hindiTitle: 'मानव नेत्र तथा रंगबिरंगा संसार' },
          { num: 11, id: 'ch_11', title: 'Electricity', hindiTitle: 'विद्युत' },
          { num: 12, id: 'ch_12', title: 'Magnetic Effects of Electric Current', hindiTitle: 'विद्युत धारा के चुंबकीय प्रभाव' }
        ]
      }
    ]
  },

  // 3. ENGLISH (14 Chapters: First Flight & Footprints Without Feet)
  {
    id: 'english',
    title: 'English',
    hindiTitle: 'अंग्रेज़ी',
    classTag: 'Class 10 NCERT • 14 Units',
    totalChapters: 14,
    bookSvg: '/images/subjects/english.jpg',
    themeColor: '#06B6D4',
    parts: [
      {
        id: 'eng_first_flight',
        title: 'First Flight',
        hindiTitle: 'मुख्य पाठ्यपुस्तक',
        totalChapters: 9,
        completedChapters: 7,
        iconPath: '/images/subjects/english_first_flight.jpg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'A Letter to God (Dust of Snow & Fire and Ice)', hindiTitle: 'भगवान के नाम पत्र' },
          { num: 2, id: 'ch_02', title: 'Nelson Mandela: Long Walk to Freedom', hindiTitle: 'नेल्सन मंडेला: आज़ादी की लंबी यात्रा' },
          { num: 3, id: 'ch_03', title: 'Two Stories about Flying (His First Flight & Black Aeroplane)', hindiTitle: 'उड़ान की दो कहानियाँ' },
          { num: 4, id: 'ch_04', title: 'From the Diary of Anne Frank', hindiTitle: 'ऐनी फ्रैंक की डायरी से' },
          { num: 5, id: 'ch_05', title: 'Glimpses of India (Baker from Goa, Coorg, Tea from Assam)', hindiTitle: 'भारत की झलकियाँ' },
          { num: 6, id: 'ch_06', title: 'Mijbil the Otter', hindiTitle: 'मिजबिल ऊदबिलाव' },
          { num: 7, id: 'ch_07', title: 'Madam Rides the Bus', hindiTitle: 'मैडम ने की बस की सवारी' },
          { num: 8, id: 'ch_08', title: 'The Sermon at Benares', hindiTitle: 'बनारस में बुद्ध का उपदेश' },
          { num: 9, id: 'ch_09', title: 'The Proposal', hindiTitle: 'विवाह का प्रस्ताव (एकांकी)' }
        ]
      },
      {
        id: 'eng_footprints',
        title: 'Footprints Without Feet',
        hindiTitle: 'पूरक पाठ्यपुस्तक',
        totalChapters: 5,
        completedChapters: 4,
        iconPath: '/images/subjects/english_footprints.jpg',
        chapters: [
          { num: 10, id: 'ch_10', title: 'A Triumph of Surgery & The Thief’s Story', hindiTitle: 'शल्य चिकित्सा की विजय व चोर की कहानी' },
          { num: 11, id: 'ch_11', title: 'The Midnight Visitor & A Question of Trust', hindiTitle: 'आधी रात का आगंतुक व विश्वास का प्रश्न' },
          { num: 12, id: 'ch_12', title: 'Footprints Without Feet & The Making of a Scientist', hindiTitle: 'पैरों के निशान बिना पैर व एक वैज्ञानिक का बनना' },
          { num: 13, id: 'ch_13', title: 'The Necklace & Bholi', hindiTitle: 'हार (नेकलेस) व भोली' },
          { num: 14, id: 'ch_14', title: 'The Book That Saved the Earth & English Grammar/Writing', hindiTitle: 'वह पुस्तक जिसने पृथ्वी को बचाया व व्याकरण/लेखन' }
        ]
      }
    ]
  },

  // 4. SOCIAL SCIENCE (SST) (14 Complete Chapters: History, Geography, Civics, Economics)
  {
    id: 'sst',
    title: 'Social Science',
    hindiTitle: 'सामाजिक विज्ञान',
    classTag: 'Class 10 NCERT • 14 Chapters',
    totalChapters: 14,
    bookSvg: '/images/subjects/sst.jpg',
    themeColor: '#F59E0B',
    parts: [
      {
        id: 'sst_history',
        title: 'History',
        hindiTitle: 'इतिहास (भारत और समकालीन विश्व II)',
        totalChapters: 4,
        completedChapters: 3,
        iconPath: '/images/subjects/sst_history.jpg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'The Rise of Nationalism in Europe', hindiTitle: 'यूरोप में राष्ट्रवाद का उदय' },
          { num: 2, id: 'ch_02', title: 'Nationalism in India', hindiTitle: 'भारत में राष्ट्रवाद' },
          { num: 3, id: 'ch_03', title: 'The Making of a Global World', hindiTitle: 'भूमंडलीकृत विश्व का बनना' },
          { num: 4, id: 'ch_04', title: 'Print Culture and the Modern World', hindiTitle: 'मुद्रण संस्कृति और आधुनिक दुनिया' }
        ]
      },
      {
        id: 'sst_geography',
        title: 'Geography',
        hindiTitle: 'भूगोल (समकालीन भारत II)',
        totalChapters: 4,
        completedChapters: 4,
        iconPath: '/images/subjects/sst_geography.jpg',
        chapters: [
          { num: 5, id: 'ch_05', title: 'Resources and Development', hindiTitle: 'संसाधन एवं विकास' },
          { num: 6, id: 'ch_06', title: 'Forest, Wildlife & Water Resources', hindiTitle: 'वन, वन्यजीव एवं जल संसाधन' },
          { num: 7, id: 'ch_07', title: 'Agriculture', hindiTitle: 'कृषि' },
          { num: 8, id: 'ch_08', title: 'Minerals, Energy & Manufacturing Industries', hindiTitle: 'खनिज, ऊर्जा एवं विनिर्माण उद्योग' }
        ]
      },
      {
        id: 'sst_civics',
        title: 'Civics',
        hindiTitle: 'नागरिक शास्त्र (लोकतांत्रिक राजनीति II)',
        totalChapters: 3,
        completedChapters: 3,
        iconPath: '/images/subjects/sst_politics.jpg',
        chapters: [
          { num: 9, id: 'ch_09', title: 'Power Sharing & Federalism', hindiTitle: 'सत्ता की साझेदारी एवं संघवाद' },
          { num: 10, id: 'ch_10', title: 'Gender, Religion and Caste', hindiTitle: 'जाति, धर्म और लैंगिक मसले' },
          { num: 11, id: 'ch_11', title: 'Political Parties & Outcomes of Democracy', hindiTitle: 'राजनीतिक दल एवं लोकतंत्र के परिणाम' }
        ]
      },
      {
        id: 'sst_economics',
        title: 'Economics',
        hindiTitle: 'अर्थशास्त्र (आर्थिक विकास की समझ)',
        totalChapters: 3,
        completedChapters: 3,
        iconPath: '/images/subjects/sst_economics.jpg',
        chapters: [
          { num: 12, id: 'ch_12', title: 'Development & Sectors of the Indian Economy', hindiTitle: 'विकास एवं भारतीय अर्थव्यवस्था के क्षेत्रक' },
          { num: 13, id: 'ch_13', title: 'Money and Credit', hindiTitle: 'मुद्रा और साख' },
          { num: 14, id: 'ch_14', title: 'Globalisation and the Indian Economy', hindiTitle: 'वैश्वीकरण और भारतीय अर्थव्यवस्था' }
        ]
      }
    ]
  },

  // 5. HINDI (Course A) (14 Chapters: Kshitij & Kritika)
  {
    id: 'hindi',
    title: 'Hindi (Course A)',
    hindiTitle: 'हिंदी (कोर्स ए)',
    classTag: 'Class 10 NCERT • 14 Chapters',
    totalChapters: 14,
    bookSvg: '/images/subjects/hindi.jpg',
    themeColor: '#EC4899',
    parts: [
      {
        id: 'hin_kavya',
        title: 'Kshitij (Kavya Khand)',
        hindiTitle: 'क्षितिज (काव्य खंड)',
        totalChapters: 6,
        completedChapters: 5,
        iconPath: '/images/subjects/hindi_kshitij.jpg',
        chapters: [
          { num: 1, id: 'ch_01', title: 'सूरदास के पद', hindiTitle: 'सूरदास के पद' },
          { num: 2, id: 'ch_02', title: 'राम-लक्ष्मण-परशुराम संवाद', hindiTitle: 'राम-लक्ष्मण-परशुराम संवाद (तुलसीदास)' },
          { num: 3, id: 'ch_03', title: 'आत्मकथ्य', hindiTitle: 'आत्मकथ्य (जयशंकर प्रसाद)' },
          { num: 4, id: 'ch_04', title: 'उत्साह और अट नहीं रही है', hindiTitle: 'उत्साह और अट नहीं रही है (निराला)' },
          { num: 5, id: 'ch_05', title: 'यह दंतुरित मुस्कान और फसल', hindiTitle: 'यह दंतुरित मुस्कान और फसल (नागार्जुन)' },
          { num: 6, id: 'ch_06', title: 'संगतकार', hindiTitle: 'संगतकार (मंगलेश डबराल)' }
        ]
      },
      {
        id: 'hin_gadya',
        title: 'Kshitij & Kritika (Gadya Khand)',
        hindiTitle: 'क्षितिज व कृतिका (गद्य खंड)',
        totalChapters: 8,
        completedChapters: 6,
        iconPath: '/images/subjects/hindi_kritika.jpg',
        chapters: [
          { num: 7, id: 'ch_07', title: 'नेताजी का चश्मा', hindiTitle: 'नेताजी का चश्मा (स्वयं प्रकाश)' },
          { num: 8, id: 'ch_08', title: 'बालगोबिन भगत', hindiTitle: 'बालगोबिन भगत (रामवृक्ष बेनीपुरी)' },
          { num: 9, id: 'ch_09', title: 'लखनवी अंदाज़', hindiTitle: 'लखनवी अंदाज़ (यशपाल)' },
          { num: 10, id: 'ch_10', title: 'एक कहानी यह भी', hindiTitle: 'एक कहानी यह भी (मन्नू भंडारी)' },
          { num: 11, id: 'ch_11', title: 'नौबतखाने में इबादत', hindiTitle: 'नौबतखाने में इबादत (यतींद्र मिश्र)' },
          { num: 12, id: 'ch_12', title: 'संस्कृति', hindiTitle: 'संस्कृति (भदंत आनंद कौसल्यायन)' },
          { num: 13, id: 'ch_13', title: 'माता का अंचल', hindiTitle: 'माता का अंचल (शिवपूजन सहाय)' },
          { num: 14, id: 'ch_14', title: 'साना-साना हाथ जोड़ि और मैं क्यों लिखता हूँ', hindiTitle: 'साना-साना हाथ जोड़ि व मैं क्यों लिखता हूँ' }
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
    <div className="w-full max-w-[480px] mx-auto px-4 pt-3 pb-44 select-none">
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
              <div className="relative w-5 h-5 rounded-md overflow-hidden bg-black/40 border border-amber-400/40">
                <Image
                  src={profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png'}
                  alt="Avatar Head"
                  fill
                  unoptimized
                  className="object-cover"
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
                  className="rounded-3xl p-4 bg-[rgba(15,23,42,0.85)] backdrop-blur-2xl border border-white/10 hover:border-amber-400/40 shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    {/* 3D Geometry / Book Icon Widget */}
                    <div className="relative w-16 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5)] bg-black/60">
                      <Image
                        src={part.iconPath}
                        alt={part.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {/* Sub-Category Title & Progress */}
                    <div className="flex-1 min-w-0 pr-1">
                      <h3 className="text-sm font-black text-white leading-snug">
                        {part.title}
                      </h3>
                      <p className="text-xs font-semibold text-amber-300/90 mt-0.5">
                        ({part.hindiTitle})
                      </p>
                      <div className="mt-1 text-[11px] font-bold text-emerald-400">
                        {part.completedChapters}/{part.totalChapters} chapters done
                      </div>
                    </div>
                  </div>

                  {/* Online Cloud Sync Status Badge */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-300">Online Cloud Sync Active</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Live multiplayer & instant cloud save
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-black text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>ONLINE</span>
                    </div>
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

                    {/* Expanded Chapter List (Entire Row is Clickable) */}
                    {isExpanded && (
                      <div className="mt-2 space-y-2 pt-1">
                        {part.chapters.map(ch => (
                          <div
                            key={ch.id}
                            onClick={() => handleStartChapterQuiz(selectedSubject.id, ch.id)}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer active:scale-[0.99]"
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartChapterQuiz(selectedSubject.id, ch.id);
                              }}
                              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black text-[11px] font-black shrink-0 active:scale-95 transition-all cursor-pointer shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
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
                  src={profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png'}
                  alt="Avatar"
                  fill
                  unoptimized
                  className="object-cover rounded-md"
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

          {/* 5 Core Subject Cards (Royal Titanium Glassmorphic & Full-Card Clickable) */}
          <div className="space-y-3">
            {DEEP_SUBJECTS.map(sub => (
              <div
                key={sub.id}
                onClick={() => {
                  playBookFlip();
                  setSelectedSubject(sub);
                }}
                className="relative rounded-3xl p-4 bg-[rgba(15,23,42,0.85)] backdrop-blur-2xl border border-white/10 hover:border-amber-400/50 shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3.5 transition-all cursor-pointer active:scale-[0.98]"
              >
                {/* Authentic NCERT Book Cover Badge + Subject Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5)] bg-black/60">
                    <Image
                      src={sub.bookSvg}
                      alt={sub.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white leading-tight truncate">
                      {sub.title}
                    </h3>
                    <p className="text-xs font-semibold text-amber-300/90 mt-0.5">
                      {sub.hindiTitle}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 mt-1">
                      {sub.totalChapters} Chapters • {sub.classTag}
                    </p>
                  </div>
                </div>

                {/* Royal "Start learning ->" Pill Button */}
                <div className="flex items-center gap-1.5 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-[0_4px_0_#B45309,0_0_15px_rgba(245,158,11,0.4)] transition-all shrink-0">
                  <span>Start learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
