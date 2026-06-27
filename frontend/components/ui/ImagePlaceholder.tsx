import { Image as ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  label: string;
  height?: string;
  style?: React.CSSProperties;
}

export function ImagePlaceholder({ label, height = "280px", style }: ImagePlaceholderProps) {
  return (
    <div 
      className="img-placeholder" 
      style={{ 
        minHeight: height,
        ...style 
      }}
    >
      <ImageIcon size={32} />
      <span>{label}</span>
    </div>
  );
}
