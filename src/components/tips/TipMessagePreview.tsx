
interface TipMessagePreviewProps {
  message?: string;
}

export const TipMessagePreview = ({ message }: TipMessagePreviewProps) => {
  if (!message) return null;
  
  return (
    <p className="font-medium">
      "{message}"
    </p>
  );
};
