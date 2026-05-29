"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  GetBranchesService,
  GetTherapistsTodayService,
  GetLeaderboardTodayService,
} from "@afx/services/queue.service";
import { GetRecentSessionsService } from "@afx/services/dashboard.service";
import { GetPositionsService } from "@afx/services/master/positions.service";
import { UseSelect } from "@afx/components/ui/select/select.layout";
import type {
  TherapistQueue,
  Branch,
  TherapistAPIResponse,
} from "@afx/interfaces/queue.iface";
import { useSignalR } from "@/hooks/useSignalR";
import { useAuth } from "@/contexts/AuthContext";
import { TextToSpeechAndPlay } from "@/services/text-to-speech.service";

const EST_TREATMENT_MINUTES = 30;
const TOP_COUNT = 3;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(dateTime: string): string {
  return new Date(dateTime).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEstWait(queuePosition: number): string {
  if (queuePosition === 0) return "Segera";
  return "Est. " + queuePosition * EST_TREATMENT_MINUTES + " mnt";
}

function getPhotoUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://sin1.contabostorage.com/30e3a2fafcfd4aa0a6af34e9ca6f9492:thegreen-cdn/${url}`;
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, size = 10 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < Math.round(rating) ? "#ef9f27" : "none"}
          stroke="#ef9f27"
          strokeWidth={1.5}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ color = "#3b82f6" }: { color?: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "24px 0",
      }}
    >
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={3}
        style={{ animation: "spin 0.8s linear infinite" }}
      >
        <circle cx="12" cy="12" r="10" stroke={color + "33"} />
        <path d="M12 2C6.477 2 2 6.477 2 12" strokeLinecap="round" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Fullscreen Icon ──────────────────────────────────────────────────────────
function FullscreenIcon({ active }: { active: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? (
        <path d="M4 14h6v6M10 14l-7 7M20 10h-6V4M14 10l7-7" />
      ) : (
        <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
      )}
    </svg>
  );
}

// ─── Inline styles helpers ────────────────────────────────────────────────────
const S = {
  page: (isFs: boolean): React.CSSProperties => ({
    width: "100%",
    height: isFs ? "100vh" : "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: isFs ? "20px 28px" : "16px 20px",
    overflow: "hidden",
    boxSizing: "border-box",
    background: "var(--bg-page, #f8f9fb)",
  }),
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    gap: 12,
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  h2: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1e293b",
    margin: 0,
  } as React.CSSProperties,
  dateTxt: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  } as React.CSSProperties,
  controlsRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  fsBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    height: 32,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  statBar: {
    display: "flex",
    gap: 8,
    flexShrink: 0,
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  chip: (active?: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500,
    border: "1px solid",
    borderColor: active ? "#a7f3d0" : "#e2e8f0",
    background: active ? "#ecfdf5" : "#f8fafc",
    color: active ? "#065f46" : "#64748b",
  }),
  dot: (active?: boolean): React.CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: active ? "#10b981" : "#94a3b8",
    ...(active ? { animation: "pulse 1.5s ease-in-out infinite" } : {}),
  }),
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: 14,
    flex: 1,
    minHeight: 0,
  } as React.CSSProperties,
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minHeight: 0,
  } as React.CSSProperties,
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minHeight: 0,
  } as React.CSSProperties,
  sectionLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  card: (active: boolean): React.CSSProperties => ({
    position: "relative",
    background: "#fff",
    borderRadius: 14,
    border: active ? "1.5px solid #60a5fa" : "1px solid #e8edf3",
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxShadow: active
      ? "0 0 0 3px rgba(96,165,250,0.12)"
      : "0 1px 3px rgba(0,0,0,0.04)",
  }),
  cardNum: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  avatar: (color = "#f1f5f9", text = "#475569"): React.CSSProperties => ({
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: color,
    color: text,
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    flexShrink: 0,
  }),
  cardName: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1e293b",
    textAlign: "center" as const,
    lineHeight: 1.3,
  } as React.CSSProperties,
  cardPos: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "center" as const,
  } as React.CSSProperties,
  cardStatus: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    background: "#f8fafc",
    borderRadius: 8,
    padding: "5px 0",
    fontSize: 10,
    color: "#64748b",
  } as React.CSSProperties,
  cardTime: {
    fontSize: 10,
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: 3,
  } as React.CSSProperties,
  tableCard: {
    flex: 1,
    minHeight: 0,
    background: "#fff",
    border: "1px solid #e8edf3",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  } as React.CSSProperties,
  tableHead: {
    padding: "9px 16px",
    background: "#f8fafc",
    borderBottom: "1px solid #e8edf3",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as React.CSSProperties,
  tableBody: {
    overflowY: "auto" as const,
    flex: 1,
  } as React.CSSProperties,
  tableRow: {
    display: "grid",
    gridTemplateColumns: "28px 1fr 70px 80px 54px",
    alignItems: "center",
    gap: 8,
    padding: "9px 16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 12,
  } as React.CSSProperties,
  widgetCard: {
    background: "#fff",
    border: "1px solid #e8edf3",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  } as React.CSSProperties,
  widgetHead: {
    padding: "10px 14px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  } as React.CSSProperties,
  widgetBody: {
    padding: "10px",
    overflowY: "auto" as const,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  } as React.CSSProperties,
} as const;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TherapistSlide() {
  const [therapists, setTherapists] = useState<TherapistQueue[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [current, setCurrent] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number>(0);

  const [extraPage, setExtraPage] = useState(1);
  const extraPageSize = 6;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loadingRecentSessions, setLoadingRecentSessions] = useState(false);

  const { token } = useAuth();
  const { on: signalROn, off: signalROff } = useSignalR({
    hubName: "hubs/notification",
    accessToken: token || undefined,
    autoConnect: true,
  });

  const isFetchingRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // ── Toggle fullscreen ───────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    const elem = document.getElementById("queue-page-container");
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // ── Fetch helpers ───────────────────────────────────────────────────────────
  const fetchBranches = useCallback(
    async (searchTerm = "") => {
      try {
        const response = (await GetBranchesService({
          Page: 1,
          PageSize: 10,
          Search: searchTerm,
          SortColumn: "createdAt",
          SortDirection: "asc",
        })) as unknown as { success: boolean; data: Branch[] };
        if (response.success) {
          setBranches(response.data);
          if (!selectedBranch && response.data.length > 0)
            setSelectedBranch(response.data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      } finally {
        setLoadingBranches(false);
      }
    },
    [selectedBranch],
  );

  const fetchTherapists = useCallback(
    async (branchId?: number) => {
      const targetBranchId = branchId || selectedBranch;
      if (!targetBranchId) {
        setTherapists([]);
        return;
      }
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoadingTherapists(true);
      try {
        const response = (await GetTherapistsTodayService(
          targetBranchId,
        )) as unknown as { success: boolean; data: TherapistAPIResponse[] };
        if (response.success && response.data) {
          const transformed: TherapistQueue[] = response.data.map((t) => ({
            id: t.id,
            employeeName: t.employeeName,
            position: t.position,
            dateTime: t.clockInTime,
            status: t.status === "waiting" ? "waiting" : "do treatment",
          }));
          setTherapists(transformed);
          setCurrent(0);
        }
      } catch (error) {
        console.error("Failed to fetch therapists:", error);
      } finally {
        setLoadingTherapists(false);
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 500);
      }
    },
    [selectedBranch],
  );

  const fetchLeaderboard = useCallback(
    async (branchId?: number) => {
      const targetBranchId = branchId || selectedBranch;
      setLoadingLeaderboard(true);
      try {
        const res = await GetLeaderboardTodayService(
          targetBranchId || undefined,
        );
        if (res.success || res.meta?.success) setLeaderboard(res.data || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoadingLeaderboard(false);
      }
    },
    [selectedBranch],
  );

  const fetchRecentSessions = useCallback(
    async (branchId?: number) => {
      setLoadingRecentSessions(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await GetRecentSessionsService({
          startDate: today,
          endDate: today,
          branchId: branchId || selectedBranch || undefined,
        });
        if (res.success || res.meta?.success) {
          const sessions = Array.isArray(res.data)
            ? res.data
            : res.data?.pageData || [];
          setRecentSessions(sessions.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch recent sessions:", error);
      } finally {
        setLoadingRecentSessions(false);
      }
    },
    [selectedBranch],
  );

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchBranches("");
  }, [fetchBranches]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await GetPositionsService({
          Page: 1,
          PageSize: 100,
          SortColumn: "name",
          SortDirection: "asc",
        });
        if (res.success && res.data) setPositions(res.data);
      } catch (err) {
        console.error("Failed to fetch positions:", err);
      }
    };
    fetchPositions();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchTherapists(selectedBranch);
      fetchLeaderboard(selectedBranch);
      fetchRecentSessions();
    }
  }, [selectedBranch, fetchTherapists, fetchLeaderboard, fetchRecentSessions]);

  useEffect(() => {
    setExtraPage(1);
  }, [selectedPositionId, selectedBranch]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── SignalR listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleSessionCreated = (data: any) => {
      const text =
        data?.textToSpeech ?? data?.textToSpeach ?? "Ada notifikasi baru";
      TextToSpeechAndPlay({ text, language: "id" }).catch(console.error);
      if (selectedBranch) {
        fetchTherapists(selectedBranch);
        fetchLeaderboard(selectedBranch);
      }
      setCurrent(0);
    };
    // Dynamic event name based on branch: SessionCreated-{branchId}
    const eventName = selectedBranch
      ? `SessionCreated-${selectedBranch}`
      : "SessionCreated";
    signalROn(eventName, handleSessionCreated);
    return () => signalROff(eventName, handleSessionCreated);
  }, [
    signalROn,
    signalROff,
    selectedBranch,
    fetchTherapists,
    fetchLeaderboard,
  ]);

  useEffect(() => {
    const handleRefresh = (data: any) => {
      if (selectedBranch) {
        fetchTherapists(selectedBranch);
        fetchLeaderboard(selectedBranch);
        fetchRecentSessions();
      }
      setCurrent(0);
    };
    signalROn("RefreshQueueTherapist", handleRefresh);
    return () => signalROff("RefreshQueueTherapist", handleRefresh);
  }, [
    signalROn,
    signalROff,
    selectedBranch,
    fetchTherapists,
    fetchLeaderboard,
    fetchRecentSessions,
  ]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const filteredTherapists = useMemo(() => {
    if (!selectedPositionId) return therapists;
    const targetPos = positions.find((p) => p.id === selectedPositionId);
    if (!targetPos) return therapists;
    return therapists.filter(
      (t) => t.position?.toLowerCase() === targetPos.name?.toLowerCase(),
    );
  }, [therapists, selectedPositionId, positions]);

  // Only waiting list — treating section removed
  const waitingList = filteredTherapists.filter((t) => t.status === "waiting");
  const treatingList = filteredTherapists.filter(
    (t) => t.status === "do treatment",
  );

  const topCards = waitingList.slice(0, TOP_COUNT);
  const extraWaiting = waitingList.slice(TOP_COUNT);
  const totalExtraPages = Math.ceil(extraWaiting.length / extraPageSize);
  const paginatedExtra = extraWaiting.slice(
    (extraPage - 1) * extraPageSize,
    extraPage * extraPageSize,
  );

  const maxIndex = Math.max(0, topCards.length - 1);
  const selectedBranchName =
    branches.find((b) => b.id === selectedBranch)?.name || "";

  const branchOptions = branches.map((b) => ({
    label: `${b.name} (${b.city})`,
    value: b.id,
  }));
  const positionOptions = [
    { label: "Semua Posisi", value: 0 },
    ...positions.map((p) => ({ label: p.name, value: p.id })),
  ];

  // ── Navigation ──────────────────────────────────────────────────────────────
  const next = useCallback(
    () => setCurrent((c) => (c >= maxIndex ? 0 : c + 1)),
    [maxIndex],
  );
  const prev = useCallback(
    () => setCurrent((c) => (c <= 0 ? maxIndex : c - 1)),
    [maxIndex],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleStartTreatment = (id: number) => {
    setTherapists((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "do treatment" } : t)),
    );
    setCurrent(0);
  };

  // ── Rank colors ─────────────────────────────────────────────────────────────
  const rankStyle = (rank: number) => {
    if (rank === 1) return { bg: "#fef3c7", text: "#92400e" };
    if (rank === 2) return { bg: "#f1f5f9", text: "#475569" };
    if (rank === 3) return { bg: "#fef9ec", text: "#92400e" };
    return { bg: "#f8fafc", text: "#94a3b8" };
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    if (status === "completed")
      return {
        background: "#ecfdf5",
        color: "#065f46",
        border: "1px solid #a7f3d0",
      };
    if (status === "pending")
      return {
        background: "#fffbeb",
        color: "#92400e",
        border: "1px solid #fcd34d",
      };
    if (status === "claimed")
      return {
        background: "#eff6ff",
        color: "#1e40af",
        border: "1px solid #bfdbfe",
      };
    return {
      background: "#f8fafc",
      color: "#64748b",
      border: "1px solid #e2e8f0",
    };
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div id="queue-page-container" style={S.page(isFullscreen)}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        #queue-page-container *::-webkit-scrollbar { width: 4px; }
        #queue-page-container *::-webkit-scrollbar-track { background: transparent; }
        #queue-page-container *::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
        .qt-row-hover:hover { background: #f8fafc; }
        .lb-row-hover:hover { background: #f8fafc; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={S.header}>
        <div>
          <h2 style={S.h2}>Kehadiran Therapist</h2>
          <p style={S.dateTxt}>
            {currentTime.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div style={S.controlsRow}>
          <button onClick={toggleFullscreen} style={S.fsBtn}>
            <FullscreenIcon active={isFullscreen} />
            {isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          </button>
          <UseSelect
            options={positionOptions}
            value={selectedPositionId}
            onChange={(value) => setSelectedPositionId(value as number)}
            placeholder="Semua Posisi"
            className="w-40"
            allowClear={false}
          />
          <UseSelect
            options={branchOptions}
            value={selectedBranch}
            onChange={(value) => setSelectedBranch(value as number)}
            placeholder="Pilih Cabang"
            loading={loadingBranches}
            showSearch
            className="w-44"
            allowClear={false}
          />
        </div>
      </div>

      {/* ── Stat chips ─────────────────────────────────────────────────────── */}
      <div style={S.statBar}>
        <div style={S.chip(false)}>
          <span style={S.dot(false)} />
          <span>{waitingList.length} menunggu</span>
        </div>
        <div style={S.chip(true)}>
          <span style={S.dot(true)} />
          <span>{treatingList.length} sedang treatment</span>
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div style={S.mainGrid}>
        {/* ── LEFT COLUMN ──────────────────────────────────────────────────── */}
        <div style={S.leftCol}>
          {/* Section label + counter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span style={S.sectionLabel}>Menunggu Giliran</span>
            {topCards.length > 0 && (
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                {current + 1} / {topCards.length}
              </span>
            )}
          </div>

          {/* Top 3 cards */}
          {loadingTherapists ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                flexShrink: 0,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ ...S.card(false), minHeight: 140 }}>
                  <div
                    style={{
                      width: "60%",
                      height: 10,
                      background: "#f1f5f9",
                      borderRadius: 4,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : topCards.length === 0 ? (
            <div
              style={{
                flexShrink: 0,
                background: "#f8fafc",
                border: "1px solid #e8edf3",
                borderRadius: 14,
                padding: "28px 0",
                textAlign: "center",
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              Tidak ada antrian menunggu
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                flexShrink: 0,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {topCards.map((therapist, index) => (
                <div
                  key={therapist.id}
                  style={S.card(index === current)}
                  onClick={() => setCurrent(index)}
                >
                  <div style={S.cardNum}>{index + 1}</div>
                  <div style={S.avatar()}>
                    {getInitials(therapist.employeeName)}
                  </div>
                  <div>
                    <div style={S.cardName}>{therapist.employeeName}</div>
                    <div style={S.cardPos}>{therapist.position}</div>
                  </div>
                  <div style={S.cardStatus}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#94a3b8",
                      }}
                    />
                    Menunggu
                  </div>
                  <div style={S.cardTime}>
                    <svg
                      width={10}
                      height={10}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" strokeLinecap="round" />
                    </svg>
                    {formatTime(therapist.dateTime)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dot navigation */}
          {topCards.length > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <button
                onClick={prev}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <svg
                  width={10}
                  height={10}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M15 19l-7-7 7-7" strokeLinecap="round" />
                </svg>
              </button>
              {topCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    border: "none",
                    background: "none",
                    padding: 2,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      height: 4,
                      borderRadius: 2,
                      width: i === current ? 20 : 6,
                      background: i === current ? "#60a5fa" : "#e2e8f0",
                      transition: "all 0.2s",
                    }}
                  />
                </button>
              ))}
              <button
                onClick={next}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <svg
                  width={10}
                  height={10}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Extra waiting table */}
          <div style={S.tableCard}>
            <div style={S.tableHead}>
              <span style={S.sectionLabel}>Antrian Selanjutnya</span>
              {extraWaiting.length > 0 && (
                <span style={{ fontSize: 10, color: "#94a3b8" }}>
                  {extraWaiting.length} antrian
                </span>
              )}
            </div>
            <div style={S.tableBody}>
              {extraWaiting.length === 0 ? (
                <div
                  style={{
                    padding: "20px 0",
                    textAlign: "center",
                    fontSize: 12,
                    color: "#94a3b8",
                  }}
                >
                  Tidak ada antrian selanjutnya
                </div>
              ) : (
                <>
                  {/* Table header row */}
                  <div
                    style={{
                      ...S.tableRow,
                      background: "#f8fafc",
                      borderBottom: "1px solid #e8edf3",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      #
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      Nama
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      Datang
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      Est. Tunggu
                    </div>
                    <div />
                  </div>
                  {paginatedExtra.map((therapist, i) => {
                    const queuePos =
                      TOP_COUNT + (extraPage - 1) * extraPageSize + i;
                    return (
                      <div
                        key={therapist.id}
                        className="qt-row-hover"
                        style={S.tableRow}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "#f1f5f9",
                            color: "#64748b",
                            fontSize: 10,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {queuePos + 1}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                          }}
                        >
                          <div style={S.avatar()}>
                            {getInitials(therapist.employeeName)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#1e293b",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {therapist.employeeName}
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>
                              {therapist.position}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {formatTime(therapist.dateTime)}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {getEstWait(queuePos)}
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalExtraPages > 1 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 16px",
                        background: "#f8fafc",
                        borderTop: "1px solid #e8edf3",
                      }}
                    >
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>
                        Hal. {extraPage} / {totalExtraPages}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          disabled={extraPage === 1}
                          onClick={() =>
                            setExtraPage((p) => Math.max(1, p - 1))
                          }
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            color: "#64748b",
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: extraPage === 1 ? "not-allowed" : "pointer",
                            opacity: extraPage === 1 ? 0.4 : 1,
                          }}
                        >
                          ← Prev
                        </button>
                        <button
                          disabled={extraPage === totalExtraPages}
                          onClick={() =>
                            setExtraPage((p) =>
                              Math.min(totalExtraPages, p + 1),
                            )
                          }
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            color: "#64748b",
                            fontSize: 10,
                            fontWeight: 600,
                            cursor:
                              extraPage === totalExtraPages
                                ? "not-allowed"
                                : "pointer",
                            opacity: extraPage === totalExtraPages ? 0.4 : 1,
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────────────── */}
        <div style={S.rightCol}>
          {/* Recent Sessions */}
          <div style={S.widgetCard}>
            <div style={S.widgetHead}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "#ecfdf5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#059669"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}
                  >
                    Sesi Terbaru
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Hari ini</div>
                </div>
              </div>
            </div>
            <div style={S.widgetBody}>
              {loadingRecentSessions ? (
                <Spinner color="#059669" />
              ) : recentSessions.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    color: "#94a3b8",
                    fontSize: 12,
                  }}
                >
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth={1.5}
                  >
                    <path
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Belum ada sesi hari ini
                </div>
              ) : (
                recentSessions.map((session: any, index: number) => (
                  <div
                    key={session.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: `1px solid ${index === 0 ? "#bfdbfe" : "#f1f5f9"}`,
                      background: index === 0 ? "#eff6ff" : "#fafafa",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#64748b",
                        }}
                      >
                        {session.sessionCode}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginTop: 1,
                        }}
                      >
                        {session.serviceName} · {session.therapistName || "N/A"}
                      </div>
                      <div
                        style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}
                      >
                        {session.sessionDate} ·{" "}
                        {session.scheduledTime?.substring(0, 5)}
                        {session.roomName && ` · ${session.roomName}`}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          padding: "3px 7px",
                          borderRadius: 10,
                          ...statusBadgeStyle(session.status),
                        }}
                      >
                        {session.statusName}
                      </span>
                      {session.rating != null && (
                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <StarRating rating={session.rating} size={8} />
                          <span
                            style={{
                              fontSize: 8,
                              color: "#94a3b8",
                              fontWeight: 600,
                            }}
                          >
                            {session.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={S.widgetCard}>
            <div style={S.widgetHead}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "#fffbeb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M8 21H5a2 2 0 01-2-2v-1a5 5 0 015-5h8a5 5 0 015 5v1a2 2 0 01-2 2h-3M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}
                  >
                    Leaderboard Hari Ini
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>
                    Therapist paling aktif
                  </div>
                </div>
              </div>
              {selectedBranchName && (
                <span
                  style={{
                    fontSize: 10,
                    background: "#fffbeb",
                    color: "#92400e",
                    border: "1px solid #fcd34d",
                    padding: "3px 8px",
                    borderRadius: 10,
                    fontWeight: 500,
                  }}
                >
                  {selectedBranchName}
                </span>
              )}
            </div>
            <div style={S.widgetBody}>
              {loadingLeaderboard ? (
                <Spinner color="#d97706" />
              ) : leaderboard.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    color: "#94a3b8",
                    fontSize: 12,
                  }}
                >
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  Belum ada layanan selesai
                </div>
              ) : (
                leaderboard.map((t: any) => {
                  const rs = rankStyle(t.rank);
                  return (
                    <div
                      key={t.therapistId}
                      className="lb-row-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: `1px solid ${t.rank === 1 ? "#fcd34d" : "#f1f5f9"}`,
                        background: t.rank === 1 ? "#fffbeb" : "#fafafa",
                      }}
                    >
                      {/* Rank badge */}
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: rs.bg,
                          color: rs.text,
                          fontSize: 10,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {t.rank}
                      </div>

                      {/* Photo / initials */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#64748b",
                          }}
                        >
                          {t.therapistPhotoUrl ? (
                            <img
                              src={getPhotoUrl(t.therapistPhotoUrl)}
                              alt={t.therapistName}
                              style={{
                                width: 30,
                                height: 30,
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            getInitials(t.therapistName)
                          )}
                        </div>
                        {t.rank === 1 && (
                          <span
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -4,
                              fontSize: 11,
                            }}
                          >
                            👑
                          </span>
                        )}
                      </div>

                      {/* Name + stars */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#1e293b",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.therapistName}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            marginTop: 2,
                          }}
                        >
                          <StarRating rating={t.averageRating ?? 0} size={8} />
                          <span
                            style={{
                              fontSize: 9,
                              color: "#94a3b8",
                              fontWeight: 600,
                            }}
                          >
                            {t.averageRating ? t.averageRating.toFixed(1) : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Count */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1e293b",
                          }}
                        >
                          {t.totalServices}
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 400,
                              color: "#94a3b8",
                              marginLeft: 2,
                            }}
                          >
                            Layanan
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#94a3b8",
                            marginTop: 1,
                          }}
                        >
                          {t.totalRatedSessions} ulasan
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
