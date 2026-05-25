"use client";

import { useState, useRef, useEffect } from "react";
import { customList } from "country-codes-list";

const rawCountryList = customList('countryCode', '{countryCode} (+{countryCallingCode})');
const countryOptions = Object.entries(rawCountryList)
    .map(([iso, label]) => {
        const match = label.match(/\+(\d+)/);
        return {
            iso,
            code: match ? match[1] : "",
            label
        };
    })
    .filter(c => c.code)
    .sort((a, b) => a.iso.localeCompare(b.iso));

interface Props {
    onClose: () => void;
    onSave: (data: any) => Promise<boolean>;
}

export default function ModalMemberAdd({ onClose, onSave }: Props) {
    const [name, setName] = useState("");
    const [countryCode, setCountryCode] = useState("62");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("male");
    const [loading, setLoading] = useState(false);

    // State & Ref khusus untuk Custom Searchable Dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Menutup dropdown jika user mengklik area di luar dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter daftar negara berdasarkan input pencarian
    const filteredCountries = countryOptions.filter(c => 
        c.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.code.includes(searchQuery)
    );

    // Mencari label negara yang sedang aktif untuk ditampilkan
    const activeCountryLabel = countryCode === "62" 
        ? "ID (+62)" 
        : countryOptions.find(c => c.code === countryCode)?.label || `+${countryCode}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let cleanPhone = phone.trim();
        if (cleanPhone.startsWith("0")) {
            cleanPhone = cleanPhone.substring(1);
        }

        if (!name || !cleanPhone) return;

        setLoading(true);
        const success = await onSave({
            name,
            phone: cleanPhone,
            email,
            gender,
            countryCode, 
            notes: "Member baru dari POS"
        });
        setLoading(false);
        if (success) onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
            backdropFilter: "blur(8px)", padding: "20px"
        }}>
            <div className="modal-content" style={{
                background: "var(--bg-card)", borderRadius: "32px", padding: "40px",
                width: "100%", maxWidth: "480px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid var(--border-color)", animation: "modalScale 0.3s ease-out"
            }}>
                <style>{`
                    @keyframes modalScale {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .form-group { margin-bottom: 24px; }
                    .form-label { display: block; margin-bottom: 10px; font-weight: 700; font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
                    .form-input { 
                        width: 100%; padding: 16px; border-radius: 16px; border: 2px solid var(--bg-main);
                        background: var(--bg-main); color: var(--text-primary); font-size: 15px; transition: all 0.2s;
                    }
                    .form-input:focus { outline: none; border-color: var(--spa-green); background: var(--bg-card); box-shadow: 0 0 0 4px var(--spa-green-bg); }
                    
                    /* Efek hover untuk item dropdown */
                    .country-item { transition: background 0.2s; }
                    .country-item:hover { background: var(--bg-main) !important; }
                `}</style>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--spa-green)" }}>Member Baru</h2>
                        <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Lengkapi informasi pelanggan di bawah</p>
                    </div>
                    <button onClick={onClose} style={{ 
                        width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-main)", 
                        border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)"
                    }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nama Lengkap *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            placeholder="Contoh: Budi Santoso"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">No. WhatsApp *</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            
                            {/* ── CUSTOM SEARCHABLE DROPDOWN ── */}
                            <div ref={dropdownRef} style={{ position: "relative", width: "140px", flexShrink: 0 }}>
                                {/* Tombol Pemicu Dropdown */}
                                <div 
                                    className="form-input"
                                    onClick={() => {
                                        setIsDropdownOpen(!isDropdownOpen);
                                        setSearchQuery(""); // Reset search saat dibuka
                                    }}
                                    style={{ 
                                        cursor: "pointer", fontWeight: 700, display: "flex", 
                                        alignItems: "center", justifyContent: "space-between",
                                        borderColor: isDropdownOpen ? "var(--spa-green)" : "var(--bg-main)",
                                        background: isDropdownOpen ? "var(--bg-card)" : "var(--bg-main)",
                                        userSelect: "none"
                                    }}
                                >
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {activeCountryLabel}
                                    </span>
                                    <i className={`fa-solid fa-chevron-${isDropdownOpen ? "up" : "down"}`} style={{ fontSize: "12px", color: "var(--text-muted)" }}></i>
                                </div>

                                {/* Menu Dropdown Melayang */}
                                {isDropdownOpen && (
                                    <div style={{
                                        position: "absolute", top: "calc(100% + 8px)", left: 0, width: "240px",
                                        background: "var(--bg-card)", border: "1px solid var(--border-color)",
                                        borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                        zIndex: 50, overflow: "hidden", display: "flex", flexDirection: "column"
                                    }}>
                                        {/* Input Pencarian */}
                                        <div style={{ padding: "12px", background: "var(--bg-main)", borderBottom: "1px solid var(--border-color)" }}>
                                            <div style={{ position: "relative" }}>
                                                <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "12px" }}></i>
                                                <input
                                                    type="text"
                                                    placeholder="Cari negara/kode..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    autoFocus
                                                    style={{
                                                        width: "100%", padding: "10px 10px 10px 32px", borderRadius: "10px",
                                                        border: "1px solid var(--border-color)", background: "var(--bg-card)",
                                                        fontSize: "13px", outline: "none", color: "var(--text-primary)"
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Daftar Negara */}
                                        <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                                            {/* Prioritas ID (Hanya muncul jika tidak sedang mencari atau mencari "ID") */}
                                            {(!searchQuery || "id 62 indonesia".includes(searchQuery.toLowerCase())) && (
                                                <div 
                                                    className="country-item"
                                                    onClick={() => { setCountryCode("62"); setIsDropdownOpen(false); }}
                                                    style={{ 
                                                        padding: "12px 16px", cursor: "pointer", fontSize: "13px",
                                                        fontWeight: countryCode === "62" ? 800 : 600,
                                                        background: countryCode === "62" ? "var(--spa-green-bg)" : "transparent",
                                                        color: countryCode === "62" ? "var(--spa-green)" : "var(--text-primary)",
                                                        borderBottom: "1px solid var(--border-color)"
                                                    }}
                                                >
                                                    ID (+62)
                                                </div>
                                            )}
                                            
                                            {filteredCountries.length === 0 ? (
                                                <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                                                    Negara tidak ditemukan
                                                </div>
                                            ) : (
                                                filteredCountries.map((c, i) => {
                                                    // Hindari render duplikat untuk ID (karena sudah di-hardcode di atas)
                                                    if (c.iso === "ID") return null; 

                                                    return (
                                                        <div
                                                            key={`${c.iso}-${i}`}
                                                            className="country-item"
                                                            onClick={() => { setCountryCode(c.code); setIsDropdownOpen(false); }}
                                                            style={{
                                                                padding: "12px 16px", cursor: "pointer", fontSize: "13px",
                                                                fontWeight: countryCode === c.code ? 800 : 500,
                                                                background: countryCode === c.code ? "var(--spa-green-bg)" : "transparent",
                                                                color: countryCode === c.code ? "var(--spa-green)" : "var(--text-primary)"
                                                            }}
                                                        >
                                                            {c.label}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* ── END CUSTOM SEARCHABLE DROPDOWN ── */}

                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="form-input"
                                style={{ flex: 1 }}
                                placeholder="8123456789"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email (Opsional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Jenis Kelamin</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            {["male", "female"].map((g) => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setGender(g)}
                                    style={{
                                        flex: 1, padding: "14px", borderRadius: "16px", border: "2px solid",
                                        borderColor: gender === g ? "var(--spa-green)" : "var(--bg-main)",
                                        background: gender === g ? "var(--spa-green-bg)" : "var(--bg-main)",
                                        color: gender === g ? "var(--spa-green)" : "var(--text-secondary)",
                                        cursor: "pointer", fontWeight: 700, fontSize: "14px", transition: "all 0.2s",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                                    }}
                                >
                                    <i className={`fa-solid fa-${g === "male" ? "mars" : "venus"}`}></i>
                                    {g === "male" ? "Laki-laki" : "Perempuan"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="action-btn primary"
                        disabled={loading || !name || !phone}
                        style={{ 
                            width: "100%", padding: "18px", fontSize: "16px", fontWeight: 800, 
                            marginTop: "12px", borderRadius: "18px", boxShadow: "0 10px 20px -5px rgba(61, 107, 95, 0.4)" 
                        }}
                    >
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Daftarkan Member"}
                    </button>
                </form>
            </div>
        </div>
    );
}