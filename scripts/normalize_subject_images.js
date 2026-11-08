const fs = require('fs');
const path = require('path');

const srcBase = 'C:/Users/pcpcp/.gemini/antigravity/scratch/study-buddy-royal/public/images/subjects/official';
const destBase = 'C:/Users/pcpcp/.gemini/antigravity/scratch/study-buddy-royal/public/images/subjects';

const map = [
  { src: 'English/first flight/31swkSVyL1L._AC_UF1000,1000_QL80_.jpg', dest: 'english_first_flight.jpg' },
  { src: 'English/footprint without feet/61F0NqKe5uL._AC_UF1000,1000_QL80_.jpg', dest: 'english_footprints.jpg' },
  { src: 'Hindi/KRITIKA/31GDpJrSb3L._AC_UF350,350_QL50_.jpg', dest: 'hindi_kritika.jpg' },
  { src: 'Hindi/Kshitij/31ecz77zIxL._AC_UF1000,1000_QL80_.jpg', dest: 'hindi_kshitij.jpg' },
  { src: 'maths/images.jpeg', dest: 'math_ncert.jpg' },
  { src: 'SCIENCE/91gcjeazhvL.jpg', dest: 'science_ncert.jpg' },
  { src: 'SST all/history.jpg', dest: 'sst_history.jpg' },
  { src: 'SST all/geography.jpg', dest: 'sst_geography.jpg' },
  { src: 'SST all/politics.jpg', dest: 'sst_politics.jpg' },
  { src: 'SST all/economics.jpg', dest: 'sst_economics.jpg' },
  { src: 'SST all/sst all .jpeg', dest: 'sst_all.jpg' }
];

for (const item of map) {
  const s = path.join(srcBase, item.src);
  const d = path.join(destBase, item.dest);
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, d);
    console.log(`Copied ${item.src} -> ${item.dest}`);
  } else {
    console.warn(`File not found: ${s}`);
  }
}
