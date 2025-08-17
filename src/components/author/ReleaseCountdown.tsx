import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

interface ReleaseCountdownProps {
  releaseDate: string;
  bookTitle: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const ReleaseCountdown = ({ releaseDate, bookTitle }: ReleaseCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isReleased, setIsReleased] = useState(false);

  useEffect(() => {
    const targetDate = new Date(releaseDate).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsReleased(false);
      } else {
        setIsReleased(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [releaseDate]);

  if (isReleased) {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">📚 Now Available!</h3>
        </div>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{bookTitle}</span> is now available!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#ffd166]/20 border border-[#333333]/50 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
         
          <h3 className="font-medium text-foreground">
            Next Release: <span className="font-semibold">{bookTitle}</span>
          </h3>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-bold text-primary">{timeLeft.days}</span>
            <span className="text-muted-foreground text-xs">d</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-primary">{timeLeft.hours}</span>
            <span className="text-muted-foreground text-xs">h</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-primary">{timeLeft.minutes}</span>
            <span className="text-muted-foreground text-xs">m</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-primary">{timeLeft.seconds}</span>
            <span className="text-muted-foreground text-xs">s</span>
          </div>
        </div>
      </div>
    </div>
  );
};