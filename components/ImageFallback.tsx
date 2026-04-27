export function ImageFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 p-6">
      <span
        className="font-['Libre_Baskerville',serif] text-[clamp(4rem,16vw,9rem)] font-bold leading-none tracking-[-0.02em] text-gray-400"
        aria-hidden="true"
      >
        W<span className="text-red-600">.</span>
      </span>
    </div>
  );
}
