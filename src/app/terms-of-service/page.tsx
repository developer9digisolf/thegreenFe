"use client";

import { useEffect } from "react";

export default function TermsOfServicePage() {
    useEffect(() => {
        document.title = "Terms of Service - The Green Spa";
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
                            <div style={{ fontSize: 11, color: "#6b7280" }}>Terms of Service</div>
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
                        Syarat dan Ketentuan
                    </h1>
                    <p style={{
                        fontSize: 16, fontWeight: 500, color: "#059669",
                        marginBottom: 16
                    }}>
                        Terms of Service
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
                        Selamat datang di <strong>{appName}</strong>. Syarat dan Ketentuan ini mengatur penggunaan
                        Anda atas aplikasi mobile {appName} dan layanan terkait yang disediakan oleh <strong>{companyName}</strong>.
                        Dengan mengakses atau menggunakan aplikasi kami, Anda menyetujui untuk terikat oleh
                        Syarat dan Ketentuan ini.
                    </p>
                </Section>

                {/* 1. Definisi */}
                <SectionTitle number="1" title="Definisi" />
                <Section>
                    <ul>
                        <li><strong>&quot;Aplikasi&quot;</strong> merujuk pada aplikasi mobile {appName} yang tersedia di Google Play Store dan Apple App Store</li>
                        <li><strong>&quot;Kami&quot;</strong> merujuk pada {companyName} sebagai pengelola dan pengembang aplikasi</li>
                        <li><strong>&quot;Pengguna&quot; atau &quot;Anda&quot;</strong> merujuk pada setiap individu yang mengunduh, menginstal, atau menggunakan Aplikasi</li>
                        <li><strong>&quot;Layanan&quot;</strong> merujuk pada layanan perawatan spa dan kecantikan yang ditawarkan melalui Aplikasi</li>
                        <li><strong>&quot;Terapis&quot;</strong> merujuk pada tenaga profesional yang memberikan layanan perawatan</li>
                        <li><strong>&quot;Kredit&quot;</strong> merujuk pada saldo digital yang dapat digunakan untuk pembayaran layanan</li>
                        <li><strong>&quot;Voucher&quot;</strong> merujuk pada kupon digital yang memberikan hak atas layanan tertentu</li>
                    </ul>
                </Section>

                {/* 2. Akun Pengguna */}
                <SectionTitle number="2" title="Pendaftaran dan Akun Pengguna" />
                <Section>
                    <SubTitle>2.1 Pendaftaran</SubTitle>
                    <p>
                        Untuk menggunakan layanan kami, Anda perlu membuat akun dengan memberikan informasi
                        yang akurat dan lengkap. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial
                        akun Anda.
                    </p>

                    <SubTitle>2.2 Kelayakan</SubTitle>
                    <p>
                        Anda harus berusia minimal 17 tahun untuk membuat akun dan menggunakan layanan kami.
                        Dengan membuat akun, Anda menyatakan bahwa Anda memenuhi persyaratan usia ini.
                    </p>

                    <SubTitle>2.3 Keamanan Akun</SubTitle>
                    <p>
                        Anda bertanggung jawab atas semua aktivitas yang terjadi di akun Anda. Segera
                        laporkan kepada kami jika Anda mencurigai adanya penggunaan tidak sah atas akun Anda.
                    </p>
                </Section>

                {/* 3. Layanan */}
                <SectionTitle number="3" title="Layanan" />
                <Section>
                    <SubTitle>3.1 Pemesanan</SubTitle>
                    <p>
                        Anda dapat memesan layanan perawatan melalui Aplikasi. Setiap pemesanan tunduk pada
                        ketersediaan terapis dan jadwal operasional {appName}. Kami berhak menolak atau
                        membatalkan pemesanan dengan pemberitahuan yang wajar.
                    </p>

                    <SubTitle>3.2 Pembatalan dan Perubahan Jadwal</SubTitle>
                    <p>
                        Pembatalan atau perubahan jadwal dapat dilakukan sesuai dengan kebijakan pembatalan
                        yang berlaku. Pembatalan yang dilakukan kurang dari 2 jam sebelum jadwal yang ditentukan
                        dapat dikenakan biaya pembatalan.
                    </p>

                    <SubTitle>3.3 Kualitas Layanan</SubTitle>
                    <p>
                        Kami berkomitmen untuk memberikan layanan berkualitas tinggi. Jika Anda tidak puas
                        dengan layanan yang diberikan, silakan hubungi kami untuk penyelesaian yang sesuai.
                    </p>
                </Section>

                {/* 4. Pembayaran */}
                <SectionTitle number="4" title="Pembayaran" />
                <Section>
                    <SubTitle>4.1 Harga</SubTitle>
                    <p>
                        Semua harga ditampilkan dalam Rupiah Indonesia (IDR) dan sudah termasuk pajak yang
                        berlaku kecuali dinyatakan lain. Harga dapat berubah sewaktu-waktu tanpa pemberitahuan
                        sebelumnya.
                    </p>

                    <SubTitle>4.2 Metode Pembayaran</SubTitle>
                    <p>
                        Kami menerima pembayaran melalui tunai, QRIS, transfer bank, kartu debit/kredit,
                        dan kredit {appName}. Pembayaran harus dilakukan pada saat layanan diberikan atau
                        sesuai ketentuan yang berlaku.
                    </p>

                    <SubTitle>4.3 Kredit dan Voucher</SubTitle>
                    <p>
                        Kredit yang dibeli bersifat non-refundable dan memiliki masa berlaku sesuai ketentuan
                        paket. Voucher tunduk pada syarat dan ketentuan yang tertera pada masing-masing voucher,
                        termasuk masa berlaku dan layanan yang dapat digunakan.
                    </p>

                    <SubTitle>4.4 Pengembalian Dana (Refund)</SubTitle>
                    <p>
                        Pengembalian dana dapat dilakukan dalam kondisi tertentu sesuai kebijakan kami.
                        Permintaan pengembalian dana harus diajukan dalam waktu 7 hari setelah transaksi.
                        Pengembalian dana untuk pembelian kredit dan voucher diproses sesuai kebijakan khusus
                        yang berlaku.
                    </p>
                </Section>

                {/* 5. Kewajiban Pengguna */}
                <SectionTitle number="5" title="Kewajiban Pengguna" />
                <Section>
                    <p>Sebagai pengguna Aplikasi, Anda setuju untuk:</p>
                    <ul>
                        <li>Memberikan informasi yang akurat dan terkini saat pendaftaran</li>
                        <li>Menggunakan Aplikasi sesuai dengan tujuan yang dimaksudkan</li>
                        <li>Tidak menyalahgunakan, merusak, atau mengganggu fungsi Aplikasi</li>
                        <li>Tidak menggunakan akun orang lain tanpa izin</li>
                        <li>Memperlakukan terapis dan staf dengan hormat dan sopan</li>
                        <li>Hadir tepat waktu sesuai jadwal pemesanan</li>
                        <li>Menginformasikan kondisi kesehatan atau alergi yang relevan sebelum perawatan</li>
                        <li>Tidak melakukan tindakan yang melanggar hukum melalui Aplikasi</li>
                    </ul>
                </Section>

                {/* 6. Hak Kekayaan Intelektual */}
                <SectionTitle number="6" title="Hak Kekayaan Intelektual" />
                <Section>
                    <p>
                        Seluruh konten dalam Aplikasi, termasuk namun tidak terbatas pada teks, grafik,
                        logo, ikon, gambar, desain antarmuka, dan perangkat lunak, adalah milik {companyName}
                        atau pemberi lisensinya dan dilindungi oleh hukum hak kekayaan intelektual yang berlaku.
                    </p>
                    <p>
                        Anda tidak diperkenankan untuk menyalin, memodifikasi, mendistribusikan, menjual,
                        atau mengeksploitasi konten Aplikasi tanpa izin tertulis dari kami.
                    </p>
                </Section>

                {/* 7. Batasan Tanggung Jawab */}
                <SectionTitle number="7" title="Batasan Tanggung Jawab" />
                <Section>
                    <p>
                        Sejauh diizinkan oleh hukum yang berlaku:
                    </p>
                    <ul>
                        <li>Aplikasi disediakan &quot;sebagaimana adanya&quot; dan &quot;sebagaimana tersedia&quot; tanpa jaminan apapun</li>
                        <li>Kami tidak menjamin bahwa Aplikasi akan selalu tersedia, bebas error, atau bebas dari gangguan</li>
                        <li>Kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan Aplikasi</li>
                        <li>Total tanggung jawab kami terbatas pada jumlah yang Anda bayarkan untuk layanan terkait</li>
                    </ul>
                </Section>

                {/* 8. Penangguhan dan Pemutusan */}
                <SectionTitle number="8" title="Penangguhan dan Pemutusan Akun" />
                <Section>
                    <p>Kami berhak menangguhkan atau menutup akun Anda jika:</p>
                    <ul>
                        <li>Anda melanggar Syarat dan Ketentuan ini</li>
                        <li>Anda memberikan informasi palsu atau menyesatkan</li>
                        <li>Anda terlibat dalam aktivitas penipuan atau penyalahgunaan</li>
                        <li>Diperlukan untuk keamanan atau kepatuhan hukum</li>
                    </ul>
                    <p>
                        Anda dapat menutup akun Anda kapan saja melalui Aplikasi atau dengan menghubungi kami.
                        Penutupan akun tidak membebaskan Anda dari kewajiban pembayaran yang belum diselesaikan.
                    </p>
                </Section>

                {/* 9. Perubahan */}
                <SectionTitle number="9" title="Perubahan Syarat dan Ketentuan" />
                <Section>
                    <p>
                        Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu. Perubahan material
                        akan diberitahukan melalui notifikasi dalam Aplikasi atau email. Penggunaan berkelanjutan
                        atas Aplikasi setelah perubahan merupakan persetujuan Anda terhadap Syarat dan Ketentuan
                        yang diperbarui.
                    </p>
                </Section>

                {/* 10. Hukum yang Berlaku */}
                <SectionTitle number="10" title="Hukum yang Berlaku dan Penyelesaian Sengketa" />
                <Section>
                    <p>
                        Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik
                        Indonesia. Setiap sengketa yang timbul dari atau terkait dengan Syarat dan Ketentuan
                        ini akan diselesaikan secara musyawarah terlebih dahulu. Jika musyawarah tidak
                        menghasilkan kesepakatan, sengketa akan diselesaikan melalui Pengadilan Negeri Medan.
                    </p>
                </Section>

                {/* 11. Hubungi Kami */}
                <SectionTitle number="11" title="Hubungi Kami" />
                <Section>
                    <p>
                        Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami:
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

                {/* Footer */}
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
                    <p style={{ marginTop: 8 }}>
                        <a href="/privacy-policy" style={{ color: "#059669", textDecoration: "none", fontWeight: 500 }}>
                            Kebijakan Privasi
                        </a>
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
