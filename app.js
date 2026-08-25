// Rakit CV — pembuat CV ramah-ATS. Form → pratinjau A4 real-time → unduh PDF (teks asli via print).
// Semua di browser; data tersimpan di localStorage perangkat. Tanpa server, tanpa login.

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'rakitcv-v1';

const ACCENTS = [
  { name: 'Terakota', paper: '#f7f4ec', accent: '#b5502f' },
  { name: 'Biru Laut', paper: '#f4f6fb', accent: '#2f5fb5' },
  { name: 'Hijau Hutan', paper: '#f3f6f2', accent: '#2f7d4f' },
  { name: 'Plum', paper: '#f7f3f7', accent: '#8a3f7a' },
  { name: 'Grafit', paper: '#f5f5f4', accent: '#3a3a3a' },
];

const BLANK = () => ({
  accent: 0,
  nama: '', gelar: '', kota: '', email: '', telepon: '', web: '', github: '', linkedin: '',
  ringkasan: '',
  pengalaman: [], proyek: [], pendidikan: [], keahlian: [], sertifikat: [], bahasa: [],
});

const SAMPLE = {
  accent: 0,
  nama: 'Nadia Pratama', gelar: 'Frontend Developer · UI Engineer',
  kota: 'Bandung, Indonesia', email: 'nadia.pratama@email.com', telepon: '+62 812-3456-7890',
  web: 'nadiapratama.dev', github: 'github.com/nadiapratama', linkedin: 'linkedin.com/in/nadiapratama',
  ringkasan: 'Frontend developer dengan 4 tahun pengalaman membangun antarmuka web yang cepat dan mudah diakses. Terbiasa bekerja dari desain sampai produksi menggunakan React dan TypeScript, dengan perhatian pada performa, aksesibilitas, dan pengalaman pengguna. Terbiasa berkolaborasi lintas tim dan mengirim fitur secara berkala.',
  pengalaman: [
    { posisi: 'Frontend Developer', instansi: 'PT Karya Digital Nusantara', meta: 'Bandung · Hybrid', mulai: 'Jan 2023', selesai: 'Sekarang', poin: 'Membangun ulang dasbor analitik dengan React + TypeScript, menurunkan waktu muat awal 45%\nMemimpin migrasi design system ke komponen reusable yang dipakai 6 tim produk\nMenerapkan pengujian otomatis (Vitest, Playwright) hingga cakupan 80%' },
    { posisi: 'Web Developer', instansi: 'Startup EduTech Cerdas', meta: 'Remote', mulai: 'Jul 2021', selesai: 'Des 2022', poin: 'Mengembangkan halaman pembelajaran interaktif yang melayani 20.000+ siswa aktif bulanan\nMengoptimalkan skor Lighthouse dari 62 menjadi 96 pada halaman utama' },
  ],
  proyek: [
    { nama: 'Katalog UMKM', tech: 'React · Vite · Supabase', ket: 'Aplikasi katalog produk untuk usaha kecil dengan admin sederhana dan tombol pesan WhatsApp.', tautan: 'github.com/nadiapratama/katalog-umkm' },
  ],
  pendidikan: [
    { jurusan: 'S1 Teknik Informatika', kampus: 'Universitas Padjadjaran', meta: 'Bandung', mulai: '2017', selesai: '2021' },
  ],
  keahlian: [
    { label: 'Bahasa', isi: 'TypeScript · JavaScript · HTML · CSS' },
    { label: 'Frontend', isi: 'React · Next.js · Tailwind CSS · Vite' },
    { label: 'Alat', isi: 'Git · Figma · Vitest · Playwright' },
  ],
  sertifikat: [
    { nama: 'Meta Front-End Developer', penerbit: 'Meta / Coursera', tahun: '2023' },
  ],
  bahasa: [
    { nama: 'Indonesia', level: 'Native' },
    { nama: 'Inggris', level: 'Professional' },
  ],
};

let D = load() || BLANK();

function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { } }

// ---------- definisi seksi berulang ----------
const REPEAT = {
  pengalaman: {
    label: 'entri', add: 'Tambah Pengalaman',
    fields: [
      ['posisi', 'Posisi / Jabatan', 'text', 'mis. Frontend Developer'],
      ['instansi', 'Perusahaan / Instansi', 'text', 'mis. PT Karya Digital'],
      ['meta', 'Lokasi / Tipe', 'text', 'mis. Bandung · Remote'],
      ['__row', 'mulai', 'selesai'],
      ['mulai', 'Mulai', 'text', 'mis. Jan 2023'],
      ['selesai', 'Selesai', 'text', 'mis. Sekarang'],
      ['poin', 'Pencapaian (satu per baris)', 'area', 'Tulis capaian terukur, satu poin per baris…'],
    ],
  },
  proyek: {
    label: 'proyek', add: 'Tambah Proyek',
    fields: [
      ['nama', 'Nama Proyek', 'text', 'mis. Katalog UMKM'],
      ['tech', 'Teknologi', 'text', 'mis. React · Supabase'],
      ['ket', 'Deskripsi singkat', 'area', 'Apa proyeknya & dampaknya…'],
      ['tautan', 'Tautan (opsional)', 'text', 'github.com/…'],
    ],
  },
  pendidikan: {
    label: 'pendidikan', add: 'Tambah Pendidikan',
    fields: [
      ['jurusan', 'Jurusan / Program', 'text', 'mis. S1 Teknik Informatika'],
      ['kampus', 'Institusi', 'text', 'mis. Universitas Padjadjaran'],
      ['meta', 'Lokasi / Catatan', 'text', 'mis. Bandung · IPK 3.8'],
      ['__row', 'mulai', 'selesai'],
      ['mulai', 'Mulai', 'text', '2017'],
      ['selesai', 'Selesai', 'text', '2021'],
    ],
  },
  keahlian: {
    label: 'kategori', add: 'Tambah Kategori Keahlian',
    fields: [
      ['label', 'Kategori', 'text', 'mis. Frontend'],
      ['isi', 'Keahlian (pisahkan dengan · atau koma)', 'area', 'React · Next.js · Tailwind'],
    ],
  },
  sertifikat: {
    label: 'sertifikat', add: 'Tambah Sertifikat',
    fields: [
      ['nama', 'Nama Sertifikat', 'text', 'mis. Certified Ethical Hacker'],
      ['__row', 'penerbit', 'tahun'],
      ['penerbit', 'Penerbit', 'text', 'mis. EC-Council'],
      ['tahun', 'Tahun', 'text', '2024'],
    ],
  },
  bahasa: {
    label: 'bahasa', add: 'Tambah Bahasa',
    fields: [
      ['__row', 'nama', 'level'],
      ['nama', 'Bahasa', 'text', 'mis. Inggris'],
      ['level', 'Tingkat', 'text', 'mis. Professional'],
    ],
  },
};

// ---------- bangun form ----------
function buildForm() {
  const f = $('#form');
  f.innerHTML = `
  <details class="sec" open>
    <summary><span class="ico">👤</span> Data Diri <span class="chev">▸</span></summary>
    <div class="sec-body">
      <div class="field"><label>Nama lengkap</label><input data-k="nama" value="${esc(D.nama)}" placeholder="mis. Nadia Pratama"></div>
      <div class="field"><label>Gelar / Peran profesional</label><input data-k="gelar" value="${esc(D.gelar)}" placeholder="mis. Frontend Developer · UI Engineer"></div>
      <div class="row2">
        <div class="field"><label>Kota, Negara</label><input data-k="kota" value="${esc(D.kota)}" placeholder="Bandung, Indonesia"></div>
        <div class="field"><label>Telepon</label><input data-k="telepon" value="${esc(D.telepon)}" placeholder="+62 …"></div>
      </div>
      <div class="field"><label>Email</label><input data-k="email" value="${esc(D.email)}" placeholder="nama@email.com"></div>
      <div class="row2">
        <div class="field"><label>Website</label><input data-k="web" value="${esc(D.web)}" placeholder="situskamu.com"></div>
        <div class="field"><label>GitHub</label><input data-k="github" value="${esc(D.github)}" placeholder="github.com/…"></div>
      </div>
      <div class="field"><label>LinkedIn</label><input data-k="linkedin" value="${esc(D.linkedin)}" placeholder="linkedin.com/in/…"></div>
      <div class="field"><label>Warna aksen</label><div class="swatches" id="swatches"></div></div>
    </div>
  </details>

  <details class="sec" open>
    <summary><span class="ico">§</span> Ringkasan <span class="chev">▸</span></summary>
    <div class="sec-body">
      <div class="field"><textarea data-k="ringkasan" placeholder="2–4 kalimat: siapa kamu, keahlian inti, dan nilai yang kamu bawa…">${esc(D.ringkasan)}</textarea>
      <div class="hint">Tips ATS: sebut peran & keahlian kunci di sini — banyak pemindai membaca ringkasan lebih dulu.</div></div>
    </div>
  </details>

  ${sectionHTML('pengalaman', '💼', 'Pengalaman Kerja')}
  ${sectionHTML('proyek', '🚀', 'Proyek Pilihan')}
  ${sectionHTML('pendidikan', '🎓', 'Pendidikan')}
  ${sectionHTML('keahlian', '🧩', 'Keahlian')}
  ${sectionHTML('sertifikat', '📜', 'Sertifikasi')}
  ${sectionHTML('bahasa', '🌐', 'Bahasa')}

  <div class="atsbadge">✓ <div><b>CV ini ramah-ATS.</b> Satu kolom, judul seksi standar, teks asli (bukan gambar), tanpa foto/tabel yang membingungkan pemindai. Unduh PDF lalu tempel isinya di Notepad untuk memastikan semua teks terbaca rapi.</div></div>
  `;
  renderSwatches();
  bindForm();
}

function sectionHTML(kind, ico, title) {
  const cfg = REPEAT[kind];
  const items = D[kind].map((it, i) => entryHTML(kind, it, i)).join('');
  return `<details class="sec" ${D[kind].length ? 'open' : ''}>
    <summary><span class="ico">${ico}</span> ${title} <span class="chev">▸</span></summary>
    <div class="sec-body">
      <div data-list="${kind}">${items}</div>
      <button class="addbtn" data-add="${kind}">+ ${cfg.add}</button>
    </div>
  </details>`;
}

function entryHTML(kind, it, i) {
  const cfg = REPEAT[kind];
  let html = `<div class="entry" data-entry="${kind}" data-i="${i}">
    <div class="entry-head"><span class="t">#${i + 1}</span><span class="sp"></span>
      <button class="mini" data-move="${kind}" data-dir="-1" data-i="${i}" title="Naik">↑</button>
      <button class="mini" data-move="${kind}" data-dir="1" data-i="${i}" title="Turun">↓</button>
      <button class="mini del" data-del="${kind}" data-i="${i}" title="Hapus">✕</button>
    </div>`;
  for (let fi = 0; fi < cfg.fields.length; fi++) {
    const fld = cfg.fields[fi];
    if (fld[0] === '__row') continue; // penanda (dipakai untuk grouping visual bawah)
    const [k, lbl, type, ph] = fld;
    const val = esc(it[k] || '');
    const inRow = cfg.fields.some(r => r[0] === '__row' && (r[1] === k || r[2] === k));
    const field = type === 'area'
      ? `<div class="field"><label>${lbl}</label><textarea data-ek="${kind}" data-i="${i}" data-f="${k}" placeholder="${esc(ph)}">${val}</textarea></div>`
      : `<div class="field"><label>${lbl}</label><input data-ek="${kind}" data-i="${i}" data-f="${k}" value="${val}" placeholder="${esc(ph)}"></div>`;
    if (inRow && (fld[0] === cfg.fields.find(r => r[0] === '__row' && (r[1] === k || r[2] === k))[1])) {
      // buka row2: cari pasangannya
      const rowDef = cfg.fields.find(r => r[0] === '__row' && (r[1] === k || r[2] === k));
      const otherK = rowDef[1] === k ? rowDef[2] : rowDef[1];
      const oFld = cfg.fields.find(r => r[0] === otherK);
      const oVal = esc(it[otherK] || '');
      html += `<div class="row2">${field}<div class="field"><label>${oFld[1]}</label><input data-ek="${kind}" data-i="${i}" data-f="${otherK}" value="${oVal}" placeholder="${esc(oFld[3])}"></div></div>`;
    } else if (!inRow) {
      html += field;
    }
  }
  html += `</div>`;
  return html;
}

// ---------- swatch warna ----------
function renderSwatches() {
  const box = $('#swatches'); if (!box) return;
  box.innerHTML = ACCENTS.map((a, i) =>
    `<div class="sw ${i === D.accent ? 'on' : ''}" data-acc="${i}" title="${a.name}" style="background:${a.accent}"></div>`).join('');
  box.querySelectorAll('.sw').forEach(s => s.addEventListener('click', () => {
    D.accent = +s.dataset.acc; save(); renderSwatches(); paint();
  }));
}

// ---------- binding ----------
function bindForm() {
  $('#form').querySelectorAll('[data-k]').forEach(inp => {
    inp.addEventListener('input', () => { D[inp.dataset.k] = inp.value; save(); paint(); });
  });
  $('#form').querySelectorAll('[data-ek]').forEach(inp => {
    inp.addEventListener('input', () => { D[inp.dataset.ek][+inp.dataset.i][inp.dataset.f] = inp.value; save(); paint(); });
  });
  $('#form').querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.add; D[k].push({}); save(); buildForm(); paint();
    // buka details terkait tetap open (buildForm sudah open jika ada isi)
  }));
  $('#form').querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    D[b.dataset.del].splice(+b.dataset.i, 1); save(); buildForm(); paint();
  }));
  $('#form').querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.move, i = +b.dataset.i, dir = +b.dataset.dir, arr = D[k];
    const j = i + dir; if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]]; save(); buildForm(); paint();
  }));
}

// ---------- render CV ----------
const has = v => v && String(v).trim() !== '';
function contactLine() {
  const parts = [];
  if (has(D.kota)) parts.push(esc(D.kota));
  if (has(D.email)) parts.push(esc(D.email));
  if (has(D.telepon)) parts.push(esc(D.telepon));
  if (has(D.web)) parts.push(esc(D.web));
  if (has(D.github)) parts.push(esc(D.github));
  if (has(D.linkedin)) parts.push(esc(D.linkedin));
  return parts.join('<span class="sl">/</span>');
}
function summaryHTML() {
  const s = (D.ringkasan || '').trim(); if (!s) return '';
  const m = s.match(/^(.*?[.!?])(\s+)([\s\S]*)$/);
  if (m) return `<span class="lead">${esc(m[1])}</span> ${esc(m[3])}`;
  return esc(s);
}
function sec(title, inner) { return `<div class="cv-sec"><div class="cv-h"><span class="pilcrow">§</span> ${title}<span class="cv-h-rule"></span></div>${inner}</div>`; }

function paint() {
  const a = ACCENTS[D.accent] || ACCENTS[0];
  const p = $('#paper');
  p.style.setProperty('--paper', a.paper);
  p.style.setProperty('--accent', a.accent);
  p.style.background = a.paper;

  let html = '';
  html += `<div class="cv-name">${esc(D.nama) || '<span class="cv-empty">Nama Lengkap</span>'}</div>`;
  if (has(D.gelar)) html += `<div class="cv-title">${esc(D.gelar)}</div>`;
  const cl = contactLine();
  if (cl) html += `<div class="cv-contact">${cl}</div>`;
  html += `<div class="cv-head-rule"></div>`;

  if (has(D.ringkasan)) html += sec('Ringkasan', `<div class="cv-summary">${summaryHTML()}</div>`);

  if (D.pengalaman.length) {
    const inner = D.pengalaman.map(e => {
      if (!has(e.posisi) && !has(e.instansi)) return '';
      const date = [e.mulai, e.selesai].filter(has).join(' — ');
      const meta = [e.instansi, e.meta].filter(has).map((x, i) => i === 0 ? esc(x) : `<i>${esc(x)}</i>`).join(' · ');
      const bul = (e.poin || '').split('\n').map(x => x.trim()).filter(Boolean)
        .map(x => `<li>${esc(x)}</li>`).join('');
      return `<div class="cv-entry"><div class="er"><div class="et">${esc(e.posisi) || ''}</div>${date ? `<div class="ed">${esc(date)}</div>` : ''}</div>
        ${meta ? `<div class="em">${meta}</div>` : ''}${bul ? `<ul class="cv-bul">${bul}</ul>` : ''}</div>`;
    }).join('');
    if (inner.trim()) html += sec('Pengalaman', inner);
  }

  if (D.proyek.length) {
    const inner = D.proyek.map(e => {
      if (!has(e.nama)) return '';
      return `<div class="cv-entry cv-proj"><div class="er"><div class="et">${esc(e.nama)}</div>${has(e.tech) ? `<div class="ed">${esc(e.tech)}</div>` : ''}</div>
        ${has(e.ket) ? `<div class="pd">${esc(e.ket)}</div>` : ''}${has(e.tautan) ? `<div class="pd" style="color:#6f6a5f">${esc(e.tautan)}</div>` : ''}</div>`;
    }).join('');
    if (inner.trim()) html += sec('Proyek Pilihan', inner);
  }

  if (D.pendidikan.length) {
    const inner = D.pendidikan.map(e => {
      if (!has(e.jurusan) && !has(e.kampus)) return '';
      const date = [e.mulai, e.selesai].filter(has).join(' — ');
      const meta = [e.kampus, e.meta].filter(has).map((x, i) => i === 0 ? esc(x) : `<i>${esc(x)}</i>`).join(' · ');
      return `<div class="cv-entry"><div class="er"><div class="et">${esc(e.jurusan) || ''}</div>${date ? `<div class="ed">${esc(date)}</div>` : ''}</div>
        ${meta ? `<div class="em">${meta}</div>` : ''}</div>`;
    }).join('');
    if (inner.trim()) html += sec('Pendidikan', inner);
  }

  if (D.keahlian.length) {
    const rows = D.keahlian.filter(e => has(e.label) || has(e.isi))
      .map(e => `<dt>${esc(e.label)}</dt><dd>${esc(e.isi)}</dd>`).join('');
    if (rows) html += sec('Keahlian', `<dl class="cv-skill">${rows}</dl>`);
  }

  if (D.sertifikat.length) {
    const rows = D.sertifikat.filter(e => has(e.nama)).map(e => {
      const r = [e.penerbit, e.tahun].filter(has).join(' · ');
      return `<div class="cv-line"><span class="n">${esc(e.nama)}</span>${r ? `<span class="r">${esc(r)}</span>` : ''}</div>`;
    }).join('');
    if (rows) html += sec('Sertifikasi', rows);
  }

  if (D.bahasa.length) {
    const items = D.bahasa.filter(e => has(e.nama)).map(e =>
      `<span class="lg"><b>${esc(e.nama)}</b>${has(e.level) ? `<span>${esc(e.level)}</span>` : ''}</span>`).join('');
    if (items) html += sec('Bahasa', `<div class="cv-langs">${items}</div>`);
  }

  p.innerHTML = html;
  updatePageFlag();
}

// ---------- indikator jumlah halaman ----------
function updatePageFlag() {
  const p = $('#paper');
  const pageH = 1123; // px A4 @96dpi
  const n = Math.max(1, Math.ceil((p.scrollHeight + 1) / pageH));
  const flag = $('#pageflag');
  if (n === 1) { flag.className = 'pageflag'; flag.textContent = '1 halaman · panjang ideal'; }
  else if (n === 2) { flag.className = 'pageflag'; flag.textContent = '2 halaman'; }
  else { flag.className = 'pageflag warn'; flag.textContent = n + ' halaman · pertimbangkan meringkas'; }
}

// ---------- zoom pratinjau ----------
let zoom = 1;
function applyZoom() { $('#paper').style.transform = `scale(${zoom})`; $('#paper').style.transformOrigin = 'top center'; }
$('#zin').addEventListener('click', () => { zoom = Math.min(1.4, zoom + .1); applyZoom(); });
$('#zout').addEventListener('click', () => { zoom = Math.max(.4, zoom - .1); applyZoom(); });
function fitZoom() {
  if (innerWidth <= 900) { const w = $('#preview').clientWidth - 28; zoom = Math.min(1, w / 794); applyZoom(); }
}
addEventListener('resize', fitZoom);

// ---------- aksi topbar ----------
// Klon CV ke #printroot (anak langsung body) sebelum cetak — lepas dari grid & filter shell
// yang membuat print blank. Menutupi tombol Unduh maupun Ctrl+P.
function syncPrintRoot() {
  const src = $('#paper');
  const a = ACCENTS[D.accent] || ACCENTS[0];
  $('#printroot').innerHTML = `<div class="cvpaper" style="--paper:${a.paper};--accent:${a.accent};background:${a.paper}">${src.innerHTML}</div>`;
}
addEventListener('beforeprint', syncPrintRoot);
$('#bpdf').addEventListener('click', () => {
  syncPrintRoot();
  const nm = (D.nama || 'CV').trim().replace(/\s+/g, '-');
  const prev = document.title;
  document.title = 'CV-' + nm;                      // Chrome memakai title sbg nama file "Save as PDF"
  const done = () => { document.title = prev; removeEventListener('afterprint', done); };
  addEventListener('afterprint', done);
  setTimeout(print, 80);
});
$('#bsample').addEventListener('click', () => {
  if (confirm('Ganti isi form dengan data contoh? Isian sekarang akan tergantikan.')) {
    D = JSON.parse(JSON.stringify(SAMPLE)); save(); buildForm(); paint();
  }
});
$('#bclear').addEventListener('click', () => {
  if (confirm('Kosongkan semua isian? Tindakan ini tidak bisa dibatalkan.')) {
    D = BLANK(); save(); buildForm(); paint();
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
  r.onload = () => { try { const obj = JSON.parse(r.result); D = Object.assign(BLANK(), obj); save(); buildForm(); paint(); } catch (err) { alert('File JSON tidak valid.'); } };
  r.readAsText(file); e.target.value = '';
});

// ---------- tab mobile ----------
$('#tabEdit').addEventListener('click', () => { document.body.dataset.tab = 'edit'; $('#tabEdit').classList.add('on'); $('#tabPrev').classList.remove('on'); });
$('#tabPrev').addEventListener('click', () => { document.body.dataset.tab = 'preview'; $('#tabPrev').classList.add('on'); $('#tabEdit').classList.remove('on'); fitZoom(); });

// ---------- start ----------
if (!load()) D = JSON.parse(JSON.stringify(SAMPLE)); // pengunjung baru: tampilkan contoh biar langsung paham
buildForm();
paint();
fitZoom();

// status QA
window.__CV = {
  get name() { return D.nama; },
  get sections() { return $('#paper').querySelectorAll('.cv-sec').length; },
  get pageText() { return $('#paper').innerText; },
  load(obj) { D = Object.assign(BLANK(), obj); save(); buildForm(); paint(); },
  sample() { D = JSON.parse(JSON.stringify(SAMPLE)); save(); buildForm(); paint(); },
};
