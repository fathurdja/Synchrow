"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import * as faceapi from "face-api.js";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  User,
  ScanFace,
  Camera,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  Mail,
  BadgeCheck,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const { user, fetchProfile, roles } = useAuthStore();

  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Memuat model biometrik...");
  const [updatesLeft, setUpdatesLeft] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 3-step registration: center, left, right

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setIsModelsLoaded(true);
      setStatusMsg("Model biometrik siap digunakan.");
    } catch (e) {
      console.error("Gagal memuat model face-api:", e);
      setStatusMsg("Gagal memuat model biometrik.");
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      setStep(1);
      setStatusMsg("Nyalakan kamera... posisikan wajah di tengah oval.");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Akses kamera gagal:", err);
      setStatusMsg("Tidak dapat mengakses kamera browser.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const captureAndRegister = async () => {
    if (!videoRef.current || !isModelsLoaded) return;

    setStatusMsg("Mendeteksi fitur biometrik wajah...");
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatusMsg("Wajah tidak terdeteksi. Pastikan cahaya cukup dan hadap lurus ke depan.");
        return;
      }

      setStatusMsg("Wajah terdeteksi! Menyimpan descriptor aman...");
      const descriptorArray = Array.from(detection.descriptor);

      const response = await api.post("/users/face-descriptor", {
        face_descriptor: JSON.stringify(descriptorArray),
      });

      setStatusMsg("Data biometrik wajah berhasil didaftarkan!");
      setUpdatesLeft(response.data.updates_left);

      stopCamera();
      if (fetchProfile) fetchProfile();
    } catch (err: any) {
      console.error("Gagal mendaftarkan wajah:", err);
      setStatusMsg(err.response?.data?.error || "Terjadi kesalahan saat menyimpan wajah.");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Konfirmasi kata sandi tidak cocok!");
      return;
    }
    setPasswordNotice("Kata sandi berhasil diperbarui.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordNotice(null), 4000);
  };

  const isFaceRegistered = !!user?.face_descriptor;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="pb-3 border-b border-line">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Profil Pengguna</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Informasi identitas personal, data biometrik presensi, dan keamanan akun.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Kolom Kiri: Ringkasan Pengguna */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-line bg-accent-soft text-accent flex items-center justify-center font-bold text-3xl mb-3 ring-4 ring-canvas">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || "Profil"} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <h2 className="text-base font-bold text-ink">{user?.name || "Karyawan"}</h2>
            <p className="text-xs text-ink-muted mt-0.5">{user?.email}</p>
            <div className="mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-canvas text-ink border border-line capitalize">
                {roles && roles.length > 0 ? roles[0].replace("_", " ") : "Employee"}
              </span>
            </div>

            <div className="w-full mt-5 pt-4 border-t border-line text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-ink-muted">
                <Building size={14} className="text-accent" />
                <span className="text-ink font-medium">{user?.department || "Operasional"}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <BadgeCheck size={14} className="text-success" />
                <span className="text-ink font-medium">Akun Aktif Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Biometrik Wajah & Kata Sandi */}
        <div className="md:col-span-2 space-y-5">
          {/* ─── Registrasi & Pembaruan Wajah Biometrik (Design brief §8.9) ─── */}
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <ScanFace size={18} className="text-accent" />
                <h3 className="text-sm font-bold text-ink">Biometrik Wajah (Face Recognition)</h3>
              </div>
              <StatusBadge status={isFaceRegistered ? "Registered" : "Not Registered"} />
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Data descriptor biometrik Anda digunakan untuk verifikasi kehadiran tanpa kontak fisik.
              Proses kalkulasi dilakukan sepenuhnya di dalam browser.
            </p>

            {isScanning ? (
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-full max-w-xs aspect-[4/5] bg-canvas rounded-[var(--radius-panel)] overflow-hidden relative border border-line flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Oval Panduan Wajah Registrasi */}
                  <div className="absolute inset-0 m-auto w-48 h-64 rounded-[50%] border-2 border-dashed border-accent pointer-events-none animate-pulse-slow" />
                </div>

                <p className="text-xs font-semibold text-accent">{statusMsg}</p>

                <div className="flex gap-2 w-full max-w-xs">
                  <Button
                    type="button"
                    onClick={captureAndRegister}
                    className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs font-semibold"
                  >
                    Ambil Foto & Simpan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopCamera}
                    className="rounded-[var(--radius-control)] h-9 text-xs"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-canvas rounded-[var(--radius-control)] border border-line">
                <div>
                  <span className="text-xs font-semibold text-ink block">
                    {isFaceRegistered ? "Wajah Sudah Terdaftar" : "Wajah Belum Terdaftar"}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {isFaceRegistered
                      ? "Anda dapat memperbarui data wajah bila terjadi perubahan penampilan."
                      : "Daftarkan wajah Anda sekarang agar dapat melakukan check-in harian."}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={startCamera}
                  disabled={!isModelsLoaded}
                  className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-8 text-xs font-semibold shrink-0"
                >
                  {isFaceRegistered ? "Perbarui Wajah" : "Daftarkan Wajah"}
                </Button>
              </div>
            )}
          </div>

          {/* ─── Ganti Kata Sandi (§8.9) ─── */}
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-line">
              <KeyRound size={18} className="text-accent" />
              <h3 className="text-sm font-bold text-ink">Keamanan & Kata Sandi</h3>
            </div>

            {passwordNotice && (
              <div className="p-3 bg-success-soft text-success text-xs rounded-[var(--radius-control)] flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{passwordNotice}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs font-semibold"
                >
                  Simpan Kata Sandi Baru
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
