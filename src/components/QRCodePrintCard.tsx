import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";

interface QRCodePrintCardProps {
  qrCode: {
    id: string;
    author_id: string;
    book_title: string;
  };
}

const QRCodePrintCard = ({ qrCode }: QRCodePrintCardProps) => {
  const qrValue = `${window.location.origin}/author/profile/${qrCode.author_id}?qr=${qrCode.id}`;

  const handleDownloadImage = async () => {
    const element = document.getElementById("printable-qr");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imgData;
    link.download = `qr-code-${qrCode.book_title || "download"}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 py-8 font-ag">
      <div
        id="printable-qr"
        className="bg-white w-[4in] h-[6in] overflow-hidden rounded-[24px] shadow border flex flex-col justify-between items-center p-6 text-center"
      >
        <div className="text-lg font-semibold text-[#403E43]">
          Like the book?
          <br />
          Tip the author!
        </div>

        <div className="relative">
          <QRCodeCanvas
            id="qr-canvas"
            value={qrValue}
            size={320}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
          />
          <img
            src="/logo-feather.svg"
            alt="Logo"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>

        <div className="text-base font-medium text-[#403E43]">Quilltips LLC</div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleDownloadImage}
          className="text-sm text-[#9b87f5] hover:underline"
        >
          Download QR Card as Image
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Does your publisher need access to info about this book in Quilltips?{' '}
          <button className="text-[#9b87f5] hover:underline">
            Send an invite
          </button>{' '}
          to your publisher to claim this book.
        </p>
      </div>
    </div>
  );
};

export default QRCodePrintCard;
