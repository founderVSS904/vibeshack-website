export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <span
          className="text-white font-black select-none"
          style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            letterSpacing: '-0.05em',
            opacity: 0.6,
          }}
        >
          Vibe<span style={{ color: '#E02020' }}>Shack</span>
        </span>
        <div className="w-8 h-px" style={{ background: 'rgba(224,32,32,0.4)' }}>
          <div
            style={{
              height: '100%',
              background: '#E02020',
              animation: 'vs-scan 1.2s ease-in-out infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes vs-scan {
            0%   { transform: translateX(-100%); width: 60%; }
            50%  { transform: translateX(80%);  width: 60%; }
            100% { transform: translateX(200%); width: 60%; }
          }
        `}</style>
      </div>
    </div>
  )
}
