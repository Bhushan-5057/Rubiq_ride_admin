import  { useEffect, useState } from "react";

interface IconProps {
  size?: number;
  color?: string;
  letter?: string;
}

export default function Icon({ size = 32, color = "orange", letter = "R" }: IconProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#fff";
    ctx.font = `${size * 0.8}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, size / 2, size / 2);
    setDataUrl(canvas.toDataURL("image/png"));
  }, [size, color, letter]);

  if (!dataUrl) return null;

  return <img src={dataUrl} width={size} height={size} alt="icon" />;
}
