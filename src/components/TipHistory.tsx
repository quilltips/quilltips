import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { supabase } from "@/integrations/supabase/client";

interface TipHistoryProps {
  authorId: string;
}

interface Tip {
  id: string;
  amount: number;
  message: string;
  created_at: string;
  book_title: string;
}

export const TipHistory = ({ authorId }: TipHistoryProps) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const { data, error } = await supabase
          .from('tips')
          .select('*')
          .eq('author_id', authorId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTips(data || []);
      } catch (error) {
        console.error("Error fetching tips:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTips();
  }, [authorId]);

  if (isLoading) {
    return <div>Loading tips...</div>;
  }

  return (
    <Card className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Book</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tips.map((tip) => (
            <TableRow key={tip.id}>
              <TableCell>
                {new Date(tip.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{tip.book_title || "N/A"}</TableCell>
              <TableCell>${tip.amount}</TableCell>
              <TableCell>{tip.message || "No message"}</TableCell>
            </TableRow>
          ))}
          {tips.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No tips received yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};