
export default function Glow(){ return <div className="absolute inset-0 -z-10 blur-3xl opacity-40 pointer-events-none">
    <div className="absolute top-10 left-20 w-72 h-72 rounded-full gradient-background-orange" />

    <div className="absolute bottom-30 right-10 w-64 h-64 rounded-full gradient-background-1" />
  </div>}