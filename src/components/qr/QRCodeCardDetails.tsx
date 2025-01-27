import { format } from "date-fns";

interface QRCodeCardDetailsProps {
  qrCode: {
    total_tips?: number;
    total_amount?: number;
    average_tip?: number;
    last_tip_date?: string;
    publisher?: string;
    release_date?: string;
    isbn?: string;
  };
}

export const QRCodeCardDetails = ({ qrCode }: QRCodeCardDetailsProps) => {
  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Tips</p>
          <p className="font-semibold">{qrCode.total_tips || 0}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="font-semibold">${qrCode.total_amount?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Average Tip</p>
          <p className="font-semibold">${qrCode.average_tip?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Last Tip</p>
          <p className="font-semibold">
            {qrCode.last_tip_date ? format(new Date(qrCode.last_tip_date), 'MMM d, yyyy') : 'No tips yet'}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t">
        {qrCode.publisher && (
          <p className="text-sm">
            <span className="font-medium">Publisher:</span> {qrCode.publisher}
          </p>
        )}
        {qrCode.release_date && (
          <p className="text-sm">
            <span className="font-medium">Release Date:</span> {format(new Date(qrCode.release_date), 'PPP')}
          </p>
        )}
        {qrCode.isbn && (
          <p className="text-sm">
            <span className="font-medium">ISBN:</span> {qrCode.isbn}
          </p>
        )}
      </div>
    </div>
  );
};