"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  GetBranchesService,
  GetTherapistsTodayService,
  GetLeaderboardTodayService,
} from "@afx/services/queue.service";
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

export default function TherapistSlide() {
  const [therapists, setTherapists] = useState<TherapistQueue[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [current, setCurrent] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState(0);

  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number>(0);

  const [extraPage, setExtraPage] = useState(1);
  const [treatingPage, setTreatingPage] = useState(1);
  const extraPageSize = 5;
  const treatingPageSize = 5;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const toggleFullscreen = () => {
    const elem = document.getElementById("queue-page-container");
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error(err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Get authentication token from AuthContext
  const { token } = useAuth();

  // Initialize SignalR connection for real-time updates
  const { on: signalROn, off: signalROff } = useSignalR({
    hubName: "hubs/notification",
    accessToken: token || undefined, // Pass authentication token
    autoConnect: true,
    onConnected: () => {
      console.log(
        "[TherapistSlide] SignalR connected - listening for SessionCreated",
      );
    },
    onError: (error) => {
      console.error("[TherapistSlide] SignalR error:", error);
    },
  });

  // Fetch branches on mount
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
          // Select first branch by default if no branch selected
          if (!selectedBranch && response.data.length > 0) {
            setSelectedBranch(response.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      } finally {
        setLoadingBranches(false);
      }
    },
    [selectedBranch],
  );

  // Use ref to track if we're already fetching to prevent loops
  const isFetchingRef = useRef(false);

  // Fetch therapists when branch is selected
  const fetchTherapists = useCallback(
    async (branchId?: number) => {
      const targetBranchId = branchId || selectedBranch;
      if (!targetBranchId) {
        setTherapists([]);
        return;
      }

      // Prevent duplicate fetches
      if (isFetchingRef.current) {
        console.log("[TherapistSlide] Already fetching, skipping...");
        return;
      }

      isFetchingRef.current = true;
      setLoadingTherapists(true);
      try {
        const response = (await GetTherapistsTodayService(
          targetBranchId,
        )) as unknown as { success: boolean; data: TherapistAPIResponse[] };
        if (response.success && response.data) {
          // Transform API response to TherapistQueue format
          const transformedTherapists: TherapistQueue[] = response.data.map(
            (therapist: TherapistAPIResponse) => ({
              id: therapist.id,
              employeeName: therapist.employeeName,
              position: therapist.position,
              dateTime: therapist.clockInTime,
              status:
                therapist.status === "waiting" ? "waiting" : "do treatment",
            }),
          );
          setTherapists(transformedTherapists);
          setCurrent(0);
          setProgress(0);
        }
      } catch (error) {
        console.error("Failed to fetch therapists:", error);
      } finally {
        setLoadingTherapists(false);
        // Reset fetch flag after delay to allow next fetch
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 500);
      }
    },
    [selectedBranch],
  );

  // Fetch leaderboard today
  const fetchLeaderboard = useCallback(
    async (branchId?: number) => {
      const targetBranchId = branchId || selectedBranch;
      setLoadingLeaderboard(true);
      try {
        const res = await GetLeaderboardTodayService(targetBranchId || undefined);
        if (res.success || res.meta?.success) {
          setLeaderboard(res.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard today:", error);
      } finally {
        setLoadingLeaderboard(false);
      }
    },
    [selectedBranch],
  );

  useEffect(() => {
    fetchBranches("");
  }, [fetchBranches]);

  // Fetch positions on mount
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await GetPositionsService({
          Page: 1,
          PageSize: 100,
          SortColumn: "name",
          SortDirection: "asc",
        });
        if (res.success && res.data) {
          setPositions(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch positions:", err);
      }
    };
    fetchPositions();
  }, []);

  // Fetch therapists and leaderboard when branch is selected
  useEffect(() => {
    if (selectedBranch) {
      fetchTherapists(selectedBranch);
      fetchLeaderboard(selectedBranch);
    }
  }, [selectedBranch, fetchTherapists, fetchLeaderboard]);

  // Reset page pagination on filter/branch change
  useEffect(() => {
    setExtraPage(1);
    setTreatingPage(1);
  }, [selectedPositionId, selectedBranch]);

  // Listen for SessionCreated event from backend
  useEffect(() => {
    const handleSessionCreated = (data: any) => {
      console.log("[TherapistSlide] SessionCreated event received:", data);

      // Play text-to-speech
      const textToSpeechText =
        data?.textToSpeech ?? data?.textToSpeach ?? "Ada notifikasi baru";

      TextToSpeechAndPlay({ text: textToSpeechText, language: "id" }).catch(
        (error) => {
          console.error(
            "[TherapistSlide] Failed to play text-to-speech:",
            error,
          );
        },
      );

      // Fetch therapists again to get updated data
      if (selectedBranch) {
        console.log(
          "[TherapistSlide] Refreshing therapists after SessionCreated...",
        );
        fetchTherapists(selectedBranch);
        fetchLeaderboard(selectedBranch);
      }

      // Auto-slide to first card after data refresh
      setCurrent(0);
      setProgress(0);
    };

    signalROn("SessionCreated", handleSessionCreated);

    return () => {
      // Cleanup listener on unmount or re-run
      signalROff("SessionCreated", handleSessionCreated);
    };
  }, [signalROn, signalROff, selectedBranch, fetchTherapists, fetchLeaderboard]);

  // Listen for RefreshQueueTherapist event from backend
  useEffect(() => {
    const handleRefreshQueueTherapist = (data: any) => {
      console.log(
        "[TherapistSlide] RefreshQueueTherapist event received:",
        data,
      );

      // Fetch therapists again to get updated data (no text-to-speech)
      if (selectedBranch) {
        console.log(
          "[TherapistSlide] Refreshing therapists after RefreshQueueTherapist...",
        );
        fetchTherapists(selectedBranch);
        fetchLeaderboard(selectedBranch);
      }

      // Auto-slide to first card after data refresh
      setCurrent(0);
      setProgress(0);
    };

    signalROn("RefreshQueueTherapist", handleRefreshQueueTherapist);

    return () => {
      // Cleanup listener on unmount or re-run
      signalROff("RefreshQueueTherapist", handleRefreshQueueTherapist);
    };
  }, [signalROn, signalROff, selectedBranch, fetchTherapists, fetchLeaderboard]);

  // Handle branch search
  const handleBranchSearch = (searchTerm: string) => {
    setLoadingBranches(true);
    fetchBranches(searchTerm);
  };

  // Branch options for select dropdown
  const branchOptions = branches.map((branch) => ({
    label: `${branch.name} (${branch.city})`,
    value: branch.id,
  }));

  // Position options for select dropdown
  const positionOptions = [
    { label: "Semua Posisi", value: 0 },
    ...positions.map((pos) => ({
      label: pos.name,
      value: pos.id,
    })),
  ];

  // Filter therapists by position
  const filteredTherapists = useMemo(() => {
    if (!selectedPositionId) return therapists;
    const targetPos = positions.find((p) => p.id === selectedPositionId);
    if (!targetPos) return therapists;
    return therapists.filter(
      (t) => t.position?.toLowerCase() === targetPos.name?.toLowerCase()
    );
  }, [therapists, selectedPositionId, positions]);

  // Split: waiting → top cards, do treatment → bottom table
  const waitingList = filteredTherapists.filter((t) => t.status === "waiting");
  const treatingList = filteredTherapists.filter((t) => t.status === "do treatment");

  const topCards = waitingList.slice(0, TOP_COUNT);
  const extraWaiting = waitingList.slice(TOP_COUNT);

  // Paginated lists
  const totalExtraPages = Math.ceil(extraWaiting.length / extraPageSize);
  const paginatedExtraWaiting = extraWaiting.slice(
    (extraPage - 1) * extraPageSize,
    extraPage * extraPageSize
  );

  const totalTreatingPages = Math.ceil(treatingList.length / treatingPageSize);
  const paginatedTreating = treatingList.slice(
    (treatingPage - 1) * treatingPageSize,
    treatingPage * treatingPageSize
  );

  const total = topCards.length;
  const maxIndex = Math.max(0, total - 1);

  const selectedBranchName = branches.find((b) => b.id === selectedBranch)?.name || "";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    setProgress(0);
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrent((c) => (c <= 0 ? maxIndex : c - 1));
    setProgress(0);
  }, [maxIndex]);

  const goTo = (i: number) => {
    setCurrent(i);
    setProgress(0);
  };

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
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleStartTreatment = (id: number) => {
    setTherapists((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "do treatment" } : t)),
    );
    setCurrent(0);
    setProgress(0);
  };

  const handleFinish = (id: number) => {
    setTherapists((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "waiting" } : t)),
    );
  };

  return (
    <div
      id="queue-page-container"
      className={`w-full transition-all space-y-6 ${
        isFullscreen ? "p-8 bg-slate-50 overflow-y-auto h-screen" : "px-4 py-6"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Kehadiran Therapist
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentTime.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold active:scale-95 transition-all text-xs border border-slate-200 shadow-sm"
          >
            <svg
              style={{
                width: "14px",
                height: "14px",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 2,
              }}
              viewBox="0 0 24 24"
            >
              {isFullscreen ? (
                <path
                  d="M4 14h6v6M10 14l-7 7M20 10h-6V4M14 10l7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            <span>{isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}</span>
          </button>

          <UseSelect
            options={positionOptions}
            value={selectedPositionId}
            onChange={(value) => setSelectedPositionId(value as number)}
            placeholder="Semua Posisi"
            className="w-44"
            allowClear={false}
          />
          <UseSelect
            options={branchOptions}
            value={selectedBranch}
            onChange={(value) => setSelectedBranch(value as number)}
            placeholder="Pilih Cabang"
            loading={loadingBranches}
            showSearch
            className="w-48"
            allowClear={false}
          />
        </div>
      </div>

      {/* Grid Layout containing left & right columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Queue Slider and Tables */}
        <div className="lg:col-span-8 space-y-6">

      {/* Summary Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-xs font-medium text-slate-600">
            {waitingList.length} menunggu
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700">
            {treatingList.length} sedang treatment
          </span>
        </div>
      </div>

      {/* ── TOP CARDS — WAITING ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Menunggu Giliran
          </p>
          {total > 0 && (
            <span className="text-xs text-slate-400">
              {current + 1} / {total}
            </span>
          )}
        </div>

        {topCards.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-10 text-center">
            <p className="text-slate-400 text-sm">Tidak ada antrian menunggu</p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="w-full h-0.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: progress + "%" }}
              />
            </div>

            <div
              className="w-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-1 py-1">
                {topCards.map((therapist, index) => {
                  const isActive = index === current;
                  const estWait = getEstWait(index);

                  return (
                    <div
                      key={therapist.id}
                      className={
                        "relative rounded-2xl border shadow-sm p-5 flex flex-col items-center gap-3 bg-white transition-all duration-300 cursor-pointer hover:shadow-md " +
                        (isActive
                          ? "ring-2 ring-blue-400 ring-offset-2 border-blue-100"
                          : "border-slate-100")
                      }
                      onClick={() => goTo(index)}
                    >
                      {/* Queue Number */}
                      <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>

                      {/* Avatar */}
                      <div className="relative mt-2">
                        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xl font-bold">
                          {getInitials(therapist.employeeName)}
                        </div>
                      </div>

                      {/* Name */}
                      <div className="text-center">
                        <p className="font-bold text-slate-800 text-sm leading-tight">
                          {therapist.employeeName}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {therapist.position}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                        Menunggu
                      </div>

                      {/* Est Wait */}
                      <div className="flex items-center gap-1 text-xs text-slate-500 w-full justify-center">
                        <svg
                          className="w-3 h-3 text-slate-400 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {/* <span className="font-medium">{estWait}</span> */}
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">
                          {formatTime(therapist.dateTime)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dot Navigation */}
            {total > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={prev}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="flex gap-1.5 items-center">
                  {topCards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={
                        "h-1.5 rounded-full transition-all duration-200 " +
                        (i === current
                          ? "w-5 bg-blue-500"
                          : "w-1.5 bg-slate-300")
                      }
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* Extra waiting (beyond top 3) */}
        {extraWaiting.length > 0 && (
          <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Antrian Selanjutnya
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 w-10">
                    No
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400">
                    Nama
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 hidden sm:table-cell">
                    Datang
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 hidden sm:table-cell">
                    Est. Tunggu
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {paginatedExtraWaiting.map((therapist, i) => {
                  const queuePos = TOP_COUNT + (extraPage - 1) * extraPageSize + i;
                  return (
                    <tr
                      key={therapist.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                          {queuePos + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {getInitials(therapist.employeeName)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-tight">
                              {therapist.employeeName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {therapist.position}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                        {formatTime(therapist.dateTime)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                        {getEstWait(queuePos)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleStartTreatment(therapist.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                        >
                          Mulai
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Frontend Pagination Controls for Extra Waiting */}
            {totalExtraPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-medium">
                  Halaman {extraPage} dari {totalExtraPages} (Total {extraWaiting.length} antrian)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={extraPage === 1}
                    onClick={() => setExtraPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-all"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={extraPage === totalExtraPages}
                    onClick={() => setExtraPage((p) => Math.min(totalExtraPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-all"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM TABLE — DO TREATMENT ───────────────────── */}
      {treatingList.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Sedang Treatment
          </p>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                    Nama
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-emerald-600 uppercase tracking-wide hidden sm:table-cell">
                    Mulai
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedTreating.map((therapist) => (
                  <tr
                    key={therapist.id}
                    className="border-b border-emerald-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials(therapist.employeeName)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-tight">
                            {therapist.employeeName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {therapist.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                      {formatTime(therapist.dateTime)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Do Treatment
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Frontend Pagination Controls for Treating */}
            {totalTreatingPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-100/50 border-t border-emerald-100">
                <span className="text-xs text-emerald-700 font-medium">
                  Halaman {treatingPage} dari {totalTreatingPages} (Total {treatingList.length} terapis)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={treatingPage === 1}
                    onClick={() => setTreatingPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-all"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={treatingPage === totalTreatingPages}
                    onClick={() => setTreatingPage((p) => Math.min(totalTreatingPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-all"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

          <p className="text-center text-xs text-slate-300 pt-2">
            Geser untuk navigasi • Klik untuk pilih
          </p>
        </div>

        {/* RIGHT COLUMN: Today's Leaderboard Widget */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Leaderboard Hari Ini</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Therapist Paling Aktif</p>
                </div>
              </div>
              {selectedBranchName && (
                <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full border border-amber-100">
                  {selectedBranchName}
                </span>
              )}
            </div>

            {loadingLeaderboard ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <svg className="animate-spin" style={{ width: "24px", height: "24px", fill: "none", stroke: "#eab308", strokeWidth: 3 }} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="rgba(234,179,8,0.2)" />
                  <path d="M12 2C6.477 2 2 6.477 2 12" strokeLinecap="round" />
                </svg>
                <span className="text-xs text-slate-400 font-medium">Memuat peringkat...</span>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-center">
                <span className="text-2xl">✨</span>
                <span className="text-xs font-semibold">Belum ada layanan selesai hari ini</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {leaderboard.map((t: any) => {
                  const isTop3 = t.rank <= 3;
                  const rankColors = [
                    "from-amber-400 to-yellow-500 text-white shadow-amber-500/20", // 1st
                    "from-slate-300 to-slate-400 text-slate-800 shadow-slate-400/20", // 2nd
                    "from-amber-600 to-amber-700 text-white shadow-amber-700/20", // 3rd
                  ];
                  return (
                    <div
                      key={t.therapistId}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        t.rank === 1
                          ? "bg-amber-50/40 border-amber-200/60 shadow-sm shadow-amber-500/5"
                          : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Rank Badge */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-sm bg-gradient-to-br flex-shrink-0 ${
                            isTop3
                              ? rankColors[t.rank - 1]
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {t.rank}
                        </div>

                        {/* Photo/Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center">
                            {t.therapistPhotoUrl ? (
                              <img
                                src={getPhotoUrl(t.therapistPhotoUrl)}
                                alt={t.therapistName}
                                className="w-10 h-10 object-cover"
                              />
                            ) : (
                              <div className="text-xs font-bold text-slate-400 uppercase">
                                {getInitials(t.therapistName)}
                              </div>
                            )}
                          </div>
                          {t.rank === 1 && (
                            <span className="absolute -top-1.5 -right-1 text-xs">👑</span>
                          )}
                        </div>

                        {/* Name and Rating */}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 text-xs truncate">
                            {t.therapistName}
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  fill: i < (t.averageRating ?? 0) ? "#eab308" : "none",
                                  stroke: "#eab308",
                                  strokeWidth: 1.5,
                                }}
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ))}
                            <span className="text-[9px] text-slate-400 font-bold ml-1">
                              {t.averageRating ? t.averageRating.toFixed(1) : "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Details */}
                      <div className="text-right flex-shrink-0 pl-2">
                        <div className="text-slate-800 font-black text-xs">
                          {t.totalServices}{" "}
                          <span className="text-[9px] text-slate-400 font-medium">Layanan</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          {t.totalRatedSessions} ulasan
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
