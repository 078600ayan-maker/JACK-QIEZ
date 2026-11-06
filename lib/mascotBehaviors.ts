export interface BehaviorPack {
  id: string;
  category: 'idle' | 'thinking' | 'correct' | 'wrong' | 'streak';
  action: 'idle' | 'wave' | 'both' | 'walk' | 'tail' | 'ears' | 'dance' | 'spin' | 'cheer' | 'jump' | 'quiz' | 'think' | 'scratch_head' | 'cry' | 'yawn' | 'cake' | 'lift_weights';
  mood: 'happy' | 'laugh' | 'wink' | 'wow' | 'love' | 'shock' | 'cool' | 'sleepy' | 'sad';
  text: string;
  avatarIcon: string;
}

export const MASCOT_BEHAVIORS: BehaviorPack[] = [
  // --- 1. IDLE / WAITING PACKS (1-10) ---
  {
    id: 'idle_01',
    category: 'idle',
    action: 'idle',
    mood: 'happy',
    text: '🌱 शांत और फोकस्ड! 100% शांति, 100% तैयारी।',
    avatarIcon: '🌱'
  },
  {
    id: 'idle_02',
    category: 'idle',
    action: 'ears',
    mood: 'wink',
    text: '🐰 मेरे 3D कान अगला सवाल सुनने के लिए पूरी तरह तैयार हैं!',
    avatarIcon: '🐰'
  },
  {
    id: 'idle_03',
    category: 'idle',
    action: 'tail',
    mood: 'laugh',
    text: '🐕 जब तुम पढ़ते हो, मेरी पिक्सल पूँछ खुशी से हिलती है!',
    avatarIcon: '🐕'
  },
  {
    id: 'idle_04',
    category: 'idle',
    action: 'yawn',
    mood: 'sleepy',
    text: '🥱 5 सेकंड का डीप ब्रेथ लो... फिर अगला सवाल क्रैक करेंगे!',
    avatarIcon: '🥱'
  },
  {
    id: 'idle_05',
    category: 'idle',
    action: 'spin',
    mood: 'wow',
    text: '🌀 360° स्टडी स्कैन पूरा! आज कोई भी फॉर्मूला नहीं छूटेगा!',
    avatarIcon: '🌀'
  },
  {
    id: 'idle_06',
    category: 'idle',
    action: 'walk',
    mood: 'happy',
    text: '🐾 4 पिक्सल पैरों की वॉक! लगातार कदम ही टॉप रैंक लाते हैं।',
    avatarIcon: '🐾'
  },
  {
    id: 'idle_07',
    category: 'idle',
    action: 'wave',
    mood: 'happy',
    text: '👋 हैलो टॉपर! आज का रिवीजन गोल पूरा करने का टाइम आ गया!',
    avatarIcon: '👋'
  },
  {
    id: 'idle_08',
    category: 'idle',
    action: 'both',
    mood: 'laugh',
    text: '🙌 दोनों हाथ ऊपर! आज बोर्ड एग्जाम का डर खत्म करेंगे!',
    avatarIcon: '🙌'
  },
  {
    id: 'idle_09',
    category: 'idle',
    action: 'quiz',
    mood: 'cool',
    text: '💡 प्रो-टिप: सवाल में "NOT" और "INCORRECT" ध्यान से पढ़ो!',
    avatarIcon: '💡'
  },
  {
    id: 'idle_10',
    category: 'idle',
    action: 'idle',
    mood: 'love',
    text: '💚 मुझे अपने स्मार्ट स्टडी पार्टनर पर पूरा भरोसा है!',
    avatarIcon: '💚'
  },

  // --- 2. THINKING / SCRATCH HEAD PACKS (11-20) ---
  {
    id: 'think_01',
    category: 'thinking',
    action: 'think',
    mood: 'cool',
    text: '🤔 सोचो सोचो... 4 ऑप्शन्स में से 2 गलत तुरंत एलिमिनेट करो!',
    avatarIcon: '🤔'
  },
  {
    id: 'think_02',
    category: 'thinking',
    action: 'scratch_head',
    mood: 'shock',
    text: '🧐 कान खुजला के सोच रहा हूँ... JAC बोर्ड का यह क्लासिक सवाल है!',
    avatarIcon: '🧐'
  },
  {
    id: 'think_03',
    category: 'thinking',
    action: 'think',
    mood: 'cool',
    text: '⚡ फॉर्मूला याद करो: क्या यूनिट्स SI सिस्टम में हैं?',
    avatarIcon: '⚡'
  },
  {
    id: 'think_04',
    category: 'thinking',
    action: 'ears',
    mood: 'wink',
    text: '📡 कान खड़े हैं! तुम्हारे दिमाग में सही जवाब आ चुका है!',
    avatarIcon: '📡'
  },
  {
    id: 'think_05',
    category: 'thinking',
    action: 'scratch_head',
    mood: 'cool',
    text: '🔍 ध्यान से देखो: क्या कोई कीवर्ड सवाल में हिंट दे रहा है?',
    avatarIcon: '🔍'
  },
  {
    id: 'think_06',
    category: 'thinking',
    action: 'think',
    mood: 'cool',
    text: '⏱️ टाइमर की परवाह मत करो, एक्यूरेसी सबसे पहली प्राथमिकता है!',
    avatarIcon: '⏱️'
  },
  {
    id: 'think_07',
    category: 'thinking',
    action: 'idle',
    mood: 'cool',
    text: '🧠 न्यूरॉन्स चार्ज हो रहे हैं... सही ऑप्शन पर टैप करो!',
    avatarIcon: '🧠'
  },
  {
    id: 'think_08',
    category: 'thinking',
    action: 'ears',
    mood: 'wink',
    text: '📐 मैथ्स हो या साइंस, बेसिक कॉन्सेप्ट ही असली चाबी है!',
    avatarIcon: '📐'
  },
  {
    id: 'think_09',
    category: 'thinking',
    action: 'scratch_head',
    mood: 'cool',
    text: '💭 ऑप्शन C या B? अपनी पहली गट-फीलिंग को री-चेक करो!',
    avatarIcon: '💭'
  },
  {
    id: 'think_10',
    category: 'thinking',
    action: 'think',
    mood: 'cool',
    text: '🛡️ शील्ड एक्टिव है! बिना हड़बड़ी के जवाब चुनो!',
    avatarIcon: '🛡️'
  },

  // --- 3. CORRECT ANSWER / STREAK ACCELERATION (21-32) ---
  {
    id: 'correct_01',
    category: 'correct',
    action: 'cheer',
    mood: 'wow',
    text: '🎉 बूम! बिल्कुल सही जवाब! +20 XP और कॉन्फिडेंस बूस्ट!',
    avatarIcon: '🎉'
  },
  {
    id: 'correct_02',
    category: 'correct',
    action: 'jump',
    mood: 'laugh',
    text: '🚀 3D सुपर जंप! तुम्हारा लॉजिक एकदम परफेक्ट था!',
    avatarIcon: '🚀'
  },
  {
    id: 'correct_03',
    category: 'correct',
    action: 'lift_weights',
    mood: 'wow',
    text: '🏋️‍♂️ नॉलेज इज़ मसल! एक और कॉन्सेप्ट दिमाग में लॉक!',
    avatarIcon: '🏋️‍♂️'
  },
  {
    id: 'correct_04',
    category: 'correct',
    action: 'dance',
    mood: 'laugh',
    text: '💃 4-लेग्स विक्ट्री बूगी! क्या जबरदस्त स्पीड है!',
    avatarIcon: '💃'
  },
  {
    id: 'correct_05',
    category: 'correct',
    action: 'spin',
    mood: 'wow',
    text: '🌀 360° विनर स्पिन! टॉपर स्वैग लेवल 100!',
    avatarIcon: '🌀'
  },
  {
    id: 'correct_06',
    category: 'correct',
    action: 'tail',
    mood: 'laugh',
    text: '🐕 पूँछ का सुपर-स्पीड वैग! स्ट्रीक रुकनी नहीं चाहिए!',
    avatarIcon: '🐕'
  },
  {
    id: 'correct_07',
    category: 'correct',
    action: 'both',
    mood: 'wow',
    text: '🙌 शानदार! इस चैप्टर के तुम असली मास्टर बन रहे हो!',
    avatarIcon: '🙌'
  },
  {
    id: 'correct_08',
    category: 'correct',
    action: 'wave',
    mood: 'wink',
    text: '👋 हाई-फाइव पार्टनर! लगातार 3 सही जवाब!',
    avatarIcon: '👋'
  },
  {
    id: 'correct_09',
    category: 'correct',
    action: 'cheer',
    mood: 'wow',
    text: '👑 रॉयल एक्यूरेसी! गोल्ड मेडल सीधे तुम्हारी प्रोफाइल में!',
    avatarIcon: '👑'
  },
  {
    id: 'correct_10',
    category: 'correct',
    action: 'jump',
    mood: 'laugh',
    text: '⭐ 5-स्टार परफॉरमेंस! JAC बोर्ड का कोई भी पेपर तुम्हें नहीं रोक सकता!',
    avatarIcon: '⭐'
  },
  {
    id: 'correct_11',
    category: 'correct',
    action: 'cake',
    mood: 'laugh',
    text: '🍰 यम्मी ट्रीट! सही जवाब की खुशी में सेलिब्रेशन!',
    avatarIcon: '🍰'
  },
  {
    id: 'correct_12',
    category: 'correct',
    action: 'ears',
    mood: 'wink',
    text: '🐰 कान फड़फड़ा रहे हैं! तुम्हारी ब्रेन-स्पीड 60fps है!',
    avatarIcon: '🐰'
  },

  // --- 4. WRONG ANSWER / REASSURANCE & RECOVERY (33-42) ---
  {
    id: 'wrong_01',
    category: 'wrong',
    action: 'cry',
    mood: 'sad',
    text: '😢 अरेरे! 1 हार्ट कम हुआ, लेकिन सीख 100% मिली!',
    avatarIcon: '😢'
  },
  {
    id: 'wrong_02',
    category: 'wrong',
    action: 'idle',
    mood: 'sad',
    text: '🛡️ टेंशन मत लो! यह सवाल Mistake Vault में सुरक्षित है, हम रिविजन करेंगे!',
    avatarIcon: '🛡️'
  },
  {
    id: 'wrong_03',
    category: 'wrong',
    action: 'scratch_head',
    mood: 'cool',
    text: '💡 नीचे एक्सप्लेनेशन पढ़ो! असली टॉपर वही है जो गलती से सीखे।',
    avatarIcon: '💡'
  },
  {
    id: 'wrong_04',
    category: 'wrong',
    action: 'wave',
    mood: 'happy',
    text: '🤝 मैं तुम्हारे साथ हूँ! अगला सवाल तुम्हारा ही होगा!',
    avatarIcon: '🤝'
  },
  {
    id: 'wrong_05',
    category: 'wrong',
    action: 'ears',
    mood: 'wink',
    text: '🐰 मेरे कान झुके नहीं हैं! री-फोकस करो और कमबैक मारो!',
    avatarIcon: '🐰'
  },
  {
    id: 'wrong_06',
    category: 'wrong',
    action: 'tail',
    mood: 'happy',
    text: '🐕 दिल छोटा मत करो, गलती ही सफलता की पहली सीढ़ी है!',
    avatarIcon: '🐕'
  },
  {
    id: 'wrong_07',
    category: 'wrong',
    action: 'both',
    mood: 'cool',
    text: '🙌 गहरी सांस लो! अभी भी तुम्हारे पास हार्ट्स बचे हैं!',
    avatarIcon: '🙌'
  },
  {
    id: 'wrong_08',
    category: 'wrong',
    action: 'jump',
    mood: 'happy',
    text: '⚡ बाउंस बैक! अगला सवाल सही करके स्कोर रिकवर करो!',
    avatarIcon: '⚡'
  },
  {
    id: 'wrong_09',
    category: 'wrong',
    action: 'idle',
    mood: 'wink',
    text: '🔍 इस कांसेप्ट का नोट बना लो, एग्जाम में यह दोबारा गलत नहीं होगा!',
    avatarIcon: '🔍'
  },
  {
    id: 'wrong_10',
    category: 'wrong',
    action: 'cry',
    mood: 'sad',
    text: '🥺 आंसू पोंछो! अगली गेंद पर सिक्सर मारेंगे!',
    avatarIcon: '🥺'
  },

  // --- 5. STREAK / LEVEL COMPLETION / BUDDY SYNC (43-50) ---
  {
    id: 'streak_01',
    category: 'streak',
    action: 'cake',
    mood: 'laugh',
    text: '🎂 स्ट्रीक सेलिब्रेशन! तुम्हारी निरंतरता बेजोड़ है!',
    avatarIcon: '🎂'
  },
  {
    id: 'streak_02',
    category: 'streak',
    action: 'lift_weights',
    mood: 'wow',
    text: '🏋️‍♂️ अनस्टॉपेबल स्कॉलर! लगातार पढ़ाई से ब्रेन सुपरपावर बन गया!',
    avatarIcon: '🏋️‍♂️'
  },
  {
    id: 'streak_03',
    category: 'streak',
    action: 'dance',
    mood: 'laugh',
    text: '🔥 7-डे स्ट्रीक ऑन फायर! बडीज़ को दिखाओ अपना जलवा!',
    avatarIcon: '🔥'
  },
  {
    id: 'streak_04',
    category: 'streak',
    action: 'cheer',
    mood: 'wow',
    text: '🏆 चैप्टर फिनिश्ड! ब्रॉन्ज से डायमंड तक का सफर पूरा!',
    avatarIcon: '🏆'
  },
  {
    id: 'streak_05',
    category: 'streak',
    action: 'spin',
    mood: 'wow',
    text: '💎 डायमंड क्राउन अनलॉक! लीडरबोर्ड में टॉप 1% में एंट्री!',
    avatarIcon: '💎'
  },
  {
    id: 'streak_06',
    category: 'streak',
    action: 'both',
    mood: 'laugh',
    text: '🌟 बडी स्ट्रीक एक्टिव! दोस्त के साथ मिलकर टॉप करने का मज़ा ही अलग है!',
    avatarIcon: '🌟'
  },
  {
    id: 'streak_07',
    category: 'streak',
    action: 'jump',
    mood: 'wow',
    text: '🚀 मिशन अकाम्प्लिश्ड! आज का डेली टारगेट 100% पूरा!',
    avatarIcon: '🚀'
  },
  {
    id: 'streak_08',
    category: 'streak',
    action: 'cheer',
    mood: 'love',
    text: '💚 जैक क्विज का असली चैंपियन! तुम पर हमें गर्व है!',
    avatarIcon: '💚'
  }
];

export function getRandomBehavior(category?: BehaviorPack['category']): BehaviorPack {
  const list = category
    ? MASCOT_BEHAVIORS.filter(b => b.category === category)
    : MASCOT_BEHAVIORS;
  const index = Math.floor(Math.random() * list.length);
  return list[index] || MASCOT_BEHAVIORS[0];
}
