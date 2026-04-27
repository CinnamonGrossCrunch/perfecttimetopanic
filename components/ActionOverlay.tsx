"use client";

import { useEffect, useState } from "react";

export function ActionOverlay() {
  const [showPaywallOptions, setShowPaywallOptions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [, setDragCounter] = useState(0);

  useEffect(() => {
    const handleDragEnd = () => {
      setDragCounter(0);
      setIsDraggingOver(false);
    };
    const handleDragLeaveWindow = (e: DragEvent) => {
      if (e.relatedTarget === null) {
        setDragCounter(0);
        setIsDraggingOver(false);
      }
    };
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("drop", handleDragEnd);
    window.addEventListener("dragleave", handleDragLeaveWindow);
    return () => {
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("drop", handleDragEnd);
      window.removeEventListener("dragleave", handleDragLeaveWindow);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Show quick actions"
        aria-expanded={showMenu}
        onClick={() => {
          setShowMenu((v) => {
            if (v) setShowPaywallOptions(false);
            return !v;
          });
        }}
        className="fixed bottom-6 right-6 z-50 hidden lg:flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-colors hover:bg-red-700"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`h-6 w-6 transition-transform duration-300 ${showMenu ? "rotate-45" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <div
        className={`fixed bottom-24 right-6 z-50 hidden lg:flex w-[280px] flex-col items-stretch gap-3 transition-all duration-300 ease-out ${
          showMenu
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => setShowPaywallOptions((v) => !v)}
          aria-expanded={showPaywallOptions}
          className="flex items-center justify-center border border-gray-300 bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-gray-900 shadow-md transition-colors hover:bg-gray-100"
        >
          Hitting a Paywall?
        </button>

        {showPaywallOptions && (
          <div className="flex flex-col gap-3 border border-gray-300 bg-white p-4 shadow-md">
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setDragCounter((c) => {
                  const next = c + 1;
                  if (next === 1) setIsDraggingOver(true);
                  return next;
                });
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() =>
                setDragCounter((c) => {
                  const next = Math.max(0, c - 1);
                  if (next === 0) setIsDraggingOver(false);
                  return next;
                })
              }
              onDrop={(e) => {
                e.preventDefault();
                setDragCounter(0);
                setIsDraggingOver(false);
                const url = e.dataTransfer.getData("text/plain");
                if (url) {
                  const encoded = encodeURIComponent(url);
                  window.open(
                    `https://www.removepaywall.com/search?url=${encoded}`,
                    "_blank"
                  );
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed px-4 py-6 text-center text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
                isDraggingOver
                  ? "border-red-600 bg-red-50 text-red-700"
                  : "border-gray-400 text-gray-700"
              }`}
            >
              <p className="font-bold">Drag an article here</p>
              <p className="normal-case tracking-normal text-gray-500">
                to remove its paywall
              </p>
            </div>

            <div className="flex flex-row gap-2">
              {[
                {
                  href: "https://www.icloud.com/shortcuts/373258eb20f64415a2d588075b13755f",
                  label: "iOS",
                },
                { href: "https://www.removepaywall.com/", label: "Web" },
                {
                  href: "https://chromewebstore.google.com/detail/open-site-in-removepaywal/nfnpoaaallnibpcejlobbajnohipmhnd",
                  label: "Chrome",
                },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-gray-300 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-gray-900 transition-colors hover:bg-gray-100 hover:text-red-700"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}

        <a
          href="https://mattdpearce.substack.com/p/best-ways-to-support-journalism-in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center border border-gray-300 bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-gray-900 shadow-md transition-colors hover:bg-gray-100"
        >
          Support Journalism
        </a>

        <a
          href="https://wellbeingtrust.org/resources/mental-health-resources/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center border border-gray-300 bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-gray-900 shadow-md transition-colors hover:bg-gray-100"
        >
          Mental Wellness
        </a>

        <button
          type="button"
          onClick={() => location.reload()}
          className="flex items-center justify-center border border-gray-300 bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-gray-900 shadow-md transition-colors hover:bg-gray-100"
        >
          Refresh Feed
        </button>
      </div>
    </>
  );
}
