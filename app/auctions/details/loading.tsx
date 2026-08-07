export default function Loading() {
    return (
        <div className="bg-paper min-h-screen animate-pulse">
            {/* Hero image placeholder */}
            <div className="w-full aspect-[21/9] bg-ink/10" />

            {/* Thumbnail strip */}
            <div className="mx-auto max-w-6xl px-4 lg:px-8 -mt-8 relative z-10">
                <div className="flex gap-2 overflow-hidden bg-ink/5 border border-line/30 rounded-xl p-3">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="w-20 h-14 rounded-lg bg-ink/10 shrink-0"
                            style={{ animationDelay: `${i * 100}ms` }}
                        />
                    ))}
                </div>
            </div>

            {/* Content grid */}
            <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column: specs */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-7 w-48 bg-ink/10 rounded-lg" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[...Array(9)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 bg-ink/10 rounded-lg"
                                    style={{ animationDelay: `${i * 75}ms` }}
                                />
                            ))}
                        </div>

                        {/* Equipment section */}
                        <div className="space-y-3">
                            <div className="h-7 w-36 bg-ink/10 rounded-lg" />
                            <div className="flex flex-wrap gap-2">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-8 w-20 bg-ink/10 rounded-full"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Inspection section */}
                        <div className="space-y-3">
                            <div className="h-7 w-40 bg-ink/10 rounded-lg" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-14 bg-ink/10 rounded-lg"
                                        style={{ animationDelay: `${i * 75}ms` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column: sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-ink/10 rounded-2xl p-6 space-y-4">
                            <div className="h-4 w-32 bg-ink/10 rounded mx-auto" />
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-12 w-12 bg-ink/10 rounded" />
                                <div className="h-8 w-4 bg-ink/10 rounded" />
                                <div className="h-12 w-12 bg-ink/10 rounded" />
                                <div className="h-8 w-4 bg-ink/10 rounded" />
                                <div className="h-12 w-12 bg-ink/10 rounded" />
                            </div>
                        </div>

                        <div className="bg-ink/5 border border-line/30 rounded-2xl p-6 space-y-4">
                            <div className="h-4 w-24 bg-ink/10 rounded" />
                            <div className="h-5 w-40 bg-ink/10 rounded" />
                            <div className="h-16 bg-ink/10 rounded-xl" />
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <div className="h-4 w-16 bg-ink/10 rounded" />
                                    <div className="h-4 w-12 bg-ink/10 rounded" />
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-4 w-20 bg-ink/10 rounded" />
                                    <div className="h-4 w-14 bg-ink/10 rounded" />
                                </div>
                            </div>
                            <div className="h-12 bg-ink/10 rounded-xl" />
                            <div className="space-y-2">
                                <div className="h-4 w-4/5 bg-ink/10 rounded" />
                                <div className="h-4 w-3/4 bg-ink/10 rounded" />
                                <div className="h-4 w-2/3 bg-ink/10 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
