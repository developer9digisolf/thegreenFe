import { useState } from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Badge,
    Avatar,
    AvatarInitial,
    Modal,
    ModalHeader,
    ModalTitle,
    ModalClose,
    ModalBody,
    ModalFooter,
    Table,
    FormGroup,
    Label,
    Select,
} from "@doar/components";
import {
    Search,
    User,
    Phone,
    CreditCard,
    Clock,
    Star,
    Aperture as QrCode,
    X,
    Plus,
    Minus,
    Trash2,
    AlertCircle,
    CheckCircle,
    Smartphone,
    DollarSign,
    Package,
    Gift,
    UserCheck,
    Calendar,
    MapPin,
} from "react-feather";
import styled from "@doar/shared/styled";
import Content from "../../layouts/content";
import Breadcrumb from "../../components/components/breadcrumb";
import SEO from "../../components/components/seo";

// ============ STYLED COMPONENTS ============

const StyledPOSWrapper = styled.div`
    display: flex;
    gap: 15px;
    min-height: calc(100vh - 180px);
    
    @media (max-width: 1199px) {
        flex-direction: column;
    }
`;

const StyledLeftPanel = styled.div`
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    @media (max-width: 1199px) {
        width: 100%;
    }
`;

const StyledCenterPanel = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const StyledRightPanel = styled.div`
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    @media (max-width: 1199px) {
        width: 100%;
    }
`;

const StyledSearchBox = styled.div`
    position: relative;
    
    svg {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: #8392a5;
    }
    
    input {
        padding-left: 40px;
    }
`;

const StyledMemberCard = styled.div`
    padding: 15px;
    background: linear-gradient(135deg, #2d8f7b 0%, #1a5c4e 100%);
    border-radius: 10px;
    color: white;
    margin-bottom: 15px;
`;

const StyledMemberName = styled.h5`
    margin: 0 0 5px;
    font-size: 16px;
    font-weight: 600;
    color: white;
`;

const StyledMemberPhone = styled.p`
    margin: 0;
    font-size: 13px;
    opacity: 0.9;
    display: flex;
    align-items: center;
    gap: 5px;
`;

const StyledVoucherBalance = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.15);
    padding: 10px 12px;
    border-radius: 8px;
    margin-top: 12px;
`;

const StyledVoucherInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyledVoucherLabel = styled.span`
    font-size: 11px;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StyledVoucherCount = styled.span`
    font-size: 24px;
    font-weight: 700;
`;

const StyledPreferenceTag = styled.span<{ $type?: string }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    font-size: 11px;
    border-radius: 20px;
    margin: 3px;
    background: ${({ $type }) =>
        $type === "avoid" ? "#fee2e2" : $type === "prefer" ? "#d1fae5" : "#e0e7ff"};
    color: ${({ $type }) =>
        $type === "avoid" ? "#dc2626" : $type === "prefer" ? "#059669" : "#4f46e5"};
`;

const StyledModeSelector = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
`;

const StyledModeButton = styled.button<{ $active?: boolean }>`
    flex: 1;
    padding: 12px;
    border: 2px solid ${({ $active }) => ($active ? "#2d8f7b" : "#e3e7ed")};
    background: ${({ $active }) => ($active ? "#e8f5f1" : "white")};
    color: ${({ $active }) => ($active ? "#2d8f7b" : "#596882")};
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;

    svg {
        width: 20px;
        height: 20px;
    }

    &:hover {
        border-color: #2d8f7b;
        background: #f0faf7;
    }
`;

const StyledServiceGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
`;

const StyledServiceCard = styled.div<{ $selected?: boolean }>`
    padding: 15px;
    border: 2px solid ${({ $selected }) => ($selected ? "#2d8f7b" : "#e3e7ed")};
    background: ${({ $selected }) => ($selected ? "#f0faf7" : "white")};
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #2d8f7b;
        box-shadow: 0 4px 12px rgba(45, 143, 123, 0.15);
    }
`;

const StyledServiceName = styled.h6`
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #1c273c;
`;

const StyledServiceMeta = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #8392a5;
`;

const StyledServicePrice = styled.span`
    font-size: 15px;
    font-weight: 700;
    color: #2d8f7b;
`;

const StyledCartItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #e3e7ed;

    &:last-child {
        border-bottom: none;
    }
`;

const StyledCartItemInfo = styled.div`
    flex: 1;
`;

const StyledCartItemName = styled.h6`
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
    color: #1c273c;
`;

const StyledCartItemMeta = styled.p`
    margin: 0;
    font-size: 12px;
    color: #8392a5;
`;

const StyledCartItemPrice = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: #2d8f7b;
    margin-right: 12px;
`;

const StyledCartSummary = styled.div`
    background: #f8f9fc;
    padding: 15px;
    border-radius: 10px;
    margin-top: 15px;
`;

const StyledSummaryRow = styled.div<{ $total?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: ${({ $total }) => ($total ? "16px" : "14px")};
    font-weight: ${({ $total }) => ($total ? "700" : "400")};
    color: ${({ $total }) => ($total ? "#1c273c" : "#596882")};
    border-top: ${({ $total }) => ($total ? "2px solid #e3e7ed" : "none")};
    margin-top: ${({ $total }) => ($total ? "8px" : "0")};
    padding-top: ${({ $total }) => ($total ? "15px" : "8px")};
`;

const StyledTherapistCard = styled.div<{ $selected?: boolean; $status?: string }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 2px solid ${({ $selected }) => ($selected ? "#2d8f7b" : "#e3e7ed")};
    background: ${({ $selected }) => ($selected ? "#f0faf7" : "white")};
    border-radius: 10px;
    cursor: ${({ $status }) => ($status === "available" ? "pointer" : "not-allowed")};
    opacity: ${({ $status }) => ($status === "available" ? 1 : 0.6)};
    transition: all 0.2s ease;
    margin-bottom: 10px;

    &:hover {
        border-color: ${({ $status }) => ($status === "available" ? "#2d8f7b" : "#e3e7ed")};
    }
`;

const StyledTherapistInfo = styled.div`
    flex: 1;
`;

const StyledTherapistName = styled.h6`
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
    color: #1c273c;
`;

const StyledTherapistMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #8392a5;
`;

const StyledStatusBadge = styled.span<{ $status?: string }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 20px;
    background: ${({ $status }) =>
        $status === "available"
            ? "#d1fae5"
            : $status === "busy"
            ? "#fee2e2"
            : "#fef3c7"};
    color: ${({ $status }) =>
        $status === "available"
            ? "#059669"
            : $status === "busy"
            ? "#dc2626"
            : "#d97706"};
`;

const StyledQueueNumber = styled.div`
    background: #2d8f7b;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
`;

const StyledPaymentOption = styled.div<{ $selected?: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    border: 2px solid ${({ $selected }) => ($selected ? "#2d8f7b" : "#e3e7ed")};
    background: ${({ $selected }) => ($selected ? "#f0faf7" : "white")};
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 10px;
    transition: all 0.2s ease;

    &:hover {
        border-color: #2d8f7b;
    }
`;

const StyledPaymentIcon = styled.div<{ $color?: string }>`
    width: 45px;
    height: 45px;
    border-radius: 10px;
    background: ${({ $color }) => $color || "#e0e7ff"};
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        width: 22px;
        height: 22px;
        color: white;
    }
`;

const StyledPackageCard = styled.div<{ $selected?: boolean }>`
    padding: 15px;
    border: 2px solid ${({ $selected }) => ($selected ? "#2d8f7b" : "#e3e7ed")};
    background: ${({ $selected }) => ($selected ? "#f0faf7" : "white")};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 12px;

    &:hover {
        border-color: #2d8f7b;
        box-shadow: 0 4px 15px rgba(45, 143, 123, 0.15);
    }
`;

const StyledPackageHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const StyledPackageName = styled.h6`
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #1c273c;
`;

const StyledPackageBadge = styled.span`
    background: linear-gradient(135deg, #2d8f7b 0%, #1a5c4e 100%);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
`;

const StyledPackageDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #e3e7ed;
`;

const StyledPackageDetail = styled.div`
    text-align: center;
`;

const StyledDetailLabel = styled.span`
    display: block;
    font-size: 10px;
    color: #8392a5;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
`;

const StyledDetailValue = styled.span`
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #1c273c;
`;

const StyledWelcomeArea = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    margin-bottom: 20px;
`;

const StyledWelcomeLeft = styled.div``;

const StyledWelcomeRight = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
`;

const StyledActionButton = styled(Button)`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    
    svg {
        width: 16px;
        height: 16px;
    }
`;

const StyledEmptyState = styled.div`
    text-align: center;
    padding: 40px 20px;
    color: #8392a5;
    
    svg {
        width: 48px;
        height: 48px;
        margin-bottom: 15px;
        opacity: 0.5;
    }
    
    h6 {
        margin: 0 0 8px;
        color: #596882;
        font-size: 15px;
    }
    
    p {
        margin: 0;
        font-size: 13px;
    }
`;

const StyledScanButton = styled(Button)`
    width: 100%;
    padding: 15px;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: linear-gradient(135deg, #2d8f7b 0%, #1a5c4e 100%);
    border: none;
    
    svg {
        width: 20px;
        height: 20px;
    }
    
    &:hover {
        background: linear-gradient(135deg, #248068 0%, #154a3f 100%);
    }
`;

// ============ DUMMY DATA ============

const dummyMember = {
    id: "M001",
    name: "Sarah Wijaya",
    phone: "081234567890",
    email: "sarah@email.com",
    joinDate: "2024-01-15",
    voucherBalance: 8,
    totalVisits: 24,
    preferredTherapist: "Maya",
    bodyPreferences: {
        avoid: ["Leher", "Pinggang Bawah"],
        prefer: ["Pundak", "Punggung Atas"],
    },
    voucherHistory: [
        { package: "Paket Hemat 10 Sesi", remaining: 5, expiry: "2025-06-15" },
        { package: "Paket Signature 5 Sesi", remaining: 3, expiry: "2025-03-20" },
    ],
};

const services = [
    { id: "S001", name: "Traditional Massage", duration: 60, price: 150000, commission: 30000 },
    { id: "S002", name: "Aromatherapy Massage", duration: 90, price: 220000, commission: 45000 },
    { id: "S003", name: "Hot Stone Therapy", duration: 90, price: 280000, commission: 55000 },
    { id: "S004", name: "Deep Tissue Massage", duration: 60, price: 180000, commission: 35000 },
    { id: "S005", name: "Reflexology", duration: 45, price: 120000, commission: 25000 },
    { id: "S006", name: "Full Body Scrub", duration: 60, price: 200000, commission: 40000 },
    { id: "S007", name: "Facial Treatment", duration: 60, price: 175000, commission: 35000 },
    { id: "S008", name: "Signature Green Spa", duration: 120, price: 350000, commission: 70000 },
];

const voucherPackages = [
    { id: "V001", name: "Paket Hemat", sessions: 5, price: 650000, validity: 90, discount: "13%" },
    { id: "V002", name: "Paket Premium", sessions: 10, price: 1200000, validity: 180, discount: "20%" },
    { id: "V003", name: "Paket VIP", sessions: 20, price: 2200000, validity: 365, discount: "27%" },
    { id: "V004", name: "Paket Signature", sessions: 5, price: 900000, validity: 90, discount: "15%", forService: "Signature Green Spa" },
];

const therapists = [
    { id: "T001", name: "Maya Putri", rating: 4.9, totalSession: 1240, status: "available", queueNo: 1 },
    { id: "T002", name: "Dewi Sartika", rating: 4.8, totalSession: 980, status: "available", queueNo: 2 },
    { id: "T003", name: "Rina Wulandari", rating: 4.7, totalSession: 756, status: "busy", currentSession: "Aromatherapy - 25 min left" },
    { id: "T004", name: "Siti Rahayu", rating: 4.8, totalSession: 1102, status: "available", queueNo: 3 },
    { id: "T005", name: "Ani Kusuma", rating: 4.6, totalSession: 543, status: "break", returnTime: "14:30" },
];

// ============ MAIN COMPONENT ============

const POSPage = () => {
    // States
    const [mode, setMode] = useState<"session" | "voucher" | "redeem">("session");
    const [selectedMember, setSelectedMember] = useState(dummyMember);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<string | null>("T001");
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [voucherCode, setVoucherCode] = useState("");

    // Handlers
    const handleAddToCart = (service: any) => {
        const existingItem = cart.find((item) => item.id === service.id);
        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.id === service.id ? { ...item, qty: item.qty + 1 } : item
                )
            );
        } else {
            setCart([...cart, { ...service, qty: 1 }]);
        }
        setSelectedService(service.id);
    };

    const handleRemoveFromCart = (serviceId: string) => {
        setCart(cart.filter((item) => item.id !== serviceId));
    };

    const handleUpdateQty = (serviceId: string, delta: number) => {
        setCart(
            cart
                .map((item) =>
                    item.id === serviceId ? { ...item, qty: Math.max(0, item.qty + delta) } : item
                )
                .filter((item) => item.qty > 0)
        );
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleProceedPayment = () => {
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = () => {
        // Process payment logic here
        setShowPaymentModal(false);
        setCart([]);
        // Show success message or navigate to session detail
    };

    return (
        <>
            <SEO title="POS - The Green Spa" />
            <Content>
                {/* Header */}
                <StyledWelcomeArea>
                    <StyledWelcomeLeft>
                        <Breadcrumb
                            prev={[{ text: "Dashboard", link: "/admin/dashboard" }]}
                            title="Point of Sale"
                            wcText="The Green Spa"
                        />
                    </StyledWelcomeLeft>
                    <StyledWelcomeRight>
                        <StyledActionButton size="sm" color="white" hasIcon>
                            <Clock /> Riwayat Transaksi
                        </StyledActionButton>
                        <StyledScanButton size="sm" hasIcon onClick={() => setShowScanModal(true)}>
                            <QrCode /> Scan Voucher
                        </StyledScanButton>
                    </StyledWelcomeRight>
                </StyledWelcomeArea>

                {/* Mode Selector */}
                <StyledModeSelector>
                    <StyledModeButton $active={mode === "session"} onClick={() => setMode("session")}>
                        <UserCheck />
                        Buat Sesi Baru
                    </StyledModeButton>
                    <StyledModeButton $active={mode === "voucher"} onClick={() => setMode("voucher")}>
                        <Gift />
                        Jual Paket Voucher
                    </StyledModeButton>
                    <StyledModeButton $active={mode === "redeem"} onClick={() => setMode("redeem")}>
                        <Package />
                        Redeem Voucher
                    </StyledModeButton>
                </StyledModeSelector>

                <StyledPOSWrapper>
                    {/* ========== LEFT PANEL - MEMBER ========== */}
                    <StyledLeftPanel>
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Member</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <StyledSearchBox>
                                    <Search />
                                    <Input
                                        type="text"
                                        placeholder="Cari member (nama/telepon)..."
                                        id="memberSearch"
                                    />
                                </StyledSearchBox>

                                {selectedMember && (
                                    <>
                                        <StyledMemberCard>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                                <Avatar size="lg">
                                                    <AvatarInitial bg="white" color="success">
                                                        {selectedMember.name.charAt(0)}
                                                    </AvatarInitial>
                                                </Avatar>
                                                <div>
                                                    <StyledMemberName>{selectedMember.name}</StyledMemberName>
                                                    <StyledMemberPhone>
                                                        <Phone size={12} /> {selectedMember.phone}
                                                    </StyledMemberPhone>
                                                </div>
                                            </div>
                                            <StyledVoucherBalance>
                                                <StyledVoucherInfo>
                                                    <StyledVoucherLabel>Sisa Voucher</StyledVoucherLabel>
                                                    <StyledVoucherCount>{selectedMember.voucherBalance}</StyledVoucherCount>
                                                </StyledVoucherInfo>
                                                <StyledVoucherInfo style={{ textAlign: "right" }}>
                                                    <StyledVoucherLabel>Total Kunjungan</StyledVoucherLabel>
                                                    <StyledVoucherCount>{selectedMember.totalVisits}</StyledVoucherCount>
                                                </StyledVoucherInfo>
                                            </StyledVoucherBalance>
                                        </StyledMemberCard>

                                        {/* Body Preferences */}
                                        <div style={{ marginBottom: "15px" }}>
                                            <Label style={{ marginBottom: "8px", display: "block", fontSize: "13px", fontWeight: 600 }}>
                                                <AlertCircle size={14} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                                                Preferensi Area Tubuh
                                            </Label>
                                            <div>
                                                {selectedMember.bodyPreferences.avoid.map((area) => (
                                                    <StyledPreferenceTag key={area} $type="avoid">
                                                        ✕ {area}
                                                    </StyledPreferenceTag>
                                                ))}
                                                {selectedMember.bodyPreferences.prefer.map((area) => (
                                                    <StyledPreferenceTag key={area} $type="prefer">
                                                        ✓ {area}
                                                    </StyledPreferenceTag>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Voucher List */}
                                        <div>
                                            <Label style={{ marginBottom: "8px", display: "block", fontSize: "13px", fontWeight: 600 }}>
                                                <CreditCard size={14} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                                                Voucher Aktif
                                            </Label>
                                            {selectedMember.voucherHistory.map((voucher, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        background: "#f8f9fc",
                                                        padding: "10px 12px",
                                                        borderRadius: "8px",
                                                        marginBottom: "8px",
                                                        fontSize: "13px",
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>{voucher.package}</div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", color: "#8392a5", fontSize: "12px" }}>
                                                        <span>Sisa: <strong style={{ color: "#2d8f7b" }}>{voucher.remaining} sesi</strong></span>
                                                        <span>Exp: {voucher.expiry}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Preferred Therapist */}
                                        <div style={{ marginTop: "15px" }}>
                                            <Label style={{ marginBottom: "8px", display: "block", fontSize: "13px", fontWeight: 600 }}>
                                                <Star size={14} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                                                Therapist Favorit
                                            </Label>
                                            <Badge color="success" pill style={{ fontSize: "12px" }}>
                                                {selectedMember.preferredTherapist}
                                            </Badge>
                                        </div>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </StyledLeftPanel>

                    {/* ========== CENTER PANEL - SERVICES/PACKAGES ========== */}
                    <StyledCenterPanel>
                        {mode === "session" && (
                            <>
                                {/* Services */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pilih Layanan</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <StyledServiceGrid>
                                            {services.map((service) => (
                                                <StyledServiceCard
                                                    key={service.id}
                                                    $selected={selectedService === service.id}
                                                    onClick={() => handleAddToCart(service)}
                                                >
                                                    <StyledServiceName>{service.name}</StyledServiceName>
                                                    <StyledServiceMeta>
                                                        <span>
                                                            <Clock size={12} /> {service.duration} menit
                                                        </span>
                                                        <StyledServicePrice>
                                                            {formatCurrency(service.price)}
                                                        </StyledServicePrice>
                                                    </StyledServiceMeta>
                                                </StyledServiceCard>
                                            ))}
                                        </StyledServiceGrid>
                                    </CardBody>
                                </Card>

                                {/* Cart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Detail Transaksi</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        {cart.length === 0 ? (
                                            <StyledEmptyState>
                                                <Package />
                                                <h6>Belum ada layanan dipilih</h6>
                                                <p>Klik layanan di atas untuk menambahkan</p>
                                            </StyledEmptyState>
                                        ) : (
                                            <>
                                                {cart.map((item) => (
                                                    <StyledCartItem key={item.id}>
                                                        <StyledCartItemInfo>
                                                            <StyledCartItemName>{item.name}</StyledCartItemName>
                                                            <StyledCartItemMeta>
                                                                {item.duration} menit × {item.qty}
                                                            </StyledCartItemMeta>
                                                        </StyledCartItemInfo>
                                                        <StyledCartItemPrice>
                                                            {formatCurrency(item.price * item.qty)}
                                                        </StyledCartItemPrice>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <Button
                                                                size="xs"
                                                                color="light"
                                                                onClick={() => handleUpdateQty(item.id, -1)}
                                                            >
                                                                <Minus size={14} />
                                                            </Button>
                                                            <span style={{ width: "25px", textAlign: "center", fontWeight: 600 }}>
                                                                {item.qty}
                                                            </span>
                                                            <Button
                                                                size="xs"
                                                                color="light"
                                                                onClick={() => handleUpdateQty(item.id, 1)}
                                                            >
                                                                <Plus size={14} />
                                                            </Button>
                                                            <Button
                                                                size="xs"
                                                                color="danger"
                                                                variant="texted"
                                                                onClick={() => handleRemoveFromCart(item.id)}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </StyledCartItem>
                                                ))}

                                                <StyledCartSummary>
                                                    <StyledSummaryRow>
                                                        <span>Subtotal</span>
                                                        <span>{formatCurrency(calculateSubtotal())}</span>
                                                    </StyledSummaryRow>
                                                    <StyledSummaryRow>
                                                        <span>Diskon Member</span>
                                                        <span style={{ color: "#dc3545" }}>- {formatCurrency(0)}</span>
                                                    </StyledSummaryRow>
                                                    <StyledSummaryRow $total>
                                                        <span>Total</span>
                                                        <span style={{ color: "#2d8f7b" }}>
                                                            {formatCurrency(calculateSubtotal())}
                                                        </span>
                                                    </StyledSummaryRow>
                                                </StyledCartSummary>

                                                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                                                    <Button
                                                        color="success"
                                                        style={{ flex: 1 }}
                                                        disabled={!selectedTherapist}
                                                        onClick={handleProceedPayment}
                                                    >
                                                        <CreditCard size={16} style={{ marginRight: "8px" }} />
                                                        Bayar Walk-in
                                                    </Button>
                                                    <Button
                                                        color="primary"
                                                        style={{ flex: 1 }}
                                                        disabled={!selectedTherapist || selectedMember.voucherBalance === 0}
                                                    >
                                                        <Package size={16} style={{ marginRight: "8px" }} />
                                                        Gunakan Voucher
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </CardBody>
                                </Card>
                            </>
                        )}

                        {mode === "voucher" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pilih Paket Voucher</CardTitle>
                                </CardHeader>
                                <CardBody>
                                    {voucherPackages.map((pkg) => (
                                        <StyledPackageCard
                                            key={pkg.id}
                                            $selected={selectedPackage === pkg.id}
                                            onClick={() => setSelectedPackage(pkg.id)}
                                        >
                                            <StyledPackageHeader>
                                                <StyledPackageName>{pkg.name}</StyledPackageName>
                                                <StyledPackageBadge>Hemat {pkg.discount}</StyledPackageBadge>
                                            </StyledPackageHeader>
                                            {pkg.forService && (
                                                <div style={{ fontSize: "12px", color: "#8392a5", marginBottom: "8px" }}>
                                                    Khusus: {pkg.forService}
                                                </div>
                                            )}
                                            <div style={{ fontSize: "22px", fontWeight: 700, color: "#2d8f7b" }}>
                                                {formatCurrency(pkg.price)}
                                            </div>
                                            <StyledPackageDetails>
                                                <StyledPackageDetail>
                                                    <StyledDetailLabel>Jumlah Sesi</StyledDetailLabel>
                                                    <StyledDetailValue>{pkg.sessions} Sesi</StyledDetailValue>
                                                </StyledPackageDetail>
                                                <StyledPackageDetail>
                                                    <StyledDetailLabel>Masa Berlaku</StyledDetailLabel>
                                                    <StyledDetailValue>{pkg.validity} Hari</StyledDetailValue>
                                                </StyledPackageDetail>
                                                <StyledPackageDetail>
                                                    <StyledDetailLabel>Per Sesi</StyledDetailLabel>
                                                    <StyledDetailValue>
                                                        {formatCurrency(pkg.price / pkg.sessions)}
                                                    </StyledDetailValue>
                                                </StyledPackageDetail>
                                            </StyledPackageDetails>
                                        </StyledPackageCard>
                                    ))}

                                    {selectedPackage && (
                                        <div style={{ marginTop: "20px" }}>
                                            <Button color="success" fullwidth onClick={handleProceedPayment}>
                                                <CreditCard size={16} style={{ marginRight: "8px" }} />
                                                Proses Pembayaran
                                            </Button>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        )}

                        {mode === "redeem" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Redeem Voucher</CardTitle>
                                </CardHeader>
                                <CardBody>
                                    <FormGroup>
                                        <Label htmlFor="voucherCode">Kode Voucher / Scan Barcode</Label>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <Input
                                                type="text"
                                                id="voucherCode"
                                                placeholder="Masukkan kode voucher..."
                                                value={voucherCode}
                                                onChange={(e) => setVoucherCode(e.target.value)}
                                            />
                                            <Button color="primary" onClick={() => setShowScanModal(true)}>
                                                <QrCode size={18} />
                                            </Button>
                                        </div>
                                    </FormGroup>

                                    {selectedMember && selectedMember.voucherBalance > 0 && (
                                        <div style={{ marginTop: "20px" }}>
                                            <Label style={{ marginBottom: "10px", display: "block", fontWeight: 600 }}>
                                                Voucher Tersedia untuk Member Ini:
                                            </Label>
                                            {selectedMember.voucherHistory.map((voucher, idx) => (
                                                <StyledPackageCard key={idx} $selected={false}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <StyledPackageName>{voucher.package}</StyledPackageName>
                                                            <div style={{ fontSize: "12px", color: "#8392a5", marginTop: "4px" }}>
                                                                <Calendar size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                                                                Berlaku hingga: {voucher.expiry}
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: "right" }}>
                                                            <div style={{ fontSize: "24px", fontWeight: 700, color: "#2d8f7b" }}>
                                                                {voucher.remaining}
                                                            </div>
                                                            <div style={{ fontSize: "11px", color: "#8392a5" }}>sesi tersisa</div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        color="success"
                                                        size="sm"
                                                        fullwidth
                                                        mt="15px"
                                                        onClick={() => {
                                                            setMode("session");
                                                        }}
                                                    >
                                                        Gunakan untuk Sesi Baru
                                                    </Button>
                                                </StyledPackageCard>
                                            ))}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        )}
                    </StyledCenterPanel>

                    {/* ========== RIGHT PANEL - THERAPIST ========== */}
                    <StyledRightPanel>
                        <Card>
                            <CardHeader>
                                <CardTitle>Pilih Therapist</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <div style={{ marginBottom: "15px", padding: "10px", background: "#f0faf7", borderRadius: "8px" }}>
                                    <div style={{ fontSize: "12px", color: "#2d8f7b", fontWeight: 600, marginBottom: "5px" }}>
                                        <CheckCircle size={14} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                                        Rekomendasi Sistem
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#596882" }}>
                                        Berdasarkan antrian dan preferensi member
                                    </div>
                                </div>

                                {therapists.map((therapist) => (
                                    <StyledTherapistCard
                                        key={therapist.id}
                                        $selected={selectedTherapist === therapist.id}
                                        $status={therapist.status}
                                        onClick={() =>
                                            therapist.status === "available" && setSelectedTherapist(therapist.id)
                                        }
                                    >
                                        {therapist.status === "available" && therapist.queueNo && (
                                            <StyledQueueNumber>{therapist.queueNo}</StyledQueueNumber>
                                        )}
                                        <Avatar>
                                            <AvatarInitial>{therapist.name.charAt(0)}</AvatarInitial>
                                        </Avatar>
                                        <StyledTherapistInfo>
                                            <StyledTherapistName>
                                                {therapist.name}
                                                {selectedMember?.preferredTherapist === therapist.name.split(" ")[0] && (
                                                    <Star
                                                        size={12}
                                                        fill="#ffc107"
                                                        color="#ffc107"
                                                        style={{ marginLeft: "5px", verticalAlign: "middle" }}
                                                    />
                                                )}
                                            </StyledTherapistName>
                                            <StyledTherapistMeta>
                                                <span>
                                                    <Star size={11} fill="#ffc107" color="#ffc107" /> {therapist.rating}
                                                </span>
                                                <span>{therapist.totalSession} sesi</span>
                                            </StyledTherapistMeta>
                                            {therapist.status === "busy" && therapist.currentSession && (
                                                <div style={{ fontSize: "11px", color: "#dc3545", marginTop: "4px" }}>
                                                    {therapist.currentSession}
                                                </div>
                                            )}
                                            {therapist.status === "break" && therapist.returnTime && (
                                                <div style={{ fontSize: "11px", color: "#d97706", marginTop: "4px" }}>
                                                    Kembali: {therapist.returnTime}
                                                </div>
                                            )}
                                        </StyledTherapistInfo>
                                        <StyledStatusBadge $status={therapist.status}>
                                            {therapist.status === "available"
                                                ? "Tersedia"
                                                : therapist.status === "busy"
                                                ? "Sibuk"
                                                : "Istirahat"}
                                        </StyledStatusBadge>
                                    </StyledTherapistCard>
                                ))}
                            </CardBody>
                        </Card>

                        {/* Session Summary */}
                        {(mode === "session" && cart.length > 0 && selectedTherapist) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Sesi</CardTitle>
                                </CardHeader>
                                <CardBody>
                                    <div style={{ fontSize: "13px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "#8392a5" }}>Member</span>
                                            <span style={{ fontWeight: 600 }}>{selectedMember?.name}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "#8392a5" }}>Therapist</span>
                                            <span style={{ fontWeight: 600 }}>
                                                {therapists.find((t) => t.id === selectedTherapist)?.name}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "#8392a5" }}>Total Durasi</span>
                                            <span style={{ fontWeight: 600 }}>
                                                {cart.reduce((sum, item) => sum + item.duration * item.qty, 0)} menit
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "#8392a5" }}>Estimasi Selesai</span>
                                            <span style={{ fontWeight: 600 }}>
                                                {new Date(
                                                    Date.now() +
                                                        cart.reduce((sum, item) => sum + item.duration * item.qty, 0) * 60000
                                                ).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </StyledRightPanel>
                </StyledPOSWrapper>
            </Content>

            {/* ========== PAYMENT MODAL ========== */}
            <Modal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} size="md">
                <ModalHeader>
                    <ModalTitle>Pembayaran</ModalTitle>
                    <ModalClose onClose={() => setShowPaymentModal(false)}>
                        <X />
                    </ModalClose>
                </ModalHeader>
                <ModalBody>
                    <div style={{ marginBottom: "20px" }}>
                        <div
                            style={{
                                background: "#f8f9fc",
                                padding: "15px",
                                borderRadius: "10px",
                                marginBottom: "20px",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#8392a5" }}>Total Pembayaran</span>
                                <span style={{ fontSize: "24px", fontWeight: 700, color: "#2d8f7b" }}>
                                    {mode === "voucher" && selectedPackage
                                        ? formatCurrency(voucherPackages.find((p) => p.id === selectedPackage)?.price || 0)
                                        : formatCurrency(calculateSubtotal())}
                                </span>
                            </div>
                        </div>

                        <Label style={{ marginBottom: "12px", display: "block", fontWeight: 600 }}>
                            Pilih Metode Pembayaran
                        </Label>

                        <StyledPaymentOption
                            $selected={selectedPayment === "cash"}
                            onClick={() => setSelectedPayment("cash")}
                        >
                            <StyledPaymentIcon $color="#10b759">
                                <DollarSign />
                            </StyledPaymentIcon>
                            <div>
                                <div style={{ fontWeight: 600 }}>Tunai</div>
                                <div style={{ fontSize: "12px", color: "#8392a5" }}>Pembayaran dengan uang tunai</div>
                            </div>
                        </StyledPaymentOption>

                        <StyledPaymentOption
                            $selected={selectedPayment === "card"}
                            onClick={() => setSelectedPayment("card")}
                        >
                            <StyledPaymentIcon $color="#5b47fb">
                                <CreditCard />
                            </StyledPaymentIcon>
                            <div>
                                <div style={{ fontWeight: 600 }}>Kartu Debit/Kredit</div>
                                <div style={{ fontSize: "12px", color: "#8392a5" }}>Visa, Mastercard, BCA, Mandiri</div>
                            </div>
                        </StyledPaymentOption>

                        <StyledPaymentOption
                            $selected={selectedPayment === "ewallet"}
                            onClick={() => setSelectedPayment("ewallet")}
                        >
                            <StyledPaymentIcon $color="#00b8d4">
                                <Smartphone />
                            </StyledPaymentIcon>
                            <div>
                                <div style={{ fontWeight: 600 }}>E-Wallet</div>
                                <div style={{ fontSize: "12px", color: "#8392a5" }}>GoPay, OVO, Dana, ShopeePay</div>
                            </div>
                        </StyledPaymentOption>

                        {selectedPayment === "cash" && (
                            <FormGroup mt="20px">
                                <Label htmlFor="cashReceived">Uang Diterima</Label>
                                <Input type="number" id="cashReceived" placeholder="Masukkan nominal..." />
                            </FormGroup>
                        )}

                        {selectedPayment === "ewallet" && (
                            <FormGroup mt="20px">
                                <Label htmlFor="ewalletType">Pilih E-Wallet</Label>
                                <Select id="ewalletType">
                                    <option value="">-- Pilih --</option>
                                    <option value="gopay">GoPay</option>
                                    <option value="ovo">OVO</option>
                                    <option value="dana">Dana</option>
                                    <option value="shopeepay">ShopeePay</option>
                                </Select>
                            </FormGroup>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowPaymentModal(false)}>
                        Batal
                    </Button>
                    <Button color="success" disabled={!selectedPayment} onClick={handleConfirmPayment}>
                        <CheckCircle size={16} style={{ marginRight: "8px" }} />
                        Konfirmasi Pembayaran
                    </Button>
                </ModalFooter>
            </Modal>

            {/* ========== SCAN VOUCHER MODAL ========== */}
            <Modal show={showScanModal} onClose={() => setShowScanModal(false)} size="sm">
                <ModalHeader>
                    <ModalTitle>Scan Voucher</ModalTitle>
                    <ModalClose onClose={() => setShowScanModal(false)}>
                        <X />
                    </ModalClose>
                </ModalHeader>
                <ModalBody>
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <div
                            style={{
                                width: "200px",
                                height: "200px",
                                margin: "0 auto 20px",
                                background: "#f8f9fc",
                                borderRadius: "15px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "3px dashed #e3e7ed",
                            }}
                        >
                            <QrCode size={80} color="#8392a5" />
                        </div>
                        <p style={{ color: "#8392a5", fontSize: "14px", marginBottom: "20px" }}>
                            Arahkan barcode voucher ke scanner
                        </p>
                        <div style={{ fontSize: "12px", color: "#8392a5" }}>atau</div>
                        <FormGroup mt="15px">
                            <Input type="text" placeholder="Masukkan kode manual..." />
                        </FormGroup>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowScanModal(false)}>
                        Tutup
                    </Button>
                    <Button color="primary">Validasi</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default POSPage;
