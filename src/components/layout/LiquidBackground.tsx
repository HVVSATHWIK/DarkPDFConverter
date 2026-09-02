export function LiquidBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#080b11] overflow-hidden pointer-events-none">
            {/* Subtle, clean radial gradients */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-800/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080b11]/50 to-[#080b11]" />
        </div>
    );
}