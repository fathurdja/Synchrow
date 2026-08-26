import { Button } from "@/components/ui/button";

export default function AttendancePage() {
  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-64px-64px)] flex flex-col lg:flex-row gap-6">
      {/* Left Side: Camera & Actions */}
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {/* Camera Window */}
        <div className="relative flex-1 bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-800 group min-h-[300px]">
          {/* Placeholder for video feed */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBznrQJhrVGBFMPd_jSphTXku5TLmjiqpzD1C-7GExJTxSRKshNH9DSbSc4ByUqnZaaCm3ltsmVEiCBKkvlKjrHWXs1rUsAu1Fb9aAyhRMlpLL3q75ESaMe7DfgHH3QpYJnSQQ6xzMNX8PwOdZuAc-iQl_J4pIlfT_dtGTggRlTu1u_tYQlnCTSkeZOpyuEOQqUAL7zxtbn2HxcpRTWcBRv1upfPukit6WL-sV_3lYopbMt4p-x3vJ0OA')" }}
          ></div>

          {/* Scanning Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[70%] border-2 border-dashed border-indigo-500/60 rounded-[20px] shadow-[0_0_0_9999px_rgba(15,23,42,0.4)]">
              <div className="absolute -top-0.5 -left-0.5 w-[30px] h-[30px] border-indigo-500 border-t-4 border-l-4 rounded-tl-[20px]"></div>
              <div className="absolute -top-0.5 -right-0.5 w-[30px] h-[30px] border-indigo-500 border-t-4 border-r-4 rounded-tr-[20px]"></div>
              <div className="absolute -bottom-0.5 -left-0.5 w-[30px] h-[30px] border-indigo-500 border-b-4 border-l-4 rounded-bl-[20px]"></div>
              <div className="absolute -bottom-0.5 -right-0.5 w-[30px] h-[30px] border-indigo-500 border-b-4 border-r-4 rounded-br-[20px]"></div>
            </div>
            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80 animate-[scan_2s_linear_infinite]"></div>
          </div>

          {/* Status Indicator */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700/50 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-sm font-medium text-white">Detecting Face...</span>
          </div>

          {/* Camera Controls */}
          <div className="absolute bottom-5 left-5 right-5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="icon" variant="ghost" className="w-10 h-10 rounded-full bg-slate-800/70 backdrop-blur text-white hover:bg-slate-700 hover:text-white border border-slate-600/50">
              <span className="material-symbols-outlined">cameraswitch</span>
            </Button>
            <Button size="icon" variant="ghost" className="w-10 h-10 rounded-full bg-slate-800/70 backdrop-blur text-white hover:bg-slate-700 hover:text-white border border-slate-600/50">
              <span className="material-symbols-outlined">settings</span>
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
              <span className="material-symbols-outlined text-slate-400 text-xl">person</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Awaiting Recognition</p>
              <p className="text-xs text-slate-400">Please align face within frame</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" disabled>Check Out</Button>
            <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 shadow-sm" disabled>Check In</Button>
          </div>
        </div>
      </div>

      {/* Right Side: Today's Log */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        {/* Time Card */}
        <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-600/20 shrink-0">
          <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider mb-1">Current Time</p>
          <h2 className="text-5xl font-bold tabular-nums leading-none">08:42<span className="text-2xl text-indigo-300 ml-1 font-semibold">AM</span></h2>
          <p className="text-sm text-indigo-100 mt-3">Monday, October 24, 2023</p>
        </div>

        {/* Log Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-900">Today&apos;s Log</h3>
            <span className="text-[11px] font-medium text-slate-400">Headquarters HQ</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <span className="material-symbols-outlined mb-2 text-4xl opacity-40">history</span>
              <p className="text-sm">No attendance records yet for today.</p>
              <p className="text-[11px] mt-1 text-slate-300">Scan face to check in.</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}} />
    </div>
  );
}
