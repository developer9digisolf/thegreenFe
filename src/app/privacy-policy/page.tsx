"use client";

import { useEffect } from "react";

export default function PrivacyPolicyPage() {
    useEffect(() => {
        document.title = "Privacy Policy - The Green Spa";
    }, []);

    const effectiveDate = "1 Maret 2026";
    const lastUpdated = "27 Februari 2026";
    const companyName = "CV. Digisoft Technology Consulting";
    const appName = "The Green Spa";
    const contactEmail = "info@thegreenspa.id";
    const websiteUrl = "https://thegreenspa.id";

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 30%)",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}>
            {/* Header */}
            <header style={{
                background: "white",
                borderBottom: "1px solid #e5e7eb",
                position: "sticky",
                top: 0,
                zIndex: 100,
                backdropFilter: "blur(12px)",
                backgroundColor: "rgba(255,255,255,0.9)"
            }}>
                <div style={{
                    maxWidth: 800,
                    margin: "0 auto",
                    padding: "16px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: "linear-gradient(135deg, #059669, #14b8a6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 800, fontSize: 18
                        }}>
                            G
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{appName}</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>Privacy Policy</div>
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        v1.0
                    </div>
                </div>
            </header>

            {/* Content */}
            <main style={{
                maxWidth: 800,
                margin: "0 auto",
                padding: "40px 24px 80px",
            }}>
                {/* Title */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{
                        fontSize: 32, fontWeight: 800, color: "#111827",
                        marginBottom: 8, lineHeight: 1.2
                    }}>
                        Kebijakan Privasi
                    </h1>
                    <p style={{
                        fontSize: 16, fontWeight: 500, color: "#059669",
                        marginBottom: 16
                    }}>
                        Privacy Policy
                    </p>
                    <div style={{
                        display: "flex", gap: 20, fontSize: 13, color: "#6b7280",
                        flexWrap: "wrap"
                    }}>
                        <span>📅 Berlaku: {effectiveDate}</span>
                        <span>🔄 Diperbarui: {lastUpdated}</span>
                    </div>
                </div>

                {/* Intro */}
                <Section>
                    <p>
                        Selamat datang di <strong>{appName}</strong>. Kami menghargai privasi Anda dan berkomitmen
                        untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan,
                        menggunakan, menyimpan, dan melindungi informasi Anda saat menggunakan aplikasi mobile dan
                        layanan kami.
                    </p>
                    <p>
                        Dengan mengunduh, menginstal, atau menggunakan aplikasi {appName}, Anda menyetujui
                        praktik yang dijelaskan dalam Kebijakan Privasi ini. Jika Anda tidak setuju dengan kebijakan ini,
                        mohon untuk tidak menggunakan aplikasi kami.
                    </p>
                </Section>

                {/* 1. Informasi yang Kami Kumpulkan */}
                <SectionTitle number="1" title="Informasi yang Kami Kumpulkan" />
                <Section>
                    <SubTitle>1.1 Informasi yang Anda Berikan Secara Langsung</SubTitle>
                    <p>Saat mendaftar dan menggunakan layanan kami, kami dapat mengumpulkan:</p>
                    <ul>
                        <li><strong>Data identitas:</strong> Nama lengkap, tanggal lahir, jenis kelamin</li>
                        <li><strong>Data kontak:</strong> Nomor telepon, alamat email</li>
                        <li><strong>Data akun:</strong> Informasi login, kata sandi (terenkripsi)</li>
                        <li><strong>Preferensi layanan:</strong> Preferensi perawatan tubuh, area tubuh yang perlu perhatian khusus atau dihindari, terapis favorit</li>
                        <li><strong>Riwayat transaksi:</strong> Detail pemesanan, riwayat pembayaran, voucher dan kredit</li>
                        <li><strong>Umpan balik:</strong> Rating dan ulasan yang Anda berikan untuk layanan dan terapis</li>
                    </ul>

                    <SubTitle>1.2 Informasi yang Dikumpulkan Secara Otomatis</SubTitle>
                    <p>Saat Anda menggunakan aplikasi kami, kami secara otomatis mengumpulkan:</p>
                    <ul>
                        <li><strong>Data perangkat:</strong> Model perangkat, sistem operasi, versi aplikasi</li>
                        <li><strong>Data penggunaan:</strong> Fitur yang digunakan, waktu akses, frekuensi penggunaan</li>
                        <li><strong>Token notifikasi:</strong> Untuk mengirimkan pemberitahuan push terkait pemesanan dan promosi</li>
                    </ul>

                    <SubTitle>1.3 Informasi yang Tidak Kami Kumpulkan</SubTitle>
                    <p>Kami <strong>tidak</strong> mengumpulkan:</p>
                    <ul>
                        <li>Data lokasi GPS secara real-time</li>
                        <li>Kontak dari buku telepon Anda</li>
                        <li>Foto atau media dari perangkat Anda (kecuali jika Anda secara eksplisit mengunggah foto profil)</li>
                        <li>Data biometrik (sidik jari, pengenalan wajah)</li>
                        <li>Rekaman audio atau video</li>
                    </ul>
                </Section>

                {/* 2. Penggunaan Informasi */}
                <SectionTitle number="2" title="Bagaimana Kami Menggunakan Informasi Anda" />
                <Section>
                    <p>Kami menggunakan informasi yang dikumpulkan untuk tujuan berikut:</p>
                    <ul>
                        <li><strong>Penyediaan layanan:</strong> Memproses pemesanan, menjadwalkan sesi perawatan, mengelola pembayaran dan voucher</li>
                        <li><strong>Personalisasi:</strong> Menyesuaikan rekomendasi layanan dan terapis berdasarkan preferensi Anda</li>
                        <li><strong>Komunikasi:</strong> Mengirimkan konfirmasi pemesanan, pengingat jadwal, dan notifikasi penting terkait akun Anda</li>
                        <li><strong>Peningkatan layanan:</strong> Menganalisis pola penggunaan untuk meningkatkan kualitas aplikasi dan layanan kami</li>
                        <li><strong>Promosi:</strong> Mengirimkan informasi promosi, penawaran khusus, dan program loyalitas (dengan persetujuan Anda)</li>
                        <li><strong>Keamanan:</strong> Mendeteksi dan mencegah penipuan, penyalahgunaan, atau aktivitas tidak sah</li>
                        <li><strong>Kepatuhan hukum:</strong> Memenuhi kewajiban hukum dan peraturan yang berlaku</li>
                    </ul>
                </Section>

                {/* 3. Penyimpanan dan Keamanan */}
                <SectionTitle number="3" title="Penyimpanan dan Keamanan Data" />
                <Section>
                    <SubTitle>3.1 Penyimpanan Data</SubTitle>
                    <p>
                        Data Anda disimpan di server yang aman dan berlokasi di Indonesia. Kami menyimpan data
                        pribadi Anda selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan kepada Anda.
                        Setelah akun dihapus, data Anda akan dihapus atau dianonimkan dalam waktu 90 hari kerja,
                        kecuali jika diperlukan untuk kewajiban hukum.
                    </p>

                    <SubTitle>3.2 Langkah Keamanan</SubTitle>
                    <p>Kami menerapkan langkah-langkah keamanan teknis dan organisasional untuk melindungi data Anda, termasuk:</p>
                    <ul>
                        <li>Enkripsi data saat transit (TLS/SSL) dan saat tersimpan</li>
                        <li>Hashing kata sandi menggunakan algoritma yang aman</li>
                        <li>Otentikasi berbasis token (JWT) dengan masa berlaku terbatas</li>
                        <li>Akses terbatas ke data pribadi hanya untuk personel yang berwenang</li>
                        <li>Pemantauan keamanan dan audit secara berkala</li>
                        <li>Pencadangan data secara rutin</li>
                    </ul>
                </Section>

                {/* 4. Pembagian Informasi */}
                <SectionTitle number="4" title="Pembagian Informasi kepada Pihak Ketiga" />
                <Section>
                    <p>Kami <strong>tidak menjual</strong> data pribadi Anda kepada pihak ketiga. Kami dapat membagikan informasi Anda hanya dalam situasi berikut:</p>
                    <ul>
                        <li><strong>Penyedia layanan:</strong> Terapis dan staf {appName} yang perlu mengakses informasi Anda untuk memberikan layanan perawatan</li>
                        <li><strong>Pemroses pembayaran:</strong> Penyedia layanan pembayaran pihak ketiga untuk memproses transaksi Anda secara aman</li>
                        <li><strong>Kewajiban hukum:</strong> Jika diwajibkan oleh hukum, perintah pengadilan, atau proses hukum yang berlaku</li>
                        <li><strong>Perlindungan hak:</strong> Untuk melindungi hak, properti, atau keselamatan kami, pengguna kami, atau publik</li>
                    </ul>
                    <p>
                        Pihak ketiga yang menerima data Anda diwajibkan untuk menjaga kerahasiaan dan keamanan
                        data sesuai dengan standar yang setara dengan kebijakan kami.
                    </p>
                </Section>

                {/* 5. Hak Pengguna */}
                <SectionTitle number="5" title="Hak-Hak Anda" />
                <Section>
                    <p>Sesuai dengan peraturan perlindungan data yang berlaku, Anda memiliki hak untuk:</p>
                    <ul>
                        <li><strong>Mengakses:</strong> Meminta salinan data pribadi Anda yang kami simpan</li>
                        <li><strong>Memperbaiki:</strong> Memperbarui atau mengoreksi data pribadi Anda yang tidak akurat</li>
                        <li><strong>Menghapus:</strong> Meminta penghapusan data pribadi Anda (dengan batasan tertentu)</li>
                        <li><strong>Membatasi:</strong> Meminta pembatasan pemrosesan data Anda dalam kondisi tertentu</li>
                        <li><strong>Portabilitas:</strong> Meminta data Anda dalam format yang dapat dibaca mesin</li>
                        <li><strong>Menarik persetujuan:</strong> Menarik persetujuan Anda kapan saja untuk pemrosesan data yang berdasarkan persetujuan</li>
                        <li><strong>Menolak pemasaran:</strong> Berhenti menerima komunikasi pemasaran dari kami</li>
                    </ul>
                    <p>
                        Untuk menggunakan hak-hak di atas, silakan hubungi kami melalui informasi kontak yang
                        tersedia di bagian bawah kebijakan ini. Kami akan merespons permintaan Anda dalam waktu 30 hari kerja.
                    </p>
                </Section>

                {/* 6. Penghapusan Akun */}
                <SectionTitle number="6" title="Penghapusan Akun dan Data" />
                <Section>
                    <p>Anda dapat meminta penghapusan akun dan data pribadi Anda dengan cara:</p>
                    <ul>
                        <li>Melalui menu <strong>Pengaturan → Hapus Akun</strong> di dalam aplikasi</li>
                        <li>Mengirimkan email permintaan ke <strong>{contactEmail}</strong></li>
                    </ul>
                    <p>
                        Setelah permintaan diterima, kami akan memproses penghapusan dalam waktu 30 hari kerja.
                        Data tertentu mungkin tetap disimpan jika diperlukan untuk kewajiban hukum, penyelesaian
                        sengketa, atau penegakan perjanjian kami. Data yang dipertahankan akan dianonimkan
                        sehingga tidak lagi dapat mengidentifikasi Anda.
                    </p>
                </Section>

                {/* 7. Cookie dan Teknologi Pelacakan */}
                <SectionTitle number="7" title="Cookie dan Teknologi Pelacakan" />
                <Section>
                    <p>
                        Aplikasi mobile kami tidak menggunakan cookie browser. Namun, kami menggunakan teknologi
                        penyimpanan lokal yang serupa (seperti token autentikasi) untuk menjaga sesi login Anda
                        dan preferensi penggunaan. Data ini disimpan secara lokal di perangkat Anda dan tidak
                        dibagikan kepada pihak ketiga.
                    </p>
                </Section>

                {/* 8. Layanan Pihak Ketiga */}
                <SectionTitle number="8" title="Layanan Pihak Ketiga" />
                <Section>
                    <p>Aplikasi kami dapat mengintegrasikan layanan pihak ketiga berikut:</p>
                    <ul>
                        <li><strong>Push Notification Service:</strong> Untuk mengirimkan notifikasi terkait pemesanan dan promosi</li>
                        <li><strong>Payment Gateway:</strong> Untuk memproses pembayaran secara aman</li>
                        <li><strong>Analytics:</strong> Untuk menganalisis penggunaan aplikasi dan meningkatkan layanan</li>
                    </ul>
                    <p>
                        Layanan pihak ketiga ini memiliki kebijakan privasi mereka sendiri yang mengatur pemrosesan
                        data mereka. Kami menyarankan Anda untuk membaca kebijakan privasi masing-masing layanan tersebut.
                    </p>
                </Section>

                {/* 9. Perlindungan Anak */}
                <SectionTitle number="9" title="Perlindungan Anak" />
                <Section>
                    <p>
                        Aplikasi {appName} tidak ditujukan untuk anak-anak di bawah usia 17 tahun. Kami tidak
                        secara sengaja mengumpulkan data pribadi dari anak-anak. Jika kami mengetahui bahwa kami
                        telah mengumpulkan data dari anak di bawah 17 tahun tanpa persetujuan orang tua yang dapat
                        diverifikasi, kami akan segera menghapus data tersebut.
                    </p>
                    <p>
                        Jika Anda adalah orang tua atau wali dan mengetahui bahwa anak Anda telah memberikan data
                        pribadi kepada kami, silakan hubungi kami agar kami dapat mengambil tindakan yang diperlukan.
                    </p>
                </Section>

                {/* 10. Perubahan Kebijakan */}
                <SectionTitle number="10" title="Perubahan pada Kebijakan Privasi" />
                <Section>
                    <p>
                        Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mencerminkan
                        perubahan pada praktik kami atau karena alasan operasional, hukum, atau peraturan lainnya.
                        Kami akan memberitahukan perubahan material melalui:
                    </p>
                    <ul>
                        <li>Notifikasi dalam aplikasi</li>
                        <li>Email ke alamat yang terdaftar</li>
                        <li>Pembaruan tanggal &quot;Terakhir diperbarui&quot; di halaman ini</li>
                    </ul>
                    <p>
                        Penggunaan berkelanjutan atas aplikasi kami setelah perubahan tersebut merupakan
                        persetujuan Anda terhadap Kebijakan Privasi yang diperbarui.
                    </p>
                </Section>

                {/* 11. Hukum yang Berlaku */}
                <SectionTitle number="11" title="Hukum yang Berlaku" />
                <Section>
                    <p>
                        Kebijakan Privasi ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia,
                        termasuk namun tidak terbatas pada:
                    </p>
                    <ul>
                        <li>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</li>
                        <li>Peraturan Pemerintah terkait Penyelenggaraan Sistem dan Transaksi Elektronik</li>
                    </ul>
                </Section>

                {/* 12. Hubungi Kami */}
                <SectionTitle number="12" title="Hubungi Kami" />
                <Section>
                    <p>
                        Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi ini
                        atau pemrosesan data pribadi Anda, silakan hubungi kami:
                    </p>
                    <div style={{
                        background: "#f0fdf4",
                        borderRadius: 16,
                        padding: "24px 28px",
                        marginTop: 16,
                        border: "1px solid #bbf7d0"
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "#059669", marginBottom: 16 }}>
                            {appName}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#374151" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <span style={{ width: 20, textAlign: "center" }}>🏢</span>
                                <span>Dikelola oleh {companyName}</span>
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <span style={{ width: 20, textAlign: "center" }}>📍</span>
                                <span>Medan, Sumatera Utara, Indonesia</span>
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <span style={{ width: 20, textAlign: "center" }}>✉️</span>
                                <a href={`mailto:${contactEmail}`} style={{ color: "#059669", textDecoration: "none", fontWeight: 600 }}>
                                    {contactEmail}
                                </a>
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <span style={{ width: 20, textAlign: "center" }}>🌐</span>
                                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#059669", textDecoration: "none", fontWeight: 600 }}>
                                    {websiteUrl}
                                </a>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Separator */}
                <div style={{
                    height: 1, background: "#e5e7eb",
                    margin: "48px 0 24px"
                }} />

                {/* Footer note */}
                <div style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "#9ca3af",
                    lineHeight: 1.8
                }}>
                    <p>
                        © {new Date().getFullYear()} {appName}. Seluruh hak cipta dilindungi.
                    </p>
                    <p>
                        Dikelola oleh {companyName}
                    </p>
                </div>
            </main>
        </div>
    );
}

// ============================================
// SUB COMPONENTS
// ============================================

function SectionTitle({ number, title }: { number: string; title: string }) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 40,
            marginBottom: 12
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #059669, #14b8a6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 800, fontSize: 14,
                flexShrink: 0
            }}>
                {number}
            </div>
            <h2 style={{
                fontSize: 20, fontWeight: 700, color: "#111827",
                margin: 0, lineHeight: 1.3
            }}>
                {title}
            </h2>
        </div>
    );
}

function SubTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 style={{
            fontSize: 15, fontWeight: 700, color: "#374151",
            marginTop: 20, marginBottom: 8
        }}>
            {children}
        </h3>
    );
}

function Section({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            fontSize: 14.5,
            lineHeight: 1.8,
            color: "#4b5563",
        }}>
            <style jsx>{`
                div :global(p) {
                    margin: 0 0 12px 0;
                }
                div :global(ul) {
                    margin: 8px 0 16px 0;
                    padding-left: 24px;
                }
                div :global(li) {
                    margin-bottom: 6px;
                }
                div :global(strong) {
                    color: #1f2937;
                }
            `}</style>
            {children}
        </div>
    );
}
