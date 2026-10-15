"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import * as faceapi from "face-api.js";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ScanFace,
  UserCheck,
  History,
  ShieldCheck,
} from "lucide-react";

export default function AttendancePage() {
  const { user } = useAuthStore();

  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Camera & Face states per brief §8.3
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [statusMsg, setStatusMsg] = useState("Memuat model biometrik...");
  const [matchResult, setMatchResult] = useState<"match" | "no-match" | "searching" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchHistory();
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/attendances");
      const list = response.data || [];
      setAttendances(list);

      // Check if user has checked in today
      const todayStr = new Date().toISOString().split("T")[0];
      const today = list.find((item: any) => item.date?.startsWith(todayStr));
      setTodayRecord(today || null);
    } catch (err) {
      console.error("Gagal mengambil riwayat absensi:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadModels = async () => {
    try {
      const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setIsModelsLoaded(true);
      setStatusMsg("Model biometrik siap. Klik Mulai Absen.");
    } catch (e) {
      console.error("Gagal memuat model face-api:", e);
      setStatusMsg("Gagal memuat model AI. Periksa koneksi internet.");
    }
  };

  const startScanning = async () => {
    if (!user?.face_descriptor) {
      setStatusMsg("Wajah Anda belum terdaftar. Silakan daftarkan terlebih dahulu.");
      return;
    }

    try {
      setIsScanning(true);
      setMatchResult("searching");
      setStatusMsg("Menghubungkan ke kamera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setCameraPermission("granted");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setStatusMsg("Arahkan wajah ke dalam oval.");

      // Delay briefly for camera stabilization, then verify
      setTimeout(verifyFace, 1200);
    } catch (err) {
      console.error("Akses kamera ditolak:", err);
      setCameraPermission("denied");
      setStatusMsg("Kamera diblokir. Aktifkan lewat pengaturan browser, lalu muat ulang.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setMatchResult(null);
  };

  const verifyFace = async () => {
    if (!videoRef.current || !isModelsLoaded || !user?.face_descriptor) return;

    setStatusMsg("Mencari wajah...");
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMatchResult("searching");
        setStatusMsg("Wajah belum terdeteksi. Posisikan wajah di dalam oval.");
        if (streamRef.current) {
          setTimeout(verifyFace, 800);
        }
        return;
      }

      // Calculate euclidean distance with stored face descriptor
      const storedDescriptor = new Float32Array(JSON.parse(user.face_descriptor));
      const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);

      if (distance < 0.55) {
        setMatchResult("match");
        setStatusMsg("Wajah cocok! Silakan tekan tombol konfirmasi di bawah.");
      } else {
        setMatchResult("no-match");
        setStatusMsg("Wajah belum cocok. Coba lagi dengan wajah menghadap lurus.");
      }
    } catch (err) {
      console.error("Kesalahan verifikasi wajah:", err);
      setStatusMsg("Gagal memproses gambar wajah. Coba lagi.");
    }
  };

  // Determine action: 'in' or 'out'
  const actionType: "in" | "out" = todayRecord?.check_in && !todayRecord?.check_out ? "out" : "in";
  const actionLabel = actionType === "in" ? "Check-in Masuk" : "Check-out Pulang";

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      const endpoint = actionType === "in" ? "/attendances/check-in" : "/attendances/check-out";
      await api.post(endpoint, { location: "Kantor Pusat (HQ)" });
      setStatusMsg(`${actionLabel} berhasil dicatat.`);
      stopCamera();
      fetchHistory();
    } catch (err: any) {
      alert(err.response?.data?.error || `Gagal melakukan ${actionLabel}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            {actionType === "in" ? "Absen Masuk" : "Absen Pulang"}
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Verifikasi biometrik wajah langsung melalui browser kamera.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface border border-line px-3.5 py-1.5 rounded-[var(--radius-control)]">
          <Clock size={16} className="text-accent" />
          <div className="text-right">
            <span className="text-xs text-ink-muted block">{currentDate}</span>
            <span className="text-sm font-bold text-ink tabular-nums">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* ─── Main Scanner Card (Designed Mobile-First per §8.3) ─── */}
      <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 md:p-8 flex flex-col items-center">
        {/* Face Guidance Oval Container */}
        <div className="w-full max-w-sm aspect-[4/5] bg-canvas rounded-[var(--radius-panel)] overflow-hidden relative border border-line flex items-center justify-center shadow-inner">
          {isScanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Oval Panduan Wajah (Design brief §8.3) */}
              <div
                className={`absolute inset-0 m-auto w-56 h-72 rounded-[50%] border-2 transition-all duration-300 pointer-events-none flex flex-col items-center justify-between py-6 ${
                  matchResult === "match"
                    ? "border-success shadow-[0_0_0_9999px_rgba(22,128,60,0.15)]"
                    : matchResult === "no-match"
                    ? "border-danger shadow-[0_0_0_9999px_rgba(196,43,43,0.15)]"
                    : "border-accent/80 border-dashed animate-pulse-slow shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]"
                }`}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface/90 text-ink backdrop-blur-xs">
                  {matchResult === "match" ? "Wajah Terverifikasi" : "Posisikan Wajah Di Sini"}
                </div>
                <div className="w-4 h-4 rounded-full border border-surface/50" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                <ScanFace size={32} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Kamera Belum Aktif</p>
                <p className="text-xs text-ink-muted mt-1 max-w-[200px]">
                  Klik tombol di bawah untuk menyalakan verifikasi wajah.
                </p>
              </div>
            </div>
          )}

          {/* Status Message Overlay at Bottom */}
          <div className="absolute bottom-3 inset-x-3 text-center pointer-events-none">
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs ${
                matchResult === "match"
                  ? "bg-success text-white"
                  : matchResult === "no-match"
                  ? "bg-danger text-white"
                  : "bg-surface/90 text-ink border border-line"
              }`}
            >
              {statusMsg}
            </span>
          </div>
        </div>

        {/* Slot Backlog: Geofencing & Liveness indicator (§8.3) */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-accent" />
            <span>Lokasi: <strong>Kantor Pusat (Dalam Radius)</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-accent" />
            <span>Liveness: Tatap kamera lurus</span>
          </div>
        </div>

        {/* Warning if face not registered */}
        {!user?.face_descriptor && (
          <div className="mt-4 w-full max-w-sm p-3.5 bg-warning-soft border border-warning/20 rounded-[var(--radius-control)] text-xs text-warning flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>Wajah Anda belum terdaftar di sistem.</span>
            </div>
            <Link href="/profile">
              <Button size="sm" variant="outline" className="h-7 text-xs border-warning/40 text-warning hover:bg-warning-soft rounded-[var(--radius-control)]">
                Daftar Wajah
              </Button>
            </Link>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-6 w-full max-w-sm space-y-3">
          {!isScanning ? (
            <Button
              type="button"
              onClick={startScanning}
              disabled={!isModelsLoaded || !user?.face_descriptor}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] font-semibold text-sm gap-2"
            >
              <Camera size={16} />
              Mulai Verifikasi Wajah
            </Button>
          ) : matchResult === "match" ? (
            <Button
              type="button"
              disabled={isProcessing}
              onClick={handleAction}
              className={`w-full h-11 text-white rounded-[var(--radius-control)] font-semibold text-sm gap-2 shadow-xs transition-all ${
                actionType === "in"
                  ? "bg-success hover:bg-success/90"
                  : "bg-warning hover:bg-warning/90"
              }`}
            >
              <CheckCircle2 size={16} />
              {isProcessing ? "Menyimpan Catatan..." : `Konfirmasi ${actionLabel}`}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={verifyFace}
                className="flex-1 h-10 border-line text-ink hover:text-accent rounded-[var(--radius-control)] text-xs gap-1.5"
              >
                <RefreshCw size={14} />
                Pindai Ulang
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
                className="flex-1 h-10 border-line text-ink hover:text-danger rounded-[var(--radius-control)] text-xs"
              >
                Batalkan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Riwayat 7 Hari Terakhir (Collapsible per §8.3) ─── */}
      <div className="bg-surface border border-line rounded-[var(--radius-card)] overflow-hidden shadow-none">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-5 py-3.5 border-b border-line bg-canvas/30 flex items-center justify-between text-left hover:bg-canvas/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History size={16} className="text-accent" />
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              Riwayat Kehadiran (7 Hari Terakhir)
            </span>
          </div>
          {showHistory ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
        </button>

        {showHistory && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/20">
                  <th className="py-2.5 px-5 text-xs font-semibold text-ink-muted">Tanggal</th>
                  <th className="py-2.5 px-5 text-xs font-semibold text-ink-muted">Jam Masuk</th>
                  <th className="py-2.5 px-5 text-xs font-semibold text-ink-muted">Jam Pulang</th>
                  <th className="py-2.5 px-5 text-xs font-semibold text-ink-muted">Lokasi</th>
                  <th className="py-2.5 px-5 text-xs font-semibold text-ink-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-ink-muted">
                      Memuat data kehadiran...
                    </td>
                  </tr>
                ) : attendances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-ink-muted">
                      Belum ada catatan absensi.
                    </td>
                  </tr>
                ) : (
                  attendances.slice(0, 7).map((att: any) => (
                    <tr key={att.id} className="hover:bg-canvas/30 transition-colors">
                      <td className="py-3 px-5 font-medium text-ink">
                        {new Date(att.date).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="py-3 px-5 text-ink tabular-nums">{att.check_in || "-"}</td>
                      <td className="py-3 px-5 text-ink tabular-nums">{att.check_out || "-"}</td>
                      <td className="py-3 px-5 text-ink-muted text-xs">{att.location || "Kantor Pusat"}</td>
                      <td className="py-3 px-5">
                        <StatusBadge status={att.status || "Hadir"} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
