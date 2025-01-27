import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TipTableRow } from "./TipTableRow";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

interface TipTableProps {
  tips: any[];
  authorId: string;
  likes: any[];
  comments: any[];
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  onSelectTip: (tip: any) => void;
  limit?: number;
}

export const TipTable = ({
  tips,
  authorId,
  likes,
  comments,
  showAll,
  setShowAll,
  onSelectTip,
  limit
}: TipTableProps) => {
  const displayedTips = showAll ? tips : tips?.slice(0, 5);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Book</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedTips?.map((tip) => (
            <TipTableRow
              key={tip.id}
              tip={tip}
              authorId={authorId}
              likes={likes}
              comments={comments}
              onSelectTip={onSelectTip}
            />
          ))}
          {!tips?.length && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No tips received yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {tips && tips.length > 5 && !limit && (
        <Button
          variant="ghost"
          className="w-full mt-4 text-muted-foreground hover:text-foreground"
          onClick={() => setShowAll(!showAll)}
        >
          <ChevronDown className={`h-4 w-4 mr-2 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Show Less' : `Show ${tips.length - 5} More Tips`}
        </Button>
      )}
    </>
  );
};