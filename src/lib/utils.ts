import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function setFavicon(letter: string, size = 32) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;

  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, "#c09a6b"); 
  gradient.addColorStop(1, "#5d3a1a"); 
  ctx.fillStyle = gradient;

  const radius = size * 0.25;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${size * 0.8}px sans-serif`;
  ctx.fillText(letter, size / 2, size / 2);

  const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']") ?? document.createElement("link");
  link.rel = "icon";
  link.href = canvas.toDataURL("image/png");
  if (!document.head.contains(link)) document.head.appendChild(link);
}


export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};