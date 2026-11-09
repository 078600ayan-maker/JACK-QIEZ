/**
 * Central Master Syllabus for Class 10 NCERT / JAC Board (100% Complete)
 * Used across:
 * 1. Subjects Screen (DEEP_SUBJECTS)
 * 2. Notes & Practice Questions Modal (StudyResourceModal)
 * 3. Admin Content Service (adminContentService)
 * 4. Chapter-Locked Live Voice Viva Call (LiveCallModal)
 */

export interface MasterChapter {
  id: string;
  num: number;
  title: string;
  hindiTitle: string;
  subCategory?: string;
  subCategoryHindi?: string;
}

export interface MasterSubject {
  id: string;
  title: string;
  hindiTitle: string;
  classTag: string;
  themeColor: string;
  icon: string;
  bookSvg: string;
  chapters: MasterChapter[];
}

export const CLASS_10_MASTER_SYLLABUS: MasterSubject[] = [
  // ==========================================
  // 1. SCIENCE / विज्ञान (All 13 Complete Chapters)
  // ==========================================
  {
    id: 'sci',
    title: 'Science',
    hindiTitle: 'विज्ञान',
    classTag: 'Class 10 NCERT • 13 Chapters',
    themeColor: '#10B981',
    icon: '🔬',
    bookSvg: '/images/subjects/science_ncert.jpg',
    chapters: [
      {
        id: 'ch_01',
        num: 1,
        title: 'Chemical Reactions and Equations',
        hindiTitle: 'रासायनिक अभिक्रियाएँ एवं समीकरण',
        subCategory: 'Chemistry',
        subCategoryHindi: 'रसायन विज्ञान'
      },
      {
        id: 'ch_02',
        num: 2,
        title: 'Acids, Bases and Salts',
        hindiTitle: 'अम्ल, क्षारक एवं लवण',
        subCategory: 'Chemistry',
        subCategoryHindi: 'रसायन विज्ञान'
      },
      {
        id: 'ch_03',
        num: 3,
        title: 'Metals and Non-metals',
        hindiTitle: 'धातु एवं अधातु',
        subCategory: 'Chemistry',
        subCategoryHindi: 'रसायन विज्ञान'
      },
      {
        id: 'ch_04',
        num: 4,
        title: 'Carbon and its Compounds',
        hindiTitle: 'कार्बन एवं उसके यौगिक',
        subCategory: 'Chemistry',
        subCategoryHindi: 'रसायन विज्ञान'
      },
      {
        id: 'ch_05',
        num: 5,
        title: 'Life Processes',
        hindiTitle: 'जैव प्रक्रम',
        subCategory: 'Biology',
        subCategoryHindi: 'जीव विज्ञान'
      },
      {
        id: 'ch_06',
        num: 6,
        title: 'Control and Coordination',
        hindiTitle: 'नियंत्रण एवं समन्वय',
        subCategory: 'Biology',
        subCategoryHindi: 'जीव विज्ञान'
      },
      {
        id: 'ch_07',
        num: 7,
        title: 'How do Organisms Reproduce?',
        hindiTitle: 'जीव जनन कैसे करते हैं?',
        subCategory: 'Biology',
        subCategoryHindi: 'जीव विज्ञान'
      },
      {
        id: 'ch_08',
        num: 8,
        title: 'Heredity',
        hindiTitle: 'आनुवंशिकता',
        subCategory: 'Biology',
        subCategoryHindi: 'जीव विज्ञान'
      },
      {
        id: 'ch_09',
        num: 9,
        title: 'Light – Reflection and Refraction',
        hindiTitle: 'प्रकाश – परावर्तन तथा अपवर्तन',
        subCategory: 'Physics',
        subCategoryHindi: 'भौतिकी'
      },
      {
        id: 'ch_10',
        num: 10,
        title: 'The Human Eye and the Colourful World',
        hindiTitle: 'मानव नेत्र तथा रंगबिरंगा संसार',
        subCategory: 'Physics',
        subCategoryHindi: 'भौतिकी'
      },
      {
        id: 'ch_11',
        num: 11,
        title: 'Electricity',
        hindiTitle: 'विद्युत',
        subCategory: 'Physics',
        subCategoryHindi: 'भौतिकी'
      },
      {
        id: 'ch_12',
        num: 12,
        title: 'Magnetic Effects of Electric Current',
        hindiTitle: 'विद्युत धारा के चुंबकीय प्रभाव',
        subCategory: 'Physics',
        subCategoryHindi: 'भौतिकी'
      },
      {
        id: 'ch_13',
        num: 13,
        title: 'Our Environment',
        hindiTitle: 'हमारा पर्यावरण',
        subCategory: 'Biology & Ecology',
        subCategoryHindi: 'पर्यावरण एवं पारिस्थितिकी'
      }
    ]
  },

  // ==========================================
  // 2. MATHEMATICS / गणित (All 14 Complete Chapters)
  // ==========================================
  {
    id: 'math',
    title: 'Mathematics',
    hindiTitle: 'गणित',
    classTag: 'Class 10 NCERT • 14 Chapters',
    themeColor: '#3B82F6',
    icon: '📐',
    bookSvg: '/images/subjects/math_ncert.jpg',
    chapters: [
      {
        id: 'ch_01',
        num: 1,
        title: 'Real Numbers',
        hindiTitle: 'वास्तविक संख्याएँ',
        subCategory: 'Number Systems',
        subCategoryHindi: 'संख्या पद्धति'
      },
      {
        id: 'ch_02',
        num: 2,
        title: 'Polynomials',
        hindiTitle: 'बहुपद',
        subCategory: 'Algebra',
        subCategoryHindi: 'बीजगणित'
      },
      {
        id: 'ch_03',
        num: 3,
        title: 'Pair of Linear Equations in Two Variables',
        hindiTitle: 'दो चरों वाले रैखिक समीकरण युग्म',
        subCategory: 'Algebra',
        subCategoryHindi: 'बीजगणित'
      },
      {
        id: 'ch_04',
        num: 4,
        title: 'Quadratic Equations',
        hindiTitle: 'द्विघात समीकरण',
        subCategory: 'Algebra',
        subCategoryHindi: 'बीजगणित'
      },
      {
        id: 'ch_05',
        num: 5,
        title: 'Arithmetic Progressions',
        hindiTitle: 'समांतर श्रेढ़ियाँ',
        subCategory: 'Algebra',
        subCategoryHindi: 'बीजगणित'
      },
      {
        id: 'ch_06',
        num: 6,
        title: 'Triangles',
        hindiTitle: 'त्रिभुज',
        subCategory: 'Geometry',
        subCategoryHindi: 'ज्यामिति'
      },
      {
        id: 'ch_07',
        num: 7,
        title: 'Coordinate Geometry',
        hindiTitle: 'निर्देशांक ज्यामिती',
        subCategory: 'Coordinate Geometry',
        subCategoryHindi: 'निर्देशांक ज्यामिति'
      },
      {
        id: 'ch_08',
        num: 8,
        title: 'Introduction to Trigonometry',
        hindiTitle: 'त्रिकोणमिति का परिचय',
        subCategory: 'Trigonometry',
        subCategoryHindi: 'त्रिकोणमिति'
      },
      {
        id: 'ch_09',
        num: 9,
        title: 'Some Applications of Trigonometry',
        hindiTitle: 'त्रिकोणमिति के कुछ अनुप्रयोग',
        subCategory: 'Trigonometry',
        subCategoryHindi: 'त्रिकोणमिति'
      },
      {
        id: 'ch_10',
        num: 10,
        title: 'Circles',
        hindiTitle: 'वृत्त',
        subCategory: 'Geometry',
        subCategoryHindi: 'ज्यामिति'
      },
      {
        id: 'ch_11',
        num: 11,
        title: 'Areas Related to Circles',
        hindiTitle: 'वृत्तों से संबंधित क्षेत्रफल',
        subCategory: 'Mensuration',
        subCategoryHindi: 'क्षेत्रमिति'
      },
      {
        id: 'ch_12',
        num: 12,
        title: 'Surface Areas and Volumes',
        hindiTitle: 'पृष्ठीय क्षेत्रफल और आयतन',
        subCategory: 'Mensuration',
        subCategoryHindi: 'क्षेत्रमिति'
      },
      {
        id: 'ch_13',
        num: 13,
        title: 'Statistics',
        hindiTitle: 'सांख्यिकी',
        subCategory: 'Statistics & Probability',
        subCategoryHindi: 'सांख्यिकी एवं प्रायिकता'
      },
      {
        id: 'ch_14',
        num: 14,
        title: 'Probability',
        hindiTitle: 'प्रायिकता',
        subCategory: 'Statistics & Probability',
        subCategoryHindi: 'सांख्यिकी एवं प्रायिकता'
      }
    ]
  },

  // ==========================================
  // 3. ENGLISH / अंग्रेज़ी (All 14 Complete Units)
  // ==========================================
  {
    id: 'eng',
    title: 'English',
    hindiTitle: 'अंग्रेज़ी',
    classTag: 'Class 10 NCERT • 14 Units (First Flight & Footprints)',
    themeColor: '#06B6D4',
    icon: '📖',
    bookSvg: '/images/subjects/english.jpg',
    chapters: [
      {
        id: 'ch_01',
        num: 1,
        title: 'A Letter to God (Dust of Snow & Fire and Ice)',
        hindiTitle: 'भगवान के नाम पत्र (बर्फ के कण व आग और बर्फ)',
        subCategory: 'First Flight',
        subCategoryHindi: 'मुख्य पाठ्यपुस्तक'
      },
      {
        id: 'ch_02',
        num: 2,
        title: 'Nelson Mandela: Long Walk to Freedom',
        hindiTitle: 'नेल्सन मंडेला: आज़ादी की लंबी यात्रा',
        subCategory: 'First Flight',
        subCategoryHindi: 'मुख्य पाठ्यपुस्तक'
      },
      {
        id: 'ch_03',
        num: 3,
        title: 'Two Stories about Flying (His First Flight & Black Aeroplane)',
        hindiTitle: 'उड़ान की दो कहानियाँ',
        subCategory: 'First Flight',
        subCategoryHindi: 'मुख्य पाठ्यपुस्तक'
      },
      {
        id: 'ch_04',
        num: 4,
        title: 'From the Diary of Anne Frank',
        hindiTitle: 'ऐनी फ्रैंक की डायरी से',
        subCategory: 'First Flight',
        subCategoryHindi: 'मुख्य पाठ्यपुस्तक'
      },
      {
        id: 'ch_05',
        num: 5,
        title: 'Glimpses of India (A Baker from Goa, Coorg, Tea from Assam)',
        hindiTitle: 'भारत की झलकियाँ (गोवा का बेकर, कूर्ग, असम की चाय)',
        subCategory: 'First Flight',
        subCategoryHindi: 'मुख्य पाठ्यपुस्तक'
      },
      {
        id: 'ch_06',
        num: 6,
        title: 'Mijbil the Otter',
        hindiTitle: 'मिजबिल ऊदबिलाव',
        subCategory: 'First Flight',
        subCategoryHindi: 'मुख्य पाठ्यपुस्तक'
      },
      {
        id: 'ch_07',
        num: 7,
        title: 'Madam Rides the Bus',
        hindiTitle: 'मैडम ने की बस की सवारी',
        subCategory: 'First Flight',
        subCategoryHindi: 'मुख्य पाठ्यपुस्तक'
      },
      {
        id: 'ch_08',
        num: 8,
        title: 'The Sermon at Benares',
        hindiTitle: 'बनारस में बुद्ध का उपदेश',
        subCategory: 'First Flight',
        subCategoryHindi: 'मुख्य पाठ्यपुस्तक'
      },
      {
        id: 'ch_09',
        num: 9,
        title: 'The Proposal',
        hindiTitle: 'विवाह का प्रस्ताव (एकांकी)',
        subCategory: 'First Flight',
        subCategoryHindi: 'मुख्य पाठ्यपुस्तक'
      },
      {
        id: 'ch_10',
        num: 10,
        title: 'A Triumph of Surgery & The Thief’s Story',
        hindiTitle: 'शल्य चिकित्सा की विजय व चोर की कहानी',
        subCategory: 'Footprints Without Feet',
        subCategoryHindi: 'पूरक पाठ्यपुस्तक'
      },
      {
        id: 'ch_11',
        num: 11,
        title: 'The Midnight Visitor & A Question of Trust',
        hindiTitle: 'आधी रात का आगंतुक व विश्वास का प्रश्न',
        subCategory: 'Footprints Without Feet',
        subCategoryHindi: 'पूरक पाठ्यपुस्तक'
      },
      {
        id: 'ch_12',
        num: 12,
        title: 'Footprints Without Feet & The Making of a Scientist',
        hindiTitle: 'पैरों के निशान बिना पैर व एक वैज्ञानिक का बनना',
        subCategory: 'Footprints Without Feet',
        subCategoryHindi: 'पूरक पाठ्यपुस्तक'
      },
      {
        id: 'ch_13',
        num: 13,
        title: 'The Necklace & Bholi',
        hindiTitle: 'हार (नेकलेस) व भोली',
        subCategory: 'Footprints Without Feet',
        subCategoryHindi: 'पूरक पाठ्यपुस्तक'
      },
      {
        id: 'ch_14',
        num: 14,
        title: 'The Book That Saved the Earth & English Grammar/Writing',
        hindiTitle: 'वह पुस्तक जिसने पृथ्वी को बचाया व व्याकरण/लेखन',
        subCategory: 'Grammar & Supplementary',
        subCategoryHindi: 'व्याकरण एवं पूरक'
      }
    ]
  },

  // ==========================================
  // 4. SOCIAL SCIENCE / सामाजिक विज्ञान (All 14 Complete Board Units)
  // ==========================================
  {
    id: 'sst',
    title: 'Social Science',
    hindiTitle: 'सामाजिक विज्ञान',
    classTag: 'Class 10 NCERT • 14 Units (History, Geo, Civics, Eco)',
    themeColor: '#F59E0B',
    icon: '🌍',
    bookSvg: '/images/subjects/sst.jpg',
    chapters: [
      {
        id: 'ch_01',
        num: 1,
        title: 'The Rise of Nationalism in Europe',
        hindiTitle: 'यूरोप में राष्ट्रवाद का उदय',
        subCategory: 'History',
        subCategoryHindi: 'इतिहास'
      },
      {
        id: 'ch_02',
        num: 2,
        title: 'Nationalism in India',
        hindiTitle: 'भारत में राष्ट्रवाद',
        subCategory: 'History',
        subCategoryHindi: 'इतिहास'
      },
      {
        id: 'ch_03',
        num: 3,
        title: 'The Making of a Global World',
        hindiTitle: 'भूमंडलीकृत विश्व का बनना',
        subCategory: 'History',
        subCategoryHindi: 'इतिहास'
      },
      {
        id: 'ch_04',
        num: 4,
        title: 'Print Culture and the Modern World',
        hindiTitle: 'मुद्रण संस्कृति और आधुनिक दुनिया',
        subCategory: 'History',
        subCategoryHindi: 'इतिहास'
      },
      {
        id: 'ch_05',
        num: 5,
        title: 'Resources and Development',
        hindiTitle: 'संसाधन एवं विकास',
        subCategory: 'Geography',
        subCategoryHindi: 'भूगोल'
      },
      {
        id: 'ch_06',
        num: 6,
        title: 'Forest, Wildlife & Water Resources',
        hindiTitle: 'वन, वन्यजीव एवं जल संसाधन',
        subCategory: 'Geography',
        subCategoryHindi: 'भूगोल'
      },
      {
        id: 'ch_07',
        num: 7,
        title: 'Agriculture',
        hindiTitle: 'कृषि',
        subCategory: 'Geography',
        subCategoryHindi: 'भूगोल'
      },
      {
        id: 'ch_08',
        num: 8,
        title: 'Minerals, Energy & Manufacturing Industries',
        hindiTitle: 'खनिज, ऊर्जा एवं विनिर्माण उद्योग',
        subCategory: 'Geography',
        subCategoryHindi: 'भूगोल'
      },
      {
        id: 'ch_09',
        num: 9,
        title: 'Power Sharing & Federalism',
        hindiTitle: 'सत्ता की साझेदारी एवं संघवाद',
        subCategory: 'Civics',
        subCategoryHindi: 'नागरिक शास्त्र'
      },
      {
        id: 'ch_10',
        num: 10,
        title: 'Gender, Religion and Caste',
        hindiTitle: 'जाति, धर्म और लैंगिक मसले',
        subCategory: 'Civics',
        subCategoryHindi: 'नागरिक शास्त्र'
      },
      {
        id: 'ch_11',
        num: 11,
        title: 'Political Parties & Outcomes of Democracy',
        hindiTitle: 'राजनीतिक दल एवं लोकतंत्र के परिणाम',
        subCategory: 'Civics',
        subCategoryHindi: 'नागरिक शास्त्र'
      },
      {
        id: 'ch_12',
        num: 12,
        title: 'Development & Sectors of the Indian Economy',
        hindiTitle: 'विकास एवं भारतीय अर्थव्यवस्था के क्षेत्रक',
        subCategory: 'Economics',
        subCategoryHindi: 'अर्थशास्त्र'
      },
      {
        id: 'ch_13',
        num: 13,
        title: 'Money and Credit',
        hindiTitle: 'मुद्रा और साख',
        subCategory: 'Economics',
        subCategoryHindi: 'अर्थशास्त्र'
      },
      {
        id: 'ch_14',
        num: 14,
        title: 'Globalisation and the Indian Economy',
        hindiTitle: 'वैश्वीकरण और भारतीय अर्थव्यवस्था',
        subCategory: 'Economics',
        subCategoryHindi: 'अर्थशास्त्र'
      }
    ]
  },

  // ==========================================
  // 5. HINDI (Course A) / हिंदी (All 14 Complete Chapters)
  // ==========================================
  {
    id: 'hin',
    title: 'Hindi (Course A)',
    hindiTitle: 'हिंदी (कोर्स ए)',
    classTag: 'Class 10 NCERT • 14 Chapters (क्षितिज एवं कृतिका)',
    themeColor: '#EC4899',
    icon: '✍️',
    bookSvg: '/public/assets/subject_logos/SUBJECT LOGO/Hindi/HINDI .jpeg',
    chapters: [
      {
        id: 'ch_01',
        num: 1,
        title: 'सूरदास के पद',
        hindiTitle: 'सूरदास के पद (उद्धव तुम हौ अति बड़भागी)',
        subCategory: 'Kshitij Kavya',
        subCategoryHindi: 'क्षितिज - काव्य खंड'
      },
      {
        id: 'ch_02',
        num: 2,
        title: 'राम-लक्ष्मण-परशुराम संवाद (तुलसीदास)',
        hindiTitle: 'राम-लक्ष्मण-परशुराम संवाद (नाथ संभुधनु भंजनिहारा)',
        subCategory: 'Kshitij Kavya',
        subCategoryHindi: 'क्षितिज - काव्य खंड'
      },
      {
        id: 'ch_03',
        num: 3,
        title: 'आत्मकथ्य (जयशंकर प्रसाद)',
        hindiTitle: 'आत्मकथ्य (मधुप गुन-गुना कर कह जाता)',
        subCategory: 'Kshitij Kavya',
        subCategoryHindi: 'क्षितिज - काव्य खंड'
      },
      {
        id: 'ch_04',
        num: 4,
        title: 'उत्साह और अट नहीं रही है (सूर्यकांत त्रिपाठी निराला)',
        hindiTitle: 'उत्साह और अट नहीं रही है (बादल गरजो)',
        subCategory: 'Kshitij Kavya',
        subCategoryHindi: 'क्षितिज - काव्य खंड'
      },
      {
        id: 'ch_05',
        num: 5,
        title: 'यह दंतुरित मुस्कान और फसल (नागार्जुन)',
        hindiTitle: 'यह दंतुरित मुस्कान और फसल',
        subCategory: 'Kshitij Kavya',
        subCategoryHindi: 'क्षितिज - काव्य खंड'
      },
      {
        id: 'ch_06',
        num: 6,
        title: 'संगतकार (मंगलेश डबराल)',
        hindiTitle: 'संगतकार (मुख्य गायक के चट्टान जैसे भारी स्वर का साथ देती)',
        subCategory: 'Kshitij Kavya',
        subCategoryHindi: 'क्षितिज - काव्य खंड'
      },
      {
        id: 'ch_07',
        num: 7,
        title: 'नेताजी का चश्मा (स्वयं प्रकाश)',
        hindiTitle: 'नेताजी का चश्मा (हालदार साहब और कैप्टन चश्मेवाला)',
        subCategory: 'Kshitij Gadya',
        subCategoryHindi: 'क्षितिज - गद्य खंड'
      },
      {
        id: 'ch_08',
        num: 8,
        title: 'बालगोबिन भगत (रामवृक्ष बेनीपुरी)',
        hindiTitle: 'बालगोबिन भगत (कबीरपंथी गृहस्थ साधु)',
        subCategory: 'Kshitij Gadya',
        subCategoryHindi: 'क्षितिज - गद्य खंड'
      },
      {
        id: 'ch_09',
        num: 9,
        title: 'लखनवी अंदाज़ (यशपाल)',
        hindiTitle: 'लखनवी अंदाज़ (नवाबी ठाठ और खीरे की फांकें)',
        subCategory: 'Kshitij Gadya',
        subCategoryHindi: 'क्षितिज - गद्य खंड'
      },
      {
        id: 'ch_10',
        num: 10,
        title: 'एक कहानी यह भी (मन्नू भंडारी)',
        hindiTitle: 'एक कहानी यह भी (लेखिका का बचपन और स्वतंत्रता आंदोलन)',
        subCategory: 'Kshitij Gadya',
        subCategoryHindi: 'क्षितिज - गद्य खंड'
      },
      {
        id: 'ch_11',
        num: 11,
        title: 'नौबतखाने में इबादत (यतींद्र मिश्र)',
        hindiTitle: 'नौबतखाने में इबादत (उस्ताद बिस्मिल्ला खाँ और शहनाई)',
        subCategory: 'Kshitij Gadya',
        subCategoryHindi: 'क्षितिज - गद्य खंड'
      },
      {
        id: 'ch_12',
        num: 12,
        title: 'संस्कृति (भदंत आनंद कौसल्यायन)',
        hindiTitle: 'संस्कृति (सभ्यता और संस्कृति में अंतर)',
        subCategory: 'Kshitij Gadya',
        subCategoryHindi: 'क्षितिज - गद्य खंड'
      },
      {
        id: 'ch_13',
        num: 13,
        title: 'माता का अंचल (शिवपूजन सहाय)',
        hindiTitle: 'माता का अंचल (तारकेश्वर नाथ/भोलानाथ का वात्सल्य)',
        subCategory: 'Kritika',
        subCategoryHindi: 'कृतिका भाग 2'
      },
      {
        id: 'ch_14',
        num: 14,
        title: 'साना-साना हाथ जोड़ि और मैं क्यों लिखता हूँ (मधु कांकरिया / अज्ञेय)',
        hindiTitle: 'साना-साना हाथ जोड़ि व मैं क्यों लिखता हूँ (सिक्किम यात्रा व हिरोशिमा)',
        subCategory: 'Kritika',
        subCategoryHindi: 'कृतिका भाग 2'
      }
    ]
  }
];

export function getMasterSubjectById(id: string): MasterSubject | undefined {
  return CLASS_10_MASTER_SYLLABUS.find(s => s.id === id);
}
