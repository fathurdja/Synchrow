"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import * as faceapi from 'face-api.js';
import Image from "next/image";

export default function AttendancePage() {
  const { user } = useAuthStore();
  
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // Camera & Face states
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Loading AI Models...");
  const [matchResult, setMatchResult] = useState<'match' | 'no-match' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchHistory();
    loadModels();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/attendances');
      setAttendances(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      setIsModelsLoaded(true);
      setStatusMsg("Models loaded. Ready.");
    } catch (e) {
      console.error("Failed to load models", e);
      setStatusMsg("Error loading AI models.");
    }
  };

  const startScanning = async () => {
    if (!user?.face_descriptor) {
      alert("You have not registered your face data yet. Please go to Profile to set it up.");
      return;
    }
    try {
      setIsScanning(true);
      setMatchResult(null);
      setStatusMsg("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setStatusMsg("Please look at the camera...");
      
      // Give time for video to start playing, then attempt verify
      setTimeout(verifyFace, 1500);
      
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
  };

  const verifyFace = async () => {
    if (!videoRef.current || !isModelsLoaded || !user?.face_descriptor) return;
    
    setStatusMsg("Verifying identity...");
    try {
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        setStatusMsg("Face not detected. Retrying...");
        setTimeout(verifyFace, 1000);
        return;
      }

      // We have a live descriptor, compare with stored
      const storedDescriptor = new Float32Array(JSON.parse(user.face_descriptor));
      
      // Calculate euclidean distance
      const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);
      // threshold usually 0.6 for match
      if (distance < 0.55) {
        setMatchResult('match');
        setStatusMsg("Identity Verified! You may now check in/out.");
      } else {
        setMatchResult('no-match');
        setStatusMsg("Identity verification failed. Face does not match.");
      }
      
    } catch (err) {
      console.error(err);
      setStatusMsg("Verification error.");
    }
  };

  const handleAction = async (type: 'in' | 'out') => {
    setIsProcessing(true);
    try {
      const endpoint = type === 'in' ? '/attendances/check-in' : '/attendances/check-out';
      await api.post(endpoint, { location: 'Office' });
      alert(`Successfully checked ${type}!`);
      stopCamera();
      fetchHistory();
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to check ${type}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight">Attendance</h2>
        <p className="text-sm text-slate-500 mt-1">Live Face Recognition Check-In / Check-Out</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Camera and Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
            
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-inner mb-6 flex items-center justify-center">
              {isScanning ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className={`w-full h-full object-cover transform -scale-x-100 ${matchResult === 'match' ? 'border-4 border-emerald-500' : matchResult === 'no-match' ? 'border-4 border-rose-500' : ''}`}
                />
              ) : (
                <div className="text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">flip_camera_ios</span>
                  <p className="text-sm">Camera Offline</p>
                </div>
              )}

              {/* Overlay Status */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] text-center">
                <span className={`inline-block px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-full ${matchResult === 'match' ? 'bg-emerald-500/80 text-white' : matchResult === 'no-match' ? 'bg-rose-500/80 text-white' : ''}`}>
                  {statusMsg}
                </span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              {!isScanning ? (
                <Button onClick={startScanning} disabled={!isModelsLoaded} className="w-full bg-brand-primary hover:bg-brand-secondary text-white h-12">
                  <span className="material-symbols-outlined mr-2">face_recognition</span>
                  Start Verification
                </Button>
              ) : matchResult === 'match' ? (
                <div className="flex gap-2">
                  <Button disabled={isProcessing} onClick={() => handleAction('in')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12">
                    Check In
                  </Button>
                  <Button disabled={isProcessing} onClick={() => handleAction('out')} className="flex-1 bg-amber-600 hover:bg-amber-700 h-12">
                    Check Out
                  </Button>
                </div>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="w-full h-12">
                  Cancel
                </Button>
              )}
            </div>

            {!user?.face_descriptor && (
              <div className="mt-4 w-full p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs text-center font-medium">
                Please register your face in the Profile page first before you can check in.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">My Attendance History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200">
                    <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Check In</th>
                    <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Check Out</th>
                    <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingHistory ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-slate-500">Loading history...</td>
                    </tr>
                  ) : attendances.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-slate-500">No records found.</td>
                    </tr>
                  ) : (
                    attendances.map((att: any) => (
                      <tr key={att.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {new Date(att.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {att.check_in || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {att.check_out || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            att.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                            att.status === 'Late' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            'bg-slate-50 text-slate-500 border border-slate-200'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
