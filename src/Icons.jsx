import React from 'react'
const shapes = {
  ArrowLeft: (
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  ),
  Check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),
  ChevronRight: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
  ArrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  Download: (
    <>
      <path d="M12 3v12m-4-4 4 4 4-4" />
      <path d="M4 17v3h16v-3" />
    </>
  ),
  Printer: (
    <>
      <path d="M6 9V3h12v6M6 18H4V9h16v9h-2" />
      <path d="M6 15h12v6H6z" />
    </>
  ),
  RotateCcw: (
    <>
      <path d="M3 11a9 9 0 1 1 2 6" />
      <path d="M3 3v8h8" />
    </>
  ),
  Compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 5-4 1 1-4z" />
    </>
  ),
  HeartHandshake: (
    <>
      <path d="M12 21s-9-5.5-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 11-9 11Z" />
      <path d="M8 13h8" />
    </>
  ),
  Target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  Sparkles: (
    <>
      <path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
    </>
  ),
  Layers3: (
    <>
      <path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  CircleHelp: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 0 1 6 1c0 2-3 2-3 5M12 18h.01" />
    </>
  ),
  MessageCircle: (
    <>
      <path d="M21 11.5a8.5 8.5 0 0 1-12 7.7L3 21l1.8-6A8.5 8.5 0 1 1 21 11.5z" />
    </>
  ),
  ShieldCheck: (
    <>
      <path d="m12 2 9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  SlidersHorizontal: (
    <>
      <path d="M3 6h18M3 12h18M3 18h18" />
      <circle cx="8" cy="6" r="2" fill="white" />
      <circle cx="16" cy="12" r="2" fill="white" />
      <circle cx="10" cy="18" r="2" fill="white" />
    </>
  ),
}
function Icon({ name, size = 20, strokeWidth = 2, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {shapes[name]}
    </svg>
  )
}
export const ArrowLeft = (p) => <Icon name="ArrowLeft" {...p} />
export const ArrowRight = (p) => <Icon name="ArrowRight" {...p} />
export const Download = (p) => <Icon name="Download" {...p} />
export const Printer = (p) => <Icon name="Printer" {...p} />
export const RotateCcw = (p) => <Icon name="RotateCcw" {...p} />
export const Compass = (p) => <Icon name="Compass" {...p} />
export const HeartHandshake = (p) => <Icon name="HeartHandshake" {...p} />
export const Target = (p) => <Icon name="Target" {...p} />
export const Sparkles = (p) => <Icon name="Sparkles" {...p} />
export const Layers3 = (p) => <Icon name="Layers3" {...p} />
export const CircleHelp = (p) => <Icon name="CircleHelp" {...p} />
export const MessageCircle = (p) => <Icon name="MessageCircle" {...p} />
export const ShieldCheck = (p) => <Icon name="ShieldCheck" {...p} />
export const SlidersHorizontal = (p) => <Icon name="SlidersHorizontal" {...p} />

export const Check = (p) => <Icon name="Check" {...p} />
export const ChevronRight = (p) => <Icon name="ChevronRight" {...p} />
