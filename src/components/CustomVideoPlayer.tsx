import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Gauge,
  ShieldCheck,
  Lock,
  Sparkles,
  Tv
} from 'lucide-react';
import { StudentUser } from '../data/initialData';

interface CustomVideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnail?: string;
  studentUser: StudentUser | null;
  theme?: 'dark' | 'light';
  onEnded?: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  videoUrl,
  title,
  thumbnail,
  studentUser,
  theme = 'dark',
  onEnded
}) => {
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Dynamic moving watermark coordinates (Anti-Leak system)
  const [watermarkPos, setWatermarkPos] = useState({ top: 15, left: 15 });

  useEffect(() => {
    // Slowly glide watermark every 6 seconds to prevent screen recording and cropping
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 65) + 10; // 10% to 75%
      const randomLeft = Math.floor(Math.random() * 60) + 10; // 10% to 70%
      setWatermarkPos({ top: randomTop, left: randomLeft });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const isDirectFile =
    videoUrl.endsWith('.mp4') ||
    videoUrl.endsWith('.webm') ||
    videoUrl.endsWith('.ogg') ||
    videoUrl.includes('.mp4?') ||
    videoUrl.startsWith('blob:');

  // Convert YouTube / Vimeo link to clean embedded URL without external branding
  const getCleanEmbedUrl = (url: string) => {
    let clean = url.trim();
    if (clean.includes('youtube.com/watch?v=')) {
      const videoId = clean.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&iv_load_policy=3&controls=1&disablekb=0&playsinline=1`;
    }
    if (clean.includes('youtu.be/')) {
      const videoId = clean.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&iv_load_policy=3&controls=1&disablekb=0&playsinline=1`;
    }
    if (clean.includes('drive.google.com/file/d/')) {
      const fileId = clean.split('/d/')[1]?.split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return clean;
  };

  // Video element event listeners
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Show controls on mouse move and hide after inactivity
  const handleMouseMove = () => {
    setControlsVisible(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const watermarkText = studentUser
    ? `${studentUser.name} • ${studentUser.phone}`
    : 'المكتبة التعليمية الرسمية • محمي ضد النسخ';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onContextMenu={(e) => e.preventDefault()} // Disable right click context menu completely
      className={`relative rounded-3xl overflow-hidden shadow-2xl select-none group transition-all duration-300 ${
        isTheater ? 'aspect-[21/9]' : 'aspect-video'
      } w-full bg-slate-950`}
      dir="ltr"
    >
      {/* Dynamic Floating Watermark (Anti-Piracy Shield) */}
      <div
        className="absolute pointer-events-none z-30 transition-all duration-1000 ease-out"
        style={{
          top: `${watermarkPos.top}%`,
          left: `${watermarkPos.left}%`
        }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/60 text-[11px] font-mono tracking-wider shadow-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span>{watermarkText}</span>
        </div>
      </div>

      {/* Official Platform Security Badge (Top-Right) */}
      <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-[11px] font-bold shadow-lg">
        <Lock className="w-3 h-3 text-emerald-400" />
        <span className="hidden sm:inline">محمي برخصة منصة محمد رمضان الحرباوي 🔒</span>
        <span className="sm:hidden">فيديو محمي 🔒</span>
      </div>

      {/* Video Rendering */}
      {isDirectFile ? (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnail}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
          />

          {/* Central Play/Pause Button when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
              aria-label="تشغيل"
            >
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </button>
          )}

          {/* Custom Sleek Video Controls Overlay */}
          <div
            className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4 transition-opacity duration-300 z-25 ${
              controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Progress Scrubber */}
            <div className="relative mb-3 flex items-center group/scrub">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white text-xs gap-3">
              {/* Left Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 hover:text-indigo-400 transition-colors cursor-pointer"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  onClick={() => skipTime(-10)}
                  className="p-1 hover:text-indigo-400 transition-colors cursor-pointer"
                  title="رجوع 10 ثوانٍ"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => skipTime(10)}
                  className="p-1 hover:text-indigo-400 transition-colors cursor-pointer"
                  title="تقديم 10 ثوانٍ"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button onClick={toggleMute} className="p-1 hover:text-indigo-400 transition-colors cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Time Display */}
                <div className="font-mono text-[11px] text-slate-300">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 relative">
                {/* Speed Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-mono font-bold transition-colors cursor-pointer"
                    title="سرعة التشغيل"
                  >
                    <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{playbackSpeed}x</span>
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full mb-2 right-0 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 min-w-[80px] z-30">
                      {[0.75, 1, 1.25, 1.5, 2].map((sp) => (
                        <button
                          key={sp}
                          onClick={() => changeSpeed(sp)}
                          className={`px-3 py-1 text-xs rounded-lg font-mono text-center transition-colors cursor-pointer ${
                            playbackSpeed === sp
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Theater Mode */}
                <button
                  onClick={() => setIsTheater(!isTheater)}
                  className="p-1.5 hover:text-indigo-400 transition-colors cursor-pointer hidden sm:block"
                  title="وضع المسرح"
                >
                  <Tv className="w-4 h-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:text-indigo-400 transition-colors cursor-pointer"
                  title="ملء الشاشة"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Protected Embedded Iframe with Anti-Redirection Shield */
        <div className="relative w-full h-full overflow-hidden">
          {/* Top Shield Mask: Prevents clicking YouTube Title or Channel Avatar to leave site */}
          <div
            className="absolute top-0 inset-x-0 h-16 z-15 cursor-default bg-transparent"
            title="مشغل فيديو محمي مدمج في المنصة"
          />

          <iframe
            src={getCleanEmbedUrl(videoUrl)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />

          {/* Bottom Custom Bar with Branding and Native Player Presence */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent py-2 px-4 flex items-center justify-between text-xs text-slate-300 pointer-events-none z-15">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-[11px] text-amber-300">
                منصة محمد رمضان الحرباوي • مشغل مباشر
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              بث تعليمي آمن 100%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
