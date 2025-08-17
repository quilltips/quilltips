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
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Upcoming Release</h3>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-muted-foreground mb-1">Get ready for</p>
        <p className="font-medium text-foreground">{bookTitle}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="bg-background/50 rounded-md p-2 border">
            <div className="text-lg font-bold text-primary">{timeLeft.days}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Days</div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-background/50 rounded-md p-2 border">
            <div className="text-lg font-bold text-primary">{timeLeft.hours}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Hours</div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-background/50 rounded-md p-2 border">
            <div className="text-lg font-bold text-primary">{timeLeft.minutes}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Min</div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-background/50 rounded-md p-2 border">
            <div className="text-lg font-bold text-primary">{timeLeft.seconds}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Sec</div>
          </div>
        </div>
      </div>
    </div>
  );
};