export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <h1 className="font-heading text-headline-lg text-subpage-onSurface">404</h1>
      <p className="font-body text-body-md text-subpage-onSurfaceVariant mt-2">
        This icon doesn't exist in our universe (yet).
      </p>
      <a
        href="/"
        className="mt-6 px-6 py-3 rounded-full bg-subpage-primaryGradient text-white font-label-md hover:scale-[1.02] transition-transform"
      >
        Back to Home
      </a>
    </div>
  );
}
