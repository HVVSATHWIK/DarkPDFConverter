import { ShieldCheckIcon, LockClosedIcon, CheckBadgeIcon, CpuChipIcon } from '@heroicons/react/24/outline';

export function PrivacyBadges() {
  const badges = [
    {
      icon: LockClosedIcon,
      title: 'Zero Remote Storage',
      description: 'Files are processed in local browser memory and never uploaded to remote servers.',
    },
    {
      icon: CpuChipIcon,
      title: 'WebAssembly Engine',
      description: 'Client-side execution powered by compiled WebAssembly without server latency.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Zero Data Transmission',
      description: 'Files remain in local volatile device memory without external server transmission.',
    },
    {
      icon: CheckBadgeIcon,
      title: 'Unrestricted Local Access',
      description: 'Process files directly on your device with no hidden paywalls and no mandatory accounts.',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {badges.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-700/80 bg-slate-800/80 text-slate-200">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-xs font-semibold text-slate-200">{b.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{b.description}</p>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 italic text-center pt-1">
        Disclaimer: LitasDark operates strictly as a local software utility and does not act as a Data Processor or Business Associate.
      </p>
    </div>
  );
}

