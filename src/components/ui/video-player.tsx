import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from './button';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  posterTime?: number; // Time in seconds to capture poster frame
  alt: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  aspectRatio?: 'square' | 'video' | 'mobile' | 'custom';
  objectFit?: 'cover' | 'contain' | 'fill';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  posterTime,
  alt,
  className = '',
  autoPlay = false,
  muted = true,
  loop = true,
  controls = false,
  aspectRatio = 'video',
  objectFit = 'cover',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);

  // Generate poster from video frame
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !posterTime || poster) return;

    const generatePoster = () => {
      video.currentTime = posterTime;
    };

    const captureFrame = () => {
      if (canvas && video) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const posterDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setGeneratedPoster(posterDataUrl);
        }
      }
    };

    video.addEventListener('loadedmetadata', generatePoster);
    video.addEventListener('seeked', captureFrame);

    return () => {
      video.removeEventListener('loadedmetadata', generatePoster);
      video.removeEventListener('seeked', captureFrame);
    };
  }, [posterTime, poster]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (loop) {
        video.currentTime = 0;
        video.play();
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [loop]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => setShowControls(false);

  // Aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'mobile':
        return 'aspect-[9/16]';
      case 'custom':
        return 'aspect-[4/3]';
      default:
        return 'aspect-video';
    }
  };

  // Object fit classes
  const getObjectFitClass = () => {
    switch (objectFit) {
      case 'cover':
        return 'object-cover';
      case 'contain':
        return 'object-contain';
      case 'fill':
        return 'object-fill';
      default:
        return 'object-cover';
    }
  };

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hidden canvas for poster generation */}
      <canvas ref={canvasRef} className="hidden" />
      
      <video
        ref={videoRef}
        src={src}
        poster={generatedPoster || poster}
        className={`w-full ${getAspectRatioClass()} ${getObjectFitClass()} rounded-xl shadow-lg`}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
      />
      
      {/* Custom Controls Overlay */}
      {!controls && (
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex gap-2 p-4 bg-black/20 backdrop-blur-sm rounded-full">
            <Button
              variant="secondary"
              size="sm"
              onClick={togglePlay}
              className="w-10 h-10 p-0 rounded-full bg-white/90 hover:bg-white"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-gray-800" />
              ) : (
                <Play className="w-4 h-4 text-gray-800 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleMute}
              className="w-10 h-10 p-0 rounded-full bg-white/90 hover:bg-white"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-gray-800" />
              ) : (
                <Volume2 className="w-4 h-4 text-gray-800" />
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Play Button for Initial State */}
      {!isPlaying && !showControls && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={togglePlay}
            className="w-16 h-16 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg"
          >
            <Play className="w-6 h-6 text-gray-800 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}; 