export function ImageFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1f1714] to-[#15100e] p-6">
      <span
        className="font-['Fair_Play',serif] text-[clamp(4rem,16vw,9rem)] leading-none tracking-[-0.02em] text-[#FFF8E0]"
        aria-hidden="true"
      >
        W<span className="text-red-500">.</span>
      </span>
    </div>
  );
}
