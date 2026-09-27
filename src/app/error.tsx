"use client";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-16">
      <h1 className="text-headline">Something went wrong</h1>
      <p className="mt-3 text-body-lg text-muted-gray">Refresh the page and try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-shop-violet px-6 text-body text-pure-white shadow-lg-2"
      >
        Try again
      </button>
    </div>
  );
}
