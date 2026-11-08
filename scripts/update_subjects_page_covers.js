const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/pcpcp/.gemini/antigravity/scratch/study-buddy-royal/app/(app)/subjects/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace English parts
content = content.replace(
  `id: 'eng_first_flight',\n        title: 'First Flight',\n        hindiTitle: 'प्रथम उड़ान',\n        totalChapters: 6,\n        completedChapters: 4,\n        iconPath: '/images/subjects/english.jpg'`,
  `id: 'eng_first_flight',\n        title: 'First Flight',\n        hindiTitle: 'First Flight (NCERT)',\n        totalChapters: 6,\n        completedChapters: 4,\n        iconPath: '/images/subjects/english_first_flight.jpg'`
);
content = content.replace(
  `id: 'eng_footprints',\n        title: 'Footprints Without Feet',\n        hindiTitle: 'फुटप्रिंट्स विदाउट फीट',\n        totalChapters: 5,\n        completedChapters: 3,\n        iconPath: '/images/subjects/english.jpg'`,
  `id: 'eng_footprints',\n        title: 'Footprints Without Feet',\n        hindiTitle: 'Footprints Without Feet (NCERT)',\n        totalChapters: 5,\n        completedChapters: 3,\n        iconPath: '/images/subjects/english_footprints.jpg'`
);

// If unicode is altered, let's do regex matching
content = content.replace(/id:\s*'eng_first_flight'[\s\S]*?iconPath:\s*'\/images\/subjects\/english\.jpg'/, (match) => {
  return match.replace("'/images/subjects/english.jpg'", "'/images/subjects/english_first_flight.jpg'");
});
content = content.replace(/id:\s*'eng_footprints'[\s\S]*?iconPath:\s*'\/images\/subjects\/english\.jpg'/, (match) => {
  return match.replace("'/images/subjects/english.jpg'", "'/images/subjects/english_footprints.jpg'");
});

// SST
content = content.replace(/id:\s*'sst_history'[\s\S]*?iconPath:\s*'\/images\/subjects\/sst\.jpg'/, (match) => {
  return match.replace("'/images/subjects/sst.jpg'", "'/images/subjects/sst_history.jpg'");
});
content = content.replace(/id:\s*'sst_geography'[\s\S]*?iconPath:\s*'\/images\/subjects\/sst\.jpg'/, (match) => {
  return match.replace("'/images/subjects/sst.jpg'", "'/images/subjects/sst_geography.jpg'");
});
content = content.replace(/id:\s*'sst_civics'[\s\S]*?iconPath:\s*'\/images\/subjects\/sst\.jpg'/, (match) => {
  return match.replace("'/images/subjects/sst.jpg'", "'/images/subjects/sst_politics.jpg'");
});
content = content.replace(/id:\s*'sst_eco'[\s\S]*?iconPath:\s*'\/images\/subjects\/sst\.jpg'/, (match) => {
  return match.replace("'/images/subjects/sst.jpg'", "'/images/subjects/sst_economics.jpg'");
});

// Hindi
content = content.replace(/id:\s*'hin_kshitij'[\s\S]*?iconPath:\s*'\/images\/subjects\/hindi\.jpg'/, (match) => {
  return match.replace("'/images/subjects/hindi.jpg'", "'/images/subjects/hindi_kshitij.jpg'");
});
content = content.replace(/id:\s*'hin_kritika'[\s\S]*?iconPath:\s*'\/images\/subjects\/hindi\.jpg'/, (match) => {
  return match.replace("'/images/subjects/hindi.jpg'", "'/images/subjects/hindi_kritika.jpg'");
});

// Math & Science
content = content.replace("bookSvg: '/images/subjects/math.jpg'", "bookSvg: '/images/subjects/math_ncert.jpg'");
content = content.replace("bookSvg: '/images/subjects/science.jpg'", "bookSvg: '/images/subjects/science_ncert.jpg'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated subjects page with official covers successfully.');
