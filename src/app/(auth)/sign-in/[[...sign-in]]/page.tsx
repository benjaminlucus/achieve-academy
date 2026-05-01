import { SignIn, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f8f9fa]">
      
      {/* Left Side: Branding/Visual (Inspired by your 3rd image) */}
      <div className="hidden md:flex flex-col justify-center items-center bg-[#1e3a5f] p-12 text-white">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Unlock Your Potential with <span className="text-coral">Expert Tutors</span>
          </h1>
          <p className="text-steel-blue text-lg">
            Join 10,000+ students globally and start your learning journey today.
          </p>
          
          {/* Decorative element resembling your UI screenshot */}
          <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <p className="font-semibold">Real-time sessions</p>
                <p className="text-sm text-gray-300">Connect instantly with active tutors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Clerk Sign In Component */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <h2 className="text-2xl font-bold text-dark-navy uppercase tracking-tighter">ACHIEVE ACADEMY</h2>
          </div>
          
          <ClerkLoading>
            <div className="w-full bg-white p-8 rounded-2xl shadow-sm space-y-6 animate-pulse border border-gray-100">
              <div className="h-8 w-1/2 bg-gray-100 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
              <div className="space-y-4 pt-4">
                <div className="h-12 w-full bg-gray-50 rounded-xl"></div>
                <div className="h-12 w-full bg-gray-50 rounded-xl"></div>
              </div>
              <div className="h-12 w-full bg-gray-200 rounded-xl mt-8"></div>
            </div>
          </ClerkLoading>

          <ClerkLoaded>
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-dark-navy hover:bg-coral text-sm font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-md active:scale-95",
                  card: "shadow-none border-none bg-transparent",
                  headerTitle: "text-dark-navy font-black uppercase tracking-tight text-2xl",
                  headerSubtitle: "text-gray-500 font-medium",
                  footerActionLink: "text-coral hover:text-dark-navy font-bold transition-colors",
                  formFieldInput: "bg-gray-50 border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-dark-navy/10 transition-all",
                  formFieldLabel: "text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
                }
              }}
            />
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
}