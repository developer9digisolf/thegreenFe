"use client";

import { useState } from "react";

interface Props {
    onClose: () => void;
    onSave: (data: any) => Promise<boolean>;
}

export default function ModalMemberAdd({ onClose, onSave }: Props) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("male");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;

        setLoading(true);
        const success = await onSave({
            name,
            phone,
            email,
            gender,
            countryCode: "62",
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
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="form-input"
                            placeholder="Contoh: 08123456789"
                        />
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
