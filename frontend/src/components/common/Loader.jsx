/**
 * Fullscreen loading spinner with pulsing animation.
 */
export default function Loader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-primary-200/20 border-t-primary-500 animate-spin"></div>
                </div>
                <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
            </div>
        </div>
    );
}
