"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GetBranchesService,
  GetTherapistsTodayService,
} from "@afx/services/queue.service";
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

export default function TherapistSlide() {
  const [therapists, setTherapists] = useState<TherapistQueue[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [current, setCurrent] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    fetchBranches("");
  }, [fetchBranches]);

  // Fetch therapists when branch is selected
  useEffect(() => {
    if (selectedBranch) {
      fetchTherapists(selectedBranch);
    }
  }, [selectedBranch]);

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
  }, [signalROn, signalROff, selectedBranch, fetchTherapists]);

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
  }, [signalROn, signalROff, selectedBranch, fetchTherapists]);

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

  // Split: waiting → top cards, do treatment → bottom table
  const waitingList = therapists.filter((t) => t.status === "waiting");
  const treatingList = therapists.filter((t) => t.status === "do treatment");

  const topCards = waitingList.slice(0, TOP_COUNT);
  const extraWaiting = waitingList.slice(TOP_COUNT);

  const total = topCards.length;
  const maxIndex = Math.max(0, total - 1);

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
    <div className="w-full px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
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
        <div className="flex items-center gap-2">
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
                {extraWaiting.map((therapist, i) => {
                  const queuePos = TOP_COUNT + i;
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
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {treatingList.map((therapist) => (
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
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-300">
        Geser untuk navigasi • Klik untuk pilih
      </p>
    </div>
  );
}
