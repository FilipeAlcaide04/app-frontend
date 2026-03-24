import { StarField } from "@/components/star-field"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] w-full flex bg-gradient-to-br from-background via-background to-card/20">
      <StarField />
      
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Organic, asymmetric background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-32 -left-32 w-96 h-96 rounded-full bg-primary/4 blur-3xl" />
          <div className="absolute -top-20 right-20 w-72 h-72 rounded-full bg-accent/3 blur-3xl" />
          <div className="absolute bottom-40 left-1/3 w-80 h-80 rounded-full bg-primary/3 blur-3xl opacity-50" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-accent/2 blur-3xl" />
        </div>
        
        {/* Content - Asymmetric layout */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo - Simple, not centered */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center -rotate-1 shadow-sm">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Percore</span>
              </div>
            </div>
          </div>
          
          {/* Main message - Shorter, punchier */}
          <div className="max-w-xl mt-8">
            <h1 className="text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              A tua mente, <br/>
              <span className="text-gradient-primary">amplificada.</span>
            </h1>
            <p className="text-lg text-muted-foreground/85 leading-relaxed max-w-lg font-medium">
              Explora um sistema de inteligência artificial que pensa, sente e aprende contigo.
            </p>
            
            {/* Social proof - Simple */}
            <div className="mt-12 pt-8 border-t border-border/30">
              <div className="text-sm text-muted-foreground/70">
                Já <span className="text-foreground font-semibold">2.4k+</span> utilizadores exploram o seu potencial
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-[48%] flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
