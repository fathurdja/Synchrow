"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import * as faceapi from 'face-api.js';
import Image from "next/image";

export default function ProfilePage() {
  const { user, fetchProfile } = useAuthStore();
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Loading AI Models...");
  const [updatesLeft, setUpdatesLeft] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelsLoaded(true);
        setStatusMsg("Ready to scan");
      } catch (e) {
        console.error("Failed to load models", e);
        setStatusMsg("Error loading AI models. Please check your connection.");
      }
    };
    
    // Check initial user status or fetch it
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      setStatusMsg("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setStatusMsg("Please position your face in the center of the camera.");
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to access camera.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setStatusMsg("Ready to scan");
  };

  const captureAndRegister = async () => {
    if (!videoRef.current || !isModelsLoaded) return;
    
    setStatusMsg("Analyzing face...");
    try {
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        setStatusMsg("Face not detected. Please adjust lighting and position.");
        return;
      }

      setStatusMsg("Face detected! Saving data...");
      
      // Save descriptor to backend
      const descriptorArray = Array.from(detection.descriptor);
      
      const response = await api.post('/users/face-descriptor', {
        face_descriptor: JSON.stringify(descriptorArray)
      });

      setStatusMsg("Face registered successfully!");
      setUpdatesLeft(response.data.updates_left);
      
      stopCamera();
      fetchProfile(); // Refresh user state if we store face presence there
      
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err.response?.data?.error || "An error occurred while saving face data.");
    }
  };

  if (!user) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-brand-primary tracking-tight">My Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and face recognition data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-brand-accent/30 shadow-md">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-primary text-white flex items-center justify-center text-3xl font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
            <p className="text-sm text-slate-500 mb-2">{user.position}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-secondary/10 text-brand-secondary">
              {user.employment_status || "Active"}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <p className="text-sm text-slate-700 font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">NIP</label>
              <p className="text-sm text-slate-700 font-medium">{user.nip || "-"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Join Date</label>
              <p className="text-sm text-slate-700 font-medium">
                {user.join_date ? new Date(user.join_date).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Face Data Registration */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-brand-highlight/10 text-brand-highlight rounded-lg">
                  <span className="material-symbols-outlined">face_recognition</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Face Recognition Data</h3>
                  <p className="text-sm text-slate-500">Update your biometric data for seamless attendance check-in.</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3 text-blue-800">
                <span className="material-symbols-outlined text-blue-600">info</span>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Face Data Limit</p>
                  <p>You can only update your face data <strong>3 times per month</strong>. {updatesLeft !== null && `You have ${updatesLeft} updates left this month.`}</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                {/* Camera Viewport */}
                <div className="w-full max-w-sm aspect-video bg-black rounded-xl overflow-hidden relative shadow-inner mb-6">
                  {isScanning ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">no_photography</span>
                      <span className="text-sm font-medium">Camera is off</span>
                    </div>
                  )}
                  {/* Status Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] text-center">
                    <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-full">
                      {statusMsg}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {!isScanning ? (
                    <Button 
                      onClick={startCamera} 
                      disabled={!isModelsLoaded}
                      className="bg-brand-secondary hover:bg-brand-primary min-w-[140px]"
                    >
                      <span className="material-symbols-outlined mr-2 text-[18px]">videocam</span>
                      Open Camera
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={captureAndRegister}
                        className="bg-brand-highlight hover:bg-[#d47200] text-white min-w-[140px]"
                      >
                        <span className="material-symbols-outlined mr-2 text-[18px]">camera</span>
                        Scan & Save
                      </Button>
                      <Button 
                        onClick={stopCamera} 
                        variant="outline"
                        className="min-w-[140px]"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
