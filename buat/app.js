// ResumeKita (resumekita.my.id) — pembuat CV ATS + Surat Lamaran, dwibahasa ID/EN, banyak contoh profesi.
// Semua di browser; teks asli saat cetak (lolos ATS); data tersimpan di localStorage perangkat.

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'rakitcv-v2';
const has = v => v && String(v).trim() !== '';

const ACCENTS = [
  { name: 'Terakota', paper: '#f7f4ec', accent: '#b5502f' },
  { name: 'Biru Laut', paper: '#f4f6fb', accent: '#2f5fb5' },
  { name: 'Hijau Hutan', paper: '#f3f6f2', accent: '#2f7d4f' },
  { name: 'Plum', paper: '#f7f3f7', accent: '#8a3f7a' },
  { name: 'Grafit', paper: '#f5f5f4', accent: '#3a3a3a' },
];

// label seksi per bahasa
const L = {
  id: { ringkasan: 'Ringkasan', pengalaman: 'Pengalaman', proyek: 'Proyek Pilihan', pendidikan: 'Pendidikan', keahlian: 'Keahlian', sertifikat: 'Sertifikasi', bahasa: 'Bahasa',
        perihal: 'Perihal', lamaran: 'Lamaran Pekerjaan', kepada: 'Kepada Yth.', hormat: 'Hormat saya,' },
  en: { ringkasan: 'Summary', pengalaman: 'Experience', proyek: 'Selected Projects', pendidikan: 'Education', keahlian: 'Skills', sertifikat: 'Certifications', bahasa: 'Languages',
        perihal: 'Subject', lamaran: 'Job Application', kepada: 'To', hormat: 'Sincerely,' },
};

const TEMPLATES = [
  { id: 'klasik', label: 'Klasik', desc: 'Serif · §' },
  { id: 'modern', label: 'Modern', desc: 'Sans bersih' },
  { id: 'kompak', label: 'Kompak', desc: '1 halaman' },
  { id: 'formal', label: 'Formal', desc: 'Konservatif' },
];
const TPL_IDS = TEMPLATES.map(t => t.id);

const BLANK = () => ({
  mode: 'cv', lang: 'id', accent: 0, template: 'klasik',
  nama: '', gelar: '', kota: '', email: '', telepon: '', web: '', github: '', linkedin: '',
  ringkasan: '', pengalaman: [], proyek: [], pendidikan: [], keahlian: [], sertifikat: [], bahasa: [],
  surat: { kota: '', tanggal: '', kepada: '', perusahaan: '', alamat: '', posisi: '', salam: '', isi: '', penutup: '' },
});

// ---------- pustaka contoh (dummy) per profesi ----------
const SAMPLES = {
  dev: { emoji: '💻', label: 'Developer', desc: 'Frontend / Software',
    data: {
      nama: 'Nadia Pratama', gelar: 'Frontend Developer · UI Engineer', kota: 'Bandung, Indonesia',
      email: 'nadia.pratama@email.com', telepon: '+62 812-3456-7890', web: 'nadiapratama.dev', github: 'github.com/nadiapratama', linkedin: 'linkedin.com/in/nadiapratama',
      ringkasan: 'Frontend developer dengan 4 tahun pengalaman membangun antarmuka web yang cepat dan mudah diakses. Terbiasa bekerja dari desain sampai produksi menggunakan React dan TypeScript, dengan perhatian pada performa, aksesibilitas, dan pengalaman pengguna.',
      pengalaman: [
        { posisi: 'Frontend Developer', instansi: 'PT Karya Digital Nusantara', meta: 'Bandung · Hybrid', mulai: 'Jan 2023', selesai: 'Sekarang', poin: 'Membangun ulang dasbor analitik dengan React + TypeScript, menurunkan waktu muat awal 45%\nMemimpin migrasi design system ke komponen reusable yang dipakai 6 tim produk\nMenerapkan pengujian otomatis (Vitest, Playwright) hingga cakupan 80%' },
        { posisi: 'Web Developer', instansi: 'Startup EduTech Cerdas', meta: 'Remote', mulai: 'Jul 2021', selesai: 'Des 2022', poin: 'Mengembangkan halaman pembelajaran interaktif yang melayani 20.000+ siswa aktif bulanan\nMengoptimalkan skor Lighthouse dari 62 menjadi 96 pada halaman utama' },
      ],
      proyek: [{ nama: 'Katalog UMKM', tech: 'React · Vite · Supabase', ket: 'Aplikasi katalog produk untuk usaha kecil dengan admin sederhana dan tombol pesan WhatsApp.', tautan: 'github.com/nadiapratama/katalog-umkm' }],
      pendidikan: [{ jurusan: 'S1 Teknik Informatika', kampus: 'Universitas Padjadjaran', meta: 'Bandung', mulai: '2017', selesai: '2021' }],
      keahlian: [{ label: 'Bahasa', isi: 'TypeScript · JavaScript · HTML · CSS' }, { label: 'Frontend', isi: 'React · Next.js · Tailwind CSS · Vite' }, { label: 'Alat', isi: 'Git · Figma · Vitest · Playwright' }],
      sertifikat: [{ nama: 'Meta Front-End Developer', penerbit: 'Meta / Coursera', tahun: '2023' }],
      bahasa: [{ nama: 'Indonesia', level: 'Native' }, { nama: 'Inggris', level: 'Professional' }],
    } },
  marketing: { emoji: '📣', label: 'Marketing', desc: 'Digital / Social Media',
    data: {
      nama: 'Bagas Wicaksono', gelar: 'Digital Marketing Specialist', kota: 'Jakarta, Indonesia',
      email: 'bagas.wicaksono@email.com', telepon: '+62 811-2233-4455', web: 'bagaswicaksono.id', github: '', linkedin: 'linkedin.com/in/bagaswicaksono',
      ringkasan: 'Spesialis pemasaran digital dengan rekam jejak menaikkan konversi lewat kampanye berbasis data. Berpengalaman mengelola anggaran iklan lintas kanal, SEO, dan analitik untuk brand ritel dan F&B.',
      pengalaman: [
        { posisi: 'Digital Marketing Specialist', instansi: 'PT Ritel Maju Bersama', meta: 'Jakarta', mulai: 'Feb 2022', selesai: 'Sekarang', poin: 'Meningkatkan ROAS kampanye Meta Ads dari 2,1x menjadi 4,6x dalam 6 bulan\nMengelola anggaran iklan Rp 500 juta/bulan lintas Meta, Google, dan TikTok\nMembangun funnel email yang menyumbang 18% total pendapatan online' },
        { posisi: 'Social Media Officer', instansi: 'Kopi Nusantara', meta: 'Bandung · Remote', mulai: 'Jan 2020', selesai: 'Jan 2022', poin: 'Menumbuhkan pengikut Instagram dari 8rb menjadi 120rb dalam 18 bulan\nMemproduksi konten yang rata-rata menjangkau 300rb akun per minggu' },
      ],
      proyek: [], pendidikan: [{ jurusan: 'S1 Ilmu Komunikasi', kampus: 'Universitas Indonesia', meta: 'Depok', mulai: '2015', selesai: '2019' }],
      keahlian: [{ label: 'Periklanan', isi: 'Meta Ads · Google Ads · TikTok Ads' }, { label: 'Analitik', isi: 'GA4 · Looker Studio · Meta Pixel' }, { label: 'Konten', isi: 'SEO · Copywriting · Canva' }],
      sertifikat: [{ nama: 'Google Ads Search Certification', penerbit: 'Google', tahun: '2024' }, { nama: 'Meta Certified Digital Marketing', penerbit: 'Meta', tahun: '2023' }],
      bahasa: [{ nama: 'Indonesia', level: 'Native' }, { nama: 'Inggris', level: 'Professional' }],
    } },
  guru: { emoji: '🎓', label: 'Guru', desc: 'Pendidik / Pengajar',
    data: {
      nama: 'Siti Rahmawati, S.Pd.', gelar: 'Guru Matematika SMP', kota: 'Yogyakarta, Indonesia',
      email: 'siti.rahmawati@email.com', telepon: '+62 813-8899-1020', web: '', github: '', linkedin: 'linkedin.com/in/sitirahmawati',
      ringkasan: 'Guru matematika dengan 6 tahun pengalaman mengajar jenjang SMP. Terbiasa merancang pembelajaran yang membuat siswa aktif, memakai media digital, dan meningkatkan nilai rata-rata kelas secara konsisten.',
      pengalaman: [
        { posisi: 'Guru Matematika', instansi: 'SMP Negeri 5 Yogyakarta', meta: 'Yogyakarta', mulai: 'Jul 2019', selesai: 'Sekarang', poin: 'Menaikkan nilai rata-rata ujian matematika kelas dari 72 menjadi 84 dalam dua tahun\nMengembangkan modul ajar berbasis proyek yang diadopsi seluruh guru serumpun\nMembimbing tim olimpiade matematika hingga meraih juara 2 tingkat kota' },
        { posisi: 'Guru Honorer', instansi: 'SMP Islam Terpadu Cahaya', meta: 'Sleman', mulai: 'Jul 2017', selesai: 'Jun 2019', poin: 'Mengajar 5 rombongan belajar dan menjadi wali kelas VII\nMenginisiasi kelas tambahan gratis untuk siswa yang tertinggal' },
      ],
      proyek: [], pendidikan: [{ jurusan: 'S1 Pendidikan Matematika', kampus: 'Universitas Negeri Yogyakarta', meta: 'Yogyakarta · IPK 3.75', mulai: '2013', selesai: '2017' }],
      keahlian: [{ label: 'Pengajaran', isi: 'Kurikulum Merdeka · Pembelajaran Berdiferensiasi · Asesmen' }, { label: 'Media', isi: 'Google Classroom · Canva · GeoGebra' }, { label: 'Lainnya', isi: 'Manajemen Kelas · Bimbingan Olimpiade' }],
      sertifikat: [{ nama: 'Sertifikat Pendidik (Serdik)', penerbit: 'Kemendikbud', tahun: '2021' }, { nama: 'Google Certified Educator Level 1', penerbit: 'Google', tahun: '2022' }],
      bahasa: [{ nama: 'Indonesia', level: 'Native' }, { nama: 'Inggris', level: 'Intermediate' }],
    } },
  admin: { emoji: '🗂️', label: 'Admin', desc: 'Office / Staf Administrasi',
    data: {
      nama: 'Dewi Anggraini', gelar: 'Staf Administrasi & Keuangan', kota: 'Surabaya, Indonesia',
      email: 'dewi.anggraini@email.com', telepon: '+62 856-2211-3344', web: '', github: '', linkedin: 'linkedin.com/in/dewianggraini',
      ringkasan: 'Staf administrasi teliti dengan 5 tahun pengalaman mengelola dokumen, penjadwalan, dan pembukuan dasar. Terbiasa menjaga kerapian arsip, menyusun laporan, dan mendukung kelancaran operasional kantor.',
      pengalaman: [
        { posisi: 'Admin & Keuangan', instansi: 'PT Sentosa Abadi', meta: 'Surabaya', mulai: 'Mar 2021', selesai: 'Sekarang', poin: 'Mengelola pembukuan kas harian dan rekonsiliasi bulanan tanpa selisih selama 3 tahun\nMenata ulang sistem arsip digital sehingga pencarian dokumen 3x lebih cepat\nMenyusun laporan operasional mingguan untuk manajemen' },
        { posisi: 'Resepsionis & Admin', instansi: 'Klinik Sehat Bahagia', meta: 'Surabaya', mulai: 'Jan 2019', selesai: 'Feb 2021', poin: 'Mengatur jadwal 8 dokter dan menangani 60+ pasien per hari\nMengelola stok dan pemesanan kebutuhan kantor' },
      ],
      proyek: [], pendidikan: [{ jurusan: 'D3 Administrasi Perkantoran', kampus: 'Politeknik Negeri Surabaya', meta: 'Surabaya', mulai: '2015', selesai: '2018' }],
      keahlian: [{ label: 'Perkantoran', isi: 'Microsoft Excel · Word · Google Workspace' }, { label: 'Keuangan', isi: 'Pembukuan Dasar · Rekonsiliasi · Faktur' }, { label: 'Lainnya', isi: 'Manajemen Arsip · Penjadwalan · Layanan Pelanggan' }],
      sertifikat: [{ nama: 'Brevet Pajak A & B', penerbit: 'IAI', tahun: '2022' }],
      bahasa: [{ nama: 'Indonesia', level: 'Native' }, { nama: 'Inggris', level: 'Basic' }],
    } },
  hse: { emoji: '⛑️', label: 'HSE / K3', desc: 'Safety / Tambang',
    data: {
      nama: 'Rangga Saputra', gelar: 'HSE Officer · Ahli K3 Umum', kota: 'Balikpapan, Indonesia',
      email: 'rangga.saputra@email.com', telepon: '+62 852-6440-7788', web: '', github: '', linkedin: 'linkedin.com/in/ranggasaputra',
      ringkasan: 'HSE officer bersertifikat Ahli K3 Umum dengan 5 tahun pengalaman di sektor pertambangan. Fokus pada budaya kerja aman, investigasi insiden, dan kepatuhan regulasi — dengan rekam jejak menurunkan angka kecelakaan kerja.',
      pengalaman: [
        { posisi: 'HSE Officer', instansi: 'Kalimantan Tambang Mandiri', meta: 'Balikpapan · Site', mulai: 'Ags 2021', selesai: 'Sekarang', poin: 'Menurunkan lost time injury (LTI) 40% dalam dua tahun lewat program safety patrol\nMemimpin investigasi insiden dan menyusun corrective action yang terverifikasi\nMenyelenggarakan 120+ sesi safety talk dan pelatihan tanggap darurat' },
        { posisi: 'Safety Inspector', instansi: 'PT Konstruksi Bangun Jaya', meta: 'Samarinda', mulai: 'Jun 2019', selesai: 'Jul 2021', poin: 'Melakukan inspeksi harian APD dan alat berat di 3 lokasi proyek\nMenyusun JSA (Job Safety Analysis) untuk pekerjaan berisiko tinggi' },
      ],
      proyek: [], pendidikan: [{ jurusan: 'S1 Teknik Lingkungan', kampus: 'Institut Teknologi Kalimantan', meta: 'Balikpapan', mulai: '2014', selesai: '2018' }],
      keahlian: [{ label: 'K3', isi: 'JSA · HIRADC · Investigasi Insiden · Emergency Response' }, { label: 'Regulasi', isi: 'SMK3 PP 50/2012 · ISO 45001 · Permen ESDM' }, { label: 'Alat', isi: 'Audit APD · Safety Patrol · Pelaporan' }],
      sertifikat: [{ nama: 'Ahli K3 Umum (AK3U)', penerbit: 'Kemnaker RI', tahun: '2020' }, { nama: 'ISO 45001 Lead Auditor', penerbit: 'IRCA', tahun: '2023' }],
      bahasa: [{ nama: 'Indonesia', level: 'Native' }, { nama: 'Inggris', level: 'Professional' }],
    } },
  fresh: { emoji: '🌱', label: 'Fresh Graduate', desc: 'Baru lulus / Magang',
    data: {
      nama: 'Aulia Rahman', gelar: 'Fresh Graduate · Manajemen', kota: 'Semarang, Indonesia',
      email: 'aulia.rahman@email.com', telepon: '+62 878-1122-3344', web: '', github: '', linkedin: 'linkedin.com/in/auliarahman',
      ringkasan: 'Lulusan S1 Manajemen yang antusias, terorganisir, dan cepat belajar. Aktif berorganisasi dan magang di bidang operasional. Mencari peran entry-level untuk berkontribusi sambil terus berkembang.',
      pengalaman: [
        { posisi: 'Magang — Staf Operasional', instansi: 'PT Logistik Andal', meta: 'Semarang', mulai: 'Jan 2024', selesai: 'Jun 2024', poin: 'Membantu memantau pengiriman harian dan merapikan data 500+ order per minggu\nMenyusun laporan rekap mingguan yang mempercepat rapat evaluasi tim' },
        { posisi: 'Ketua Divisi Acara', instansi: 'Himpunan Mahasiswa Manajemen', meta: 'Semarang', mulai: 'Ags 2022', selesai: 'Ags 2023', poin: 'Memimpin 15 panitia menyelenggarakan seminar nasional dengan 300+ peserta\nMengelola anggaran acara Rp 40 juta dan mendapatkan 5 sponsor' },
      ],
      proyek: [{ nama: 'Skripsi: Analisis Kepuasan Pelanggan UMKM', tech: 'SPSS · Kuesioner', ket: 'Meneliti faktor kepuasan pelanggan pada 120 UMKM kuliner di Semarang.', tautan: '' }],
      pendidikan: [{ jurusan: 'S1 Manajemen', kampus: 'Universitas Diponegoro', meta: 'Semarang · IPK 3.62', mulai: '2020', selesai: '2024' }],
      keahlian: [{ label: 'Perkantoran', isi: 'Microsoft Office · Google Workspace' }, { label: 'Analisis', isi: 'SPSS · Dasar Data · Riset Pasar' }, { label: 'Lainnya', isi: 'Kepemimpinan · Manajemen Acara · Komunikasi' }],
      sertifikat: [{ nama: 'Brevet Pajak A', penerbit: 'Tax Center Undip', tahun: '2023' }],
      bahasa: [{ nama: 'Indonesia', level: 'Native' }, { nama: 'Inggris', level: 'Intermediate' }],
    } },
};

// ---------- surat lamaran: template default (memakai data CV) ----------
function suratTemplate(lang) {
  const nm = has(D.nama) ? D.nama : (lang === 'en' ? 'Your Name' : 'Nama Anda');
  const gl = has(D.gelar) ? D.gelar.split('·')[0].trim() : (lang === 'en' ? 'professional' : 'profesional');
  if (lang === 'en') return {
    kota: (D.kota || '').split(',')[0].trim(), tanggal: todayStr('en'),
    kepada: 'Hiring Manager', perusahaan: 'Company Name', alamat: 'City',
    posisi: 'Position Applied For', salam: 'Dear Hiring Manager,',
    isi: `I am writing to apply for the ${'{posisi}'} position at ${'{perusahaan}'}. As a ${gl}, I am confident my skills and experience make me a strong fit for your team.\n\nIn my previous roles I consistently delivered measurable results and collaborated effectively across teams. I am eager to bring the same dedication and impact to ${'{perusahaan}'}.\n\nI have attached my resume for your consideration and would welcome the opportunity to discuss how I can contribute.`,
    penutup: 'Thank you for your time and consideration.',
  };
  return {
    kota: (D.kota || '').split(',')[0].trim(), tanggal: todayStr('id'),
    kepada: 'Bapak/Ibu HRD', perusahaan: 'Nama Perusahaan', alamat: 'Kota',
    posisi: 'Posisi yang Dilamar', salam: 'Dengan hormat,',
    isi: `Berdasarkan informasi lowongan untuk posisi ${'{posisi}'} di ${'{perusahaan}'}, saya ${nm} bermaksud mengajukan lamaran pekerjaan. Sebagai ${gl}, saya yakin keterampilan dan pengalaman yang saya miliki sesuai dengan kebutuhan perusahaan.\n\nSelama berkarier, saya terbiasa bekerja secara terukur, berkolaborasi lintas tim, dan memberikan hasil nyata. Saya siap memberikan kontribusi terbaik bagi ${'{perusahaan}'}.\n\nSebagai bahan pertimbangan, saya lampirkan daftar riwayat hidup (CV). Saya sangat berharap diberi kesempatan untuk mengikuti tahap seleksi berikutnya.`,
    penutup: 'Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.',
  };
}
function todayStr(lang) {
  try {
    const d = new Date();
    if (lang === 'en') return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) { return ''; }
}

let D = load() || withSample(BLANK(), 'dev');
function withSample(base, key) { return Object.assign(base, JSON.parse(JSON.stringify(SAMPLES[key].data))); }
function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { } }

// ================= FORM =================
const REPEAT = {
  pengalaman: { add: 'Tambah Pengalaman', fields: [['posisi', 'Posisi / Jabatan', 'text', 'mis. Frontend Developer'], ['instansi', 'Perusahaan / Instansi', 'text', 'mis. PT Karya Digital'], ['meta', 'Lokasi / Tipe', 'text', 'mis. Bandung · Remote'], ['__row', 'mulai', 'selesai'], ['mulai', 'Mulai', 'text', 'mis. Jan 2023'], ['selesai', 'Selesai', 'text', 'mis. Sekarang'], ['poin', 'Pencapaian (satu per baris)', 'area', 'Tulis capaian terukur, satu poin per baris…']] },
  proyek: { add: 'Tambah Proyek', fields: [['nama', 'Nama Proyek', 'text', 'mis. Katalog UMKM'], ['tech', 'Teknologi', 'text', 'mis. React · Supabase'], ['ket', 'Deskripsi singkat', 'area', 'Apa proyeknya & dampaknya…'], ['tautan', 'Tautan (opsional)', 'text', 'github.com/…']] },
  pendidikan: { add: 'Tambah Pendidikan', fields: [['jurusan', 'Jurusan / Program', 'text', 'mis. S1 Teknik Informatika'], ['kampus', 'Institusi', 'text', 'mis. Universitas Padjadjaran'], ['meta', 'Lokasi / Catatan', 'text', 'mis. Bandung · IPK 3.8'], ['__row', 'mulai', 'selesai'], ['mulai', 'Mulai', 'text', '2017'], ['selesai', 'Selesai', 'text', '2021']] },
  keahlian: { add: 'Tambah Kategori Keahlian', fields: [['label', 'Kategori', 'text', 'mis. Frontend'], ['isi', 'Keahlian (pisahkan dengan · atau koma)', 'area', 'React · Next.js · Tailwind']] },
  sertifikat: { add: 'Tambah Sertifikat', fields: [['nama', 'Nama Sertifikat', 'text', 'mis. Certified Ethical Hacker'], ['__row', 'penerbit', 'tahun'], ['penerbit', 'Penerbit', 'text', 'mis. EC-Council'], ['tahun', 'Tahun', 'text', '2024']] },
  bahasa: { add: 'Tambah Bahasa', fields: [['__row', 'nama', 'level'], ['nama', 'Bahasa', 'text', 'mis. Inggris'], ['level', 'Tingkat', 'text', 'mis. Professional']] },
};

function buildForm() {
  return D.mode === 'surat' ? buildSuratForm() : buildCVForm();
}

function buildCVForm() {
  const f = $('#form');
  f.innerHTML = `
  <details class="sec" open><summary><span class="ico">👤</span> Data Diri <span class="chev">▸</span></summary>
    <div class="sec-body">
      <div class="field"><label>Nama lengkap</label><input data-k="nama" value="${esc(D.nama)}" placeholder="mis. Nadia Pratama"></div>
      <div class="field"><label>Gelar / Peran profesional</label><input data-k="gelar" value="${esc(D.gelar)}" placeholder="mis. Frontend Developer · UI Engineer"></div>
      <div class="row2"><div class="field"><label>Kota, Negara</label><input data-k="kota" value="${esc(D.kota)}" placeholder="Bandung, Indonesia"></div><div class="field"><label>Telepon</label><input data-k="telepon" value="${esc(D.telepon)}" placeholder="+62 …"></div></div>
      <div class="field"><label>Email</label><input data-k="email" value="${esc(D.email)}" placeholder="nama@email.com"></div>
      <div class="row2"><div class="field"><label>Website</label><input data-k="web" value="${esc(D.web)}" placeholder="situskamu.com"></div><div class="field"><label>GitHub</label><input data-k="github" value="${esc(D.github)}" placeholder="github.com/…"></div></div>
      <div class="field"><label>LinkedIn</label><input data-k="linkedin" value="${esc(D.linkedin)}" placeholder="linkedin.com/in/…"></div>
      <div class="field"><label>Warna aksen</label><div class="swatches" id="swatches"></div></div>
    </div></details>
  <details class="sec" open><summary><span class="ico">§</span> Ringkasan <span class="chev">▸</span></summary>
    <div class="sec-body"><div class="field"><textarea data-k="ringkasan" placeholder="2–4 kalimat: siapa kamu, keahlian inti, dan nilai yang kamu bawa…">${esc(D.ringkasan)}</textarea>
      <div class="hint">Tips ATS: sebut peran &amp; keahlian kunci di sini — banyak pemindai membaca ringkasan lebih dulu.</div></div></div></details>
  ${sectionHTML('pengalaman', '💼', 'Pengalaman Kerja')}
  ${sectionHTML('proyek', '🚀', 'Proyek Pilihan')}
  ${sectionHTML('pendidikan', '🎓', 'Pendidikan')}
  ${sectionHTML('keahlian', '🧩', 'Keahlian')}
  ${sectionHTML('sertifikat', '📜', 'Sertifikasi')}
  ${sectionHTML('bahasa', '🌐', 'Bahasa')}
  <div class="atsbadge">✓ <div><b>CV ini ramah-ATS.</b> Satu kolom, judul seksi standar, teks asli (bukan gambar), tanpa foto/tabel yang membingungkan pemindai. Unduh PDF lalu tempel isinya di Notepad untuk memastikan semua teks terbaca rapi.</div></div>`;
  renderSwatches();
  bindCV();
}

function buildSuratForm() {
  const s = D.surat;
  $('#form').innerHTML = `
  <details class="sec" open><summary><span class="ico">✉️</span> Surat Lamaran <span class="chev">▸</span></summary>
    <div class="sec-body">
      <div class="hint" style="margin-bottom:12px">Nama &amp; kontak pengirim otomatis diambil dari <b>Data Diri</b> di tab CV. Ganti bahasa lewat tombol ID/EN di atas.</div>
      <div class="row2"><div class="field"><label>Kota (pengirim)</label><input data-s="kota" value="${esc(s.kota)}" placeholder="Jakarta"></div><div class="field"><label>Tanggal</label><input data-s="tanggal" value="${esc(s.tanggal)}" placeholder="25 Agustus 2026"></div></div>
      <div class="field"><label>Ditujukan kepada</label><input data-s="kepada" value="${esc(s.kepada)}" placeholder="Bapak/Ibu HRD"></div>
      <div class="row2"><div class="field"><label>Perusahaan</label><input data-s="perusahaan" value="${esc(s.perusahaan)}" placeholder="Nama Perusahaan"></div><div class="field"><label>Alamat / Kota tujuan</label><input data-s="alamat" value="${esc(s.alamat)}" placeholder="Kota"></div></div>
      <div class="field"><label>Posisi yang dilamar</label><input data-s="posisi" value="${esc(s.posisi)}" placeholder="mis. Frontend Developer"></div>
      <div class="field"><label>Salam pembuka</label><input data-s="salam" value="${esc(s.salam)}" placeholder="Dengan hormat,"></div>
      <div class="field"><label>Isi surat (pisahkan paragraf dengan baris kosong)</label><textarea data-s="isi" style="min-height:180px" placeholder="Tulis isi lamaran…">${esc(s.isi)}</textarea>
        <div class="hint">Placeholder <b>{posisi}</b> &amp; <b>{perusahaan}</b> otomatis diganti sesuai isian di atas.</div></div>
      <div class="field"><label>Kalimat penutup</label><textarea data-s="penutup" placeholder="Atas perhatian…">${esc(s.penutup)}</textarea></div>
      <button class="addbtn" id="resetsurat" type="button">↻ Tulis ulang dari template</button>
      <div class="atsbadge" style="margin-top:12px">✓ <div><b>Serasi dengan CV-mu.</b> Surat memakai gaya, warna aksen, dan identitas yang sama. Unduh PDF terpisah untuk dilampirkan bersama CV.</div></div>
    </div></details>`;
  $('#form').querySelectorAll('[data-s]').forEach(inp => inp.addEventListener('input', () => { D.surat[inp.dataset.s] = inp.value; save(); paint(); }));
  $('#resetsurat').addEventListener('click', () => { if (confirm('Tulis ulang surat dari template? Isian surat sekarang akan diganti.')) { D.surat = suratTemplate(D.lang); save(); buildForm(); paint(); } });
}

function sectionHTML(kind, ico, title) {
  const items = D[kind].map((it, i) => entryHTML(kind, it, i)).join('');
  return `<details class="sec" ${D[kind].length ? 'open' : ''}><summary><span class="ico">${ico}</span> ${title} <span class="chev">▸</span></summary>
    <div class="sec-body"><div data-list="${kind}">${items}</div><button class="addbtn" data-add="${kind}">+ ${REPEAT[kind].add}</button></div></details>`;
}
function entryHTML(kind, it, i) {
  const cfg = REPEAT[kind];
  let html = `<div class="entry"><div class="entry-head"><span class="t">#${i + 1}</span><span class="sp"></span>
    <button class="mini" data-move="${kind}" data-dir="-1" data-i="${i}" title="Naik">↑</button>
    <button class="mini" data-move="${kind}" data-dir="1" data-i="${i}" title="Turun">↓</button>
    <button class="mini del" data-del="${kind}" data-i="${i}" title="Hapus">✕</button></div>`;
  const rowDefs = cfg.fields.filter(r => r[0] === '__row');
  const inRow = k => rowDefs.find(r => r[1] === k || r[2] === k);
  const done = new Set();
  for (const fld of cfg.fields) {
    if (fld[0] === '__row') continue;
    const [k, lbl, type, ph] = fld;
    if (done.has(k)) continue;
    const rd = inRow(k);
    const mk = (kk, ll, pp, tt) => tt === 'area'
      ? `<div class="field"><label>${ll}</label><textarea data-ek="${kind}" data-i="${i}" data-f="${kk}" placeholder="${esc(pp)}">${esc(it[kk] || '')}</textarea></div>`
      : `<div class="field"><label>${ll}</label><input data-ek="${kind}" data-i="${i}" data-f="${kk}" value="${esc(it[kk] || '')}" placeholder="${esc(pp)}"></div>`;
    if (rd) {
      const k2 = rd[1] === k ? rd[2] : rd[1];
      const f2 = cfg.fields.find(r => r[0] === k2);
      html += `<div class="row2">${mk(k, lbl, ph, type)}${mk(k2, f2[1], f2[3], f2[2])}</div>`;
      done.add(k); done.add(k2);
    } else { html += mk(k, lbl, ph, type); done.add(k); }
  }
  return html + `</div>`;
}
function renderSwatches() {
  const box = $('#swatches'); if (!box) return;
  box.innerHTML = ACCENTS.map((a, i) => `<div class="sw ${i === D.accent ? 'on' : ''}" data-acc="${i}" title="${a.name}" style="background:${a.accent}"></div>`).join('');
  box.querySelectorAll('.sw').forEach(s => s.addEventListener('click', () => { D.accent = +s.dataset.acc; save(); renderSwatches(); paint(); }));
}
function bindCV() {
  $('#form').querySelectorAll('[data-k]').forEach(inp => inp.addEventListener('input', () => { D[inp.dataset.k] = inp.value; save(); paint(); }));
  $('#form').querySelectorAll('[data-ek]').forEach(inp => inp.addEventListener('input', () => { D[inp.dataset.ek][+inp.dataset.i][inp.dataset.f] = inp.value; save(); paint(); }));
  $('#form').querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => { D[b.dataset.add].push({}); save(); buildForm(); paint(); }));
  $('#form').querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { D[b.dataset.del].splice(+b.dataset.i, 1); save(); buildForm(); paint(); }));
  $('#form').querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.move, i = +b.dataset.i, arr = D[k], j = i + +b.dataset.dir;
    if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; save(); buildForm(); paint();
  }));
}

// ================= RENDER =================
function contactLine() {
  return [D.kota, D.email, D.telepon, D.web, D.github, D.linkedin].filter(has).map(esc).join('<span class="sl">/</span>');
}
function summaryHTML() {
  const s = (D.ringkasan || '').trim(); if (!s) return '';
  const m = s.match(/^(.*?[.!?])(\s+)([\s\S]*)$/);
  return m ? `<span class="lead">${esc(m[1])}</span> ${esc(m[3])}` : esc(s);
}
function sec(title, inner) { return `<div class="cv-sec"><div class="cv-h"><span class="pilcrow">§</span> ${esc(title)}<span class="cv-h-rule"></span></div>${inner}</div>`; }

function paint() {
  const a = ACCENTS[D.accent] || ACCENTS[0];
  const p = $('#paper');
  p.dataset.tpl = TPL_IDS.includes(D.template) ? D.template : 'klasik';
  p.style.setProperty('--paper', a.paper); p.style.setProperty('--accent', a.accent); p.style.background = a.paper;
  p.innerHTML = D.mode === 'surat' ? renderSurat() : renderCV();
  updatePageFlag();
}

function renderTplBar() {
  const bar = $('#tplbar'); if (!bar) return;
  bar.innerHTML = TEMPLATES.map(t => `<button class="tplchip ${t.id === D.template ? 'on' : ''}" data-tpl="${t.id}" type="button">${t.label}<small>${t.desc}</small></button>`).join('');
  bar.querySelectorAll('.tplchip').forEach(c => c.addEventListener('click', () => { D.template = c.dataset.tpl; save(); renderTplBar(); paint(); }));
}

function renderCV() {
  const t = L[D.lang];
  let html = `<div class="cv-name">${esc(D.nama) || '<span class="cv-empty">Nama Lengkap</span>'}</div>`;
  if (has(D.gelar)) html += `<div class="cv-title">${esc(D.gelar)}</div>`;
  const cl = contactLine(); if (cl) html += `<div class="cv-contact">${cl}</div>`;
  html += `<div class="cv-head-rule"></div>`;
  if (has(D.ringkasan)) html += sec(t.ringkasan, `<div class="cv-summary">${summaryHTML()}</div>`);
  if (D.pengalaman.length) {
    const inner = D.pengalaman.map(e => {
      if (!has(e.posisi) && !has(e.instansi)) return '';
      const date = [e.mulai, e.selesai].filter(has).join(' — ');
      const meta = [e.instansi, e.meta].filter(has).map((x, i) => i === 0 ? esc(x) : `<i>${esc(x)}</i>`).join(' · ');
      const bul = (e.poin || '').split('\n').map(x => x.trim()).filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('');
      return `<div class="cv-entry"><div class="er"><div class="et">${esc(e.posisi) || ''}</div>${date ? `<div class="ed">${esc(date)}</div>` : ''}</div>${meta ? `<div class="em">${meta}</div>` : ''}${bul ? `<ul class="cv-bul">${bul}</ul>` : ''}</div>`;
    }).join(''); if (inner.trim()) html += sec(t.pengalaman, inner);
  }
  if (D.proyek.length) {
    const inner = D.proyek.map(e => { if (!has(e.nama)) return '';
      return `<div class="cv-entry cv-proj"><div class="er"><div class="et">${esc(e.nama)}</div>${has(e.tech) ? `<div class="ed">${esc(e.tech)}</div>` : ''}</div>${has(e.ket) ? `<div class="pd">${esc(e.ket)}</div>` : ''}${has(e.tautan) ? `<div class="pd" style="color:#6f6a5f">${esc(e.tautan)}</div>` : ''}</div>`;
    }).join(''); if (inner.trim()) html += sec(t.proyek, inner);
  }
  if (D.pendidikan.length) {
    const inner = D.pendidikan.map(e => { if (!has(e.jurusan) && !has(e.kampus)) return '';
      const date = [e.mulai, e.selesai].filter(has).join(' — ');
      const meta = [e.kampus, e.meta].filter(has).map((x, i) => i === 0 ? esc(x) : `<i>${esc(x)}</i>`).join(' · ');
      return `<div class="cv-entry"><div class="er"><div class="et">${esc(e.jurusan) || ''}</div>${date ? `<div class="ed">${esc(date)}</div>` : ''}</div>${meta ? `<div class="em">${meta}</div>` : ''}</div>`;
    }).join(''); if (inner.trim()) html += sec(t.pendidikan, inner);
  }
  if (D.keahlian.length) {
    const rows = D.keahlian.filter(e => has(e.label) || has(e.isi)).map(e => `<dt>${esc(e.label)}</dt><dd>${esc(e.isi)}</dd>`).join('');
    if (rows) html += sec(t.keahlian, `<dl class="cv-skill">${rows}</dl>`);
  }
  if (D.sertifikat.length) {
    const rows = D.sertifikat.filter(e => has(e.nama)).map(e => { const r = [e.penerbit, e.tahun].filter(has).join(' · '); return `<div class="cv-line"><span class="n">${esc(e.nama)}</span>${r ? `<span class="r">${esc(r)}</span>` : ''}</div>`; }).join('');
    if (rows) html += sec(t.sertifikat, rows);
  }
  if (D.bahasa.length) {
    const items = D.bahasa.filter(e => has(e.nama)).map(e => `<span class="lg"><b>${esc(e.nama)}</b>${has(e.level) ? `<span>${esc(e.level)}</span>` : ''}</span>`).join('');
    if (items) html += sec(t.bahasa, `<div class="cv-langs">${items}</div>`);
  }
  return html;
}

function renderSurat() {
  const t = L[D.lang], s = D.surat;
  const sub = (str) => esc(String(str || '').replace(/\{posisi\}/g, s.posisi || '…').replace(/\{perusahaan\}/g, s.perusahaan || '…'));
  const ct = [D.email, D.telepon, D.linkedin].filter(has).map(esc).join(' · ');
  let html = `<div class="let-top">
      <div class="let-from"><div class="nm">${esc(D.nama) || '<span class="cv-empty">Nama Anda</span>'}</div>
        ${has(D.gelar) ? `<div class="rl">${esc(D.gelar)}</div>` : ''}${ct ? `<div class="ct">${ct}</div>` : ''}</div>
      <div class="let-date">${[s.kota, s.tanggal].filter(has).map(esc).join(', ')}</div></div>
    <div class="let-rule"></div>`;
  if (has(s.kepada) || has(s.perusahaan) || has(s.alamat)) {
    html += `<div class="let-to"><span class="k">${esc(t.kepada)}</span>${[s.kepada, s.perusahaan, s.alamat].filter(has).map(esc).join('<br>')}</div>`;
  }
  if (has(s.posisi)) html += `<div class="let-subj"><b>${esc(t.perihal)}:</b> ${esc(t.lamaran)} — ${esc(s.posisi)}</div>`;
  if (has(s.salam)) html += `<div class="let-salam">${esc(s.salam)}</div>`;
  const paras = (s.isi || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).map(x => `<p>${sub(x).replace(/\n/g, '<br>')}</p>`).join('');
  if (paras) html += `<div class="let-body">${paras}</div>`;
  if (has(s.penutup)) html += `<div class="let-close">${sub(s.penutup)}</div>`;
  html += `<div class="let-close">${esc(t.hormat)}</div><div class="let-sign">${esc(D.nama) || ''}</div>`;
  return html;
}

function updatePageFlag() {
  // toleransi 8px: kertas min-height persis 1 halaman (1123px) → jangan terhitung 2
  const n = Math.max(1, Math.ceil(($('#paper').scrollHeight - 8) / 1123));
  const flag = $('#pageflag');
  if (n === 1) { flag.className = 'pageflag'; flag.textContent = '1 halaman · panjang ideal'; }
  else if (n === 2) { flag.className = 'pageflag'; flag.textContent = '2 halaman'; }
  else { flag.className = 'pageflag warn'; flag.textContent = n + ' halaman · pertimbangkan meringkas'; }
}

// ---------- zoom ----------
let zoom = 1;
function applyZoom() { $('#paper').style.transform = `scale(${zoom})`; $('#paper').style.transformOrigin = 'top center'; }
$('#zin').addEventListener('click', () => { zoom = Math.min(1.4, zoom + .1); applyZoom(); });
$('#zout').addEventListener('click', () => { zoom = Math.max(.4, zoom - .1); applyZoom(); });
function fitZoom() { if (innerWidth <= 900) { zoom = Math.min(1, ($('#preview').clientWidth - 28) / 794); applyZoom(); } }
addEventListener('resize', fitZoom);

// ---------- cetak via #printroot ----------
function syncPrintRoot() {
  const a = ACCENTS[D.accent] || ACCENTS[0];
  $('#printroot').innerHTML = `<div class="cvpaper" data-tpl="${D.template}" style="--paper:${a.paper};--accent:${a.accent};background:${a.paper}">${$('#paper').innerHTML}</div>`;
}
addEventListener('beforeprint', syncPrintRoot);
$('#bpdf').addEventListener('click', () => {
  syncPrintRoot();
  const nm = (D.nama || 'CV').trim().replace(/\s+/g, '-');
  const prev = document.title;
  document.title = (D.mode === 'surat' ? 'Surat-Lamaran-' : 'CV-') + nm;
  const done = () => { document.title = prev; removeEventListener('afterprint', done); };
  addEventListener('afterprint', done);
  setTimeout(print, 80);
});

// ---------- switch dokumen & bahasa ----------
function refreshSwitches() {
  $('#docseg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.doc === D.mode));
  $('#langseg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.lang === D.lang));
}
$('#docseg').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  D.mode = b.dataset.doc;
  if (D.mode === 'surat' && !has(D.surat.isi)) D.surat = suratTemplate(D.lang);
  save(); refreshSwitches(); buildForm(); paint();
}));
$('#langseg').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  D.lang = b.dataset.lang; save(); refreshSwitches(); paint();
}));

// ---------- modal contoh profesi ----------
function openSamples() {
  const g = $('#sampgrid');
  g.innerHTML = Object.entries(SAMPLES).map(([k, s]) => `<button class="samp" data-samp="${k}"><span class="e">${s.emoji}</span><span><b>${s.label}</b><small>${s.desc}</small></span></button>`).join('');
  g.querySelectorAll('.samp').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.samp, keep = { mode: D.mode, lang: D.lang, accent: D.accent, template: D.template };
    D = Object.assign(BLANK(), keep);
    withSample(D, key);
    D.surat = suratTemplate(D.lang);
    save(); $('#sampmodal').classList.remove('on'); buildForm(); paint();
  }));
  $('#sampmodal').classList.add('on');
}
$('#bsample').addEventListener('click', openSamples);
$('#sampclose').addEventListener('click', () => $('#sampmodal').classList.remove('on'));
$('#sampmodal').addEventListener('click', e => { if (e.target.id === 'sampmodal') $('#sampmodal').classList.remove('on'); });

// ---------- aksi lain ----------
$('#bclear').addEventListener('click', () => {
  if (confirm('Kosongkan semua isian (CV & surat)? Tidak bisa dibatalkan.')) {
    const keep = { mode: D.mode, lang: D.lang, accent: D.accent, template: D.template };
    D = Object.assign(BLANK(), keep); save(); buildForm(); paint();
  }
});
$('#bexport').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(D, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'rakitcv-' + (D.nama || 'data').trim().replace(/\s+/g, '-').toLowerCase() + '.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
$('#bimport').addEventListener('click', () => $('#fileimport').click());
$('#fileimport').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => { try { D = Object.assign(BLANK(), JSON.parse(r.result)); save(); refreshSwitches(); renderTplBar(); buildForm(); paint(); } catch (err) { alert('File JSON tidak valid.'); } };
  r.readAsText(file); e.target.value = '';
});

// ---------- tab mobile ----------
$('#tabEdit').addEventListener('click', () => { document.body.dataset.tab = 'edit'; $('#tabEdit').classList.add('on'); $('#tabPrev').classList.remove('on'); });
$('#tabPrev').addEventListener('click', () => { document.body.dataset.tab = 'preview'; $('#tabPrev').classList.add('on'); $('#tabEdit').classList.remove('on'); fitZoom(); });

// ---------- start ----------
// template awal dari query landing (?t=modern) — sekali, hanya jika valid
try { const qt = new URLSearchParams(location.search).get('t'); if (qt && TPL_IDS.includes(qt)) { D.template = qt; save(); } } catch (e) {}
refreshSwitches(); renderTplBar(); buildForm(); paint(); fitZoom();

window.__CV = {
  get name() { return D.nama; }, get mode() { return D.mode; }, get lang() { return D.lang; },
  get sections() { return $('#paper').querySelectorAll('.cv-sec').length; },
  get pageText() { return $('#paper').innerText; },
  load(obj) { D = Object.assign(BLANK(), obj); save(); refreshSwitches(); renderTplBar(); buildForm(); paint(); },
  sample(k) { const keep = { mode: D.mode, lang: D.lang, accent: D.accent, template: D.template }; D = Object.assign(BLANK(), keep); withSample(D, k || 'dev'); D.surat = suratTemplate(D.lang); save(); buildForm(); paint(); },
  get template() { return D.template; },
  setTemplate(t) { D.template = t; save(); renderTplBar(); paint(); },
  setMode(m) { D.mode = m; if (m === 'surat' && !has(D.surat.isi)) D.surat = suratTemplate(D.lang); save(); refreshSwitches(); buildForm(); paint(); },
  setLang(l) { D.lang = l; save(); refreshSwitches(); paint(); },
};
