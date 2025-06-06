
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OptimizedImage } from "./optimized-image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
}

export const ImageModal = ({ isOpen, onClose, src, alt, title }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] p-4">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="relative w-full h-full flex items-center justify-center">
          <OptimizedImage
            src={src}
            alt={alt}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            objectFit="contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
