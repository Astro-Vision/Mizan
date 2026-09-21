"use client"

import * as React from "react"

export type Language = "id" | "en"

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  isEnglish: boolean
  t: (text: string) => string
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

const ENGLISH: Record<string, string> = {
  Zakat: "Zakat",
  Kampanye: "Campaigns",
  "Cara Kerja": "How It Works",
  Transparansi: "Transparency",
  "Tanya Jawab": "FAQ",
  "Hubungkan Dompet": "Connect Wallet",
  "Tutup menu": "Close menu",
  "Buka menu": "Open menu",
  "Mizan — kembali ke beranda": "Mizan — back to home",
  "Navigasi utama": "Main navigation",
  "Navigasi seluler": "Mobile navigation",
  "Memuat…": "Loading…",
  "Akun terhubung": "Connected account",
  Keluar: "Log out",
  "Zakat & donasi on-chain": "Zakat & on-chain donations",
  "Setiap dana punya jejaknya.": "Every donation leaves a trace.",
  "Setiap dana punya": "Every donation leaves a",
  "jejaknya.": "trace.",
  "Donasi masuk ke kontrak pintar di BNB Smart Chain, bukan ke rekening kami. Setiap pencairan ke penerima tercatat di blockchain dan bisa kamu periksa sendiri — kapan saja, tanpa perlu izin siapa pun.":
    "Donations go to a smart contract on BNB Smart Chain, not our bank account. Every payout to a recipient is recorded on-chain and can be checked by anyone, anytime, without permission.",
  "Donasi Sekarang": "Donate Now",
  "Lihat Alur Dana": "View Fund Flow",
  "Data uji testnet": "Testnet data",
  "Dana ditahan kontrak": "Funds held by contract",
  "Tanpa perantara": "No middleman",
  "Bukti on-chain": "On-chain proof",
  "Jaringan uji": "Test network",
  "BNB Smart Chain Testnet, bukan mainnet.":
    "BNB Smart Chain Testnet, not mainnet.",
  "Transaksi tercatat": "Recorded transactions",
  "Setiap donasi dan penyaluran membuat jejak permanen.":
    "Every donation and payout creates a permanent trace.",
  "Pencairan bertahap": "Milestone payouts",
  "Dana keluar hanya setelah bukti penyaluran diverifikasi.":
    "Funds are released only after payout evidence is verified.",
  "Periksa di BscScan": "Check on BscScan",
  "Kategori penyaluran": "Distribution categories",
  "Aturan penyalurannya beda, jadi dipisah.":
    "Different distribution rules deserve separate paths.",
  "Zakat punya ketentuan penerima yang ketat; donasi umum tidak. Mencampur keduanya dalam satu keranjang justru menyulitkan pertanggungjawaban.":
    "Zakat has strict recipient rules; general donations do not. Keeping them separate makes accountability easier.",
  "8 asnaf": "8 asnaf",
  "Ditakar sesuai nisab dan disalurkan ke golongan yang berhak.":
    "Measured by nisab and distributed to eligible recipients.",
  "Bantuan pendidikan untuk 40 anak yatim di Lombok Timur":
    "Education support for 40 orphans in East Lombok",
  "Biaya sekolah, seragam, dan perlengkapan belajar selama satu tahun ajaran untuk 40 anak. Dana dicairkan tiga kali, mengikuti bukti penerimaan dari sekolah.":
    "School fees, uniforms, and learning supplies for 40 children for one academic year. Funds are released in three stages after the school confirms receipt.",
  "Komunitas pendidikan yang mendampingi anak yatim dan keluarga rentan di Lombok Timur.":
    "An education community supporting orphans and vulnerable families in East Lombok.",
  "Air bersih untuk 120 kepala keluarga di Sumba Timur":
    "Clean water for 120 families in East Sumba",
  "Sumur bor dan penampungan air untuk tiga dusun yang selama ini menempuh 4 km untuk mengambil air.":
    "A borewell and water reservoir for three villages whose residents currently walk 4 km to collect water.",
  "Relawan lokal yang memperjuangkan akses air bersih untuk keluarga di Sumba Timur.":
    "Local volunteers working to provide clean water access for families in East Sumba.",
  "Modal usaha untuk 25 ibu tunggal di Bantul":
    "Business capital for 25 single mothers in Bantul",
  "Zakat produktif berupa modal dan pendampingan usaha selama enam bulan, disalurkan bertahap per kelompok.":
    "Productive zakat in the form of business capital and six months of mentoring, distributed in group stages.",
  "Komunitas pendamping usaha mikro yang membantu ibu tunggal membangun penghasilan yang berkelanjutan.":
    "A microbusiness community helping single mothers build sustainable income.",
  "Logistik tiga posko pengungsian di Cianjur":
    "Logistics for three evacuation posts in Cianjur",
  "Tenda, air bersih, dan dapur umum untuk tiga posko. Pencairan mengikuti kuitansi harian dari koordinator lapangan.":
    "Tents, clean water, and community kitchens for three evacuation posts. Payouts follow daily receipts from field coordinators.",
  "Jaringan relawan yang menyalurkan bantuan darurat secara langsung ke posko pengungsian.":
    "A volunteer network delivering emergency aid directly to evacuation posts.",
  "Donasi Umum": "General Donation",
  Wakaf: "Waqf",
  "Tanggap Bencana": "Disaster Relief",
  Bebas: "Flexible",
  "Aset tetap": "Fixed asset",
  Mendesak: "Urgent",
  "Untuk kebutuhan mendesak yang tidak masuk ketentuan zakat.":
    "For urgent needs outside zakat distribution rules.",
  "Pokoknya dijaga, manfaatnya mengalir jangka panjang.":
    "The principal is preserved while its benefits continue long term.",
  "Pencairan dipercepat dengan verifikasi dua tahap.":
    "Payouts are accelerated with two-step verification.",
  "Yang sedang berjalan": "Active campaigns",
  "Pilih kampanye yang ingin kamu dukung. Setiap pencairan tercatat dan dapat diperiksa siapa pun.":
    "Choose a campaign to support. Every payout is recorded and open for anyone to verify.",
  "Lihat semua kampanye": "View all campaigns",
  "Lihat kampanye": "View campaign",
  sisa: "left",
  hari: "days",
  target: "target",
  terkonversi: "converted",
  tercapai: "reached",
  donatur: "donors",
  Profil: "Profile",
  "Yayasan terverifikasi": "Verified foundation",
  "Komunitas lokal terverifikasi": "Verified local community",
  "Data community terverifikasi": "Verified data community",
  "Relawan terverifikasi": "Verified volunteers",
  "Cara kerja + transparansi": "How it works + transparency",
  "Dari dompet sampai penerima, setiap langkah punya jejak.":
    "From wallet to recipient, every step leaves a trace.",
  "Ikuti perjalanan satu donasi. Gulir perlahan untuk melihat apa yang terjadi pada dana kamu di setiap tahap.":
    "Follow one donation from start to finish. Scroll slowly to see what happens to your funds at every stage.",
  "Scroll untuk menjelajah": "Scroll to explore",
  "Mulai dari sini": "Start here",
  "Transaksi pertama": "First transaction",
  "Tercatat on-chain": "Recorded on-chain",
  "Sebelum dana cair": "Before funds are released",
  "Selesai disalurkan": "Successfully distributed",
  "Hubungkan dompet": "Connect your wallet",
  "Donasi masuk ke kontrak": "Donation enters the contract",
  "Kontrak mencatat niat": "The contract records intent",
  "Bukti penyaluran diverifikasi": "Distribution evidence is verified",
  "Dana sampai ke penerima": "Funds reach the recipient",
  Langkah: "STEP",
  "Buka contoh transaksi": "Open example transaction",
  "Cukup dompet yang mendukung BNB Smart Chain. Tidak ada pendaftaran, tidak ada unggah KTP.":
    "All you need is a wallet that supports BNB Smart Chain. No registration and no ID upload.",
  "Tidak ada data pribadi yang disimpan.": "No personal data is stored.",
  "Dana tidak masuk ke rekening kami. Dana masuk ke kontrak pintar yang alamatnya bisa kamu periksa sendiri di BscScan.":
    "Funds do not enter our account. They go to a smart contract whose address you can check on BscScan.",
  "Dana tidak masuk ke rekening pengelola. Donasi langsung dikirim ke kontrak pintar yang alamatnya terbuka untuk diperiksa.":
    "Funds do not enter an operator account. Donations go directly to a smart contract with a public address.",
  "Setiap kiriman meninggalkan transaksi yang bisa ditelusuri.":
    "Every transfer leaves a traceable transaction.",
  "Kontrak menahan dana dan mencatat tujuan donasi. Tidak ada pihak yang bisa memindahkan dana secara sepihak.":
    "The contract holds the funds and records the donation purpose. No party can move funds unilaterally.",
  "Alamat kontrak dan blok transaksi tersedia untuk audit publik.":
    "The contract address and transaction block are available for public audit.",
  "Pencairan tertahan sampai bukti dan milestone terpenuhi.":
    "Payouts remain locked until evidence and milestones are complete.",
  "Penyelenggara mengunggah bukti penyaluran. Setelah diverifikasi, dana cair ke dompet penerima — bukan ke dompet pengelola.":
    "The organizer uploads distribution evidence. Once verified, funds go to the recipient wallet — not the operator wallet.",
  "Sisa dana yang tidak tersalur dikembalikan ke donatur.":
    "Undistributed funds are returned to donors.",
  "Hash transaksi tujuan bisa dibuka siapa pun di explorer.":
    "Anyone can open the destination transaction hash in the explorer.",
  "Yang dibutuhkan": "What you need",
  "Dompet BNB Smart Chain": "A BNB Smart Chain wallet",
  "Data pribadi": "Personal data",
  "Tidak ada pendaftaran": "No registration",
  Pengirim: "Sender",
  "Nilai demo": "Demo value",
  Kontrak: "Contract",
  "Blok demo": "Demo block",
  Status: "Status",
  "Menunggu bukti": "Awaiting evidence",
  Aturan: "Rule",
  "Milestone wajib lolos": "Milestone must pass",
  Penerima: "Recipient",
  "Suara dari lapangan": "A voice from the field",
  "Bukti penyaluran": "Distribution proof",
  "Penyaluran tahap": "Distribution stage",
  Diterima: "Received",
  "Penerima manfaat": "Beneficiaries",
  "Sekarang saya bisa lihat sendiri uangnya sampai ke mana. Dulu saya cuma bisa percaya pada kata-kata.":
    "Now I can see where the money goes. Before, I could only trust words.",
  "Koordinator lapangan, Lombok Timur": "Field coordinator, East Lombok",
  "Menerima penyaluran tahap kedua pada 14 Agustus. Bukti penyaluran dan transaksi pencairannya terbuka untuk diperiksa siapa pun.":
    "Received the second distribution on August 14. The distribution evidence and payout transaction are open for anyone to verify.",
  "Periksa transaksinya": "Check the transaction",
  "TANYA JAWAB": "FAQ",
  "Jawaban untuk hal yang paling penting.": "Answers to what matters most.",
  "Apa yang membuat ini beda dari platform donasi biasa?":
    "What makes this different from a regular donation platform?",
  "Di platform biasa, kamu menyerahkan dana lalu tidak bisa melihat lagi ke mana perginya. Di sini dana masuk ke kontrak pintar yang alamatnya publik, dan setiap pencairan ke penerima tercatat sebagai transaksi yang bisa kamu periksa sendiri kapan saja.":
    "On a regular platform, you give money and cannot see where it goes. Here, funds enter a smart contract with a public address, and every payout is recorded as a transaction you can check anytime.",
  "Apakah pengelola bisa membawa kabur dananya?":
    "Can the operator take the funds?",
  "Tidak sepihak. Dana ditahan kontrak, bukan ditahan orang. Pencairan hanya bisa terjadi bila syarat milestone terpenuhi, dan alasannya tercatat di blockchain. Kalau kampanye gagal mencapai target, dana dikembalikan ke donatur.":
    "Not unilaterally. Funds are held by the contract, not a person. Payouts can happen only when milestone conditions are met, with the reason recorded on-chain. If a campaign misses its target, funds are returned to donors.",
  "Bagaimana kalau laporan penyalurannya palsu?":
    "What if the distribution report is false?",
  "Setiap laporan wajib disertai bukti yang bisa ditelusuri — kuitansi, foto berlokasi, atau tanda terima penerima. Bukti yang tidak lolos verifikasi membuat pencairan tertahan, bukan otomatis cair. Verifikasi otomatis akan ditangani agen AI pada tahap berikutnya; untuk sekarang prosesnya masih manual dan setiap keputusan dicatat.":
    "Every report must include traceable evidence — receipts, geotagged photos, or recipient acknowledgements. Evidence that fails verification keeps the payout locked. Automated verification may come later; for now the process is manual and every decision is recorded.",
  "Apakah saya harus paham kripto untuk ikut?":
    "Do I need to understand crypto to participate?",
  "Tidak perlu paham. Kamu perlu satu dompet yang mendukung BNB Smart Chain, dan hanya itu. Istilah seperti biaya jaringan akan ditampilkan dalam bentuk angka yang jelas sebelum kamu menekan tombol konfirmasi.":
    "No. You only need a wallet that supports BNB Smart Chain. Network fees and other terms are shown as clear numbers before you confirm.",
  "Apakah ini sudah dipakai untuk dana sungguhan?":
    "Is this already used for real funds?",
  "Belum. Seluruh data di halaman ini berjalan di BNB Smart Chain Testnet — jaringan uji yang dananya tidak punya nilai. Kami tidak akan mengumpulkan dana nyata sebelum kontraknya selesai diaudit pihak ketiga.":
    "Not yet. All data on this page runs on BNB Smart Chain Testnet, where funds have no real value. We will not collect real funds before a third-party audit is complete.",
  "Berapa biaya yang dipotong?": "How much is deducted in fees?",
  "Hanya biaya jaringan dari blockchain, yang langsung dibayarkan ke jaringan — bukan ke kami. Tidak ada potongan pengelola pada versi ini, dan kalau nanti ada, besarnya harus tertulis di kontrak sehingga tidak bisa diubah diam-diam.":
    "Only the blockchain network fee is charged directly by the network, not by us. This version has no operator fee; any future fee must be written in the contract and cannot be changed silently.",
  "Cari tahu bagaimana dana dijaga, dicatat, dan bisa kamu periksa sendiri sebelum mulai berdonasi.":
    "Learn how funds are protected, recorded, and independently verifiable before you donate.",
  "Cari pertanyaan": "Search questions",
  "Cari pertanyaan...": "Search questions...",
  Cari: "Search",
  "Topik bantuan": "Help topics",
  "Semua pertanyaan": "All questions",
  "Penggunaan umum": "General usage",
  "Keamanan dana": "Fund security",
  "Bukti & transparansi": "Proof & transparency",
  "Bantuan lainnya": "Other help",
  "Pertanyaan umum": "General questions",
  "jawaban tersedia": "answers available",
  "Belum ada jawaban yang cocok.": "No matching answers yet.",
  "Coba kata kunci lain atau pilih topik bantuan yang berbeda.":
    "Try another keyword or choose a different help topic.",
  Jelajahi: "Explore",
  Bantuan: "Help",
  "Tetap terhubung": "Stay connected",
  "Platform zakat dan donasi yang menaruh dana di kontrak pintar, bukan di rekening pengelola. Setiap pencairan tercatat dan bisa diperiksa siapa pun.":
    "A zakat and donation platform that puts funds in a smart contract, not an operator account. Every payout is recorded and open to everyone.",
  "Jejak dana dapat diaudit": "Fund trail is auditable",
  "Dapatkan kabar terbaru tentang kampanye dan transparansi Mizan.":
    "Get updates about Mizan campaigns and transparency.",
  "Email kamu...": "Your email...",
  "Email kamu": "Your email",
  "Daftar informasi Mizan": "Subscribe to Mizan updates",
  "Tidak ada spam. Hanya kabar penting tentang dana dan penerima.":
    "No spam. Only important updates about funds and recipients.",
  "Dokumentasi kontrak": "Contract documentation",
  "Kontrak di BscScan": "Contract on BscScan",
  "Data demo di BNB Smart Chain Testnet — dana tidak nyata.":
    "Demo data on BNB Smart Chain Testnet — funds have no real value.",
  "Jaringan uji · chain ID": "Test network · chain ID",
  "Kampanye terverifikasi": "Verified campaign",
  "Kembali ke kampanye": "Back to campaigns",
  "hari lagi": "days left",
  Terkumpul: "Raised",
  "Dana tercatat": "Recorded funds",
  "Kontrak publik": "Public contract",
  "Periksa jejak donasi": "Check the donation trail",
  "Kontrak publik di BNB Smart Chain Testnet.":
    "Public contract on BNB Smart Chain Testnet.",
  "Donasi sekarang": "Donate now",
  "Setiap donasi masuk ke kontrak pintar dan bisa ditelusuri melalui alamat kontrak publik. Penyaluran dilakukan berdasarkan bukti yang dapat diperiksa.":
    "Every donation enters a smart contract and can be traced through its public address. Distribution follows verifiable evidence.",
  "Buka BscScan": "Open BscScan",
  "Tentang kampanye": "About the campaign",
  "Dana yang sampai, bukan sekadar janji.":
    "Funds that arrive, not just promises.",
  "Profil komunitas": "Community profile",
  Terverifikasi: "Verified",
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("id")

  React.useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem("mizan-language", language)
  }, [language])

  const value = React.useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: Language) => setLanguageState(nextLanguage),
      isEnglish: language === "en",
      t: (text: string) => (language === "en" ? (ENGLISH[text] ?? text) : text),
    }),
    [language]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }

  return context
}
