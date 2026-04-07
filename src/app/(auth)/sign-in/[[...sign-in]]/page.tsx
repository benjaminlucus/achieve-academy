import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f8f9fa]">
      
      {/* Left Side: Branding/Visual (Inspired by your 3rd image) */}
      <div className="hidden md:flex flex-col justify-center items-center bg-[#1e3a5f] p-12 text-white">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Unlock Your Potential with <span className="text-[#d65a50]">Expert Tutors</span>
          </h1>
          <p className="text-[#70869d] text-lg">
            Join 10,000+ students globally and start your learning journey today.
          </p>
          
          {/* Decorative element resembling your UI screenshot */}
          <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#d65a50] flex items-center justify-center font-bold">
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
            <h2 className="text-2xl font-bold text-[#1e3a5f]">ACHIEVE ACADEMY</h2>
          </div>
          
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-[#1e3a5f] hover:bg-[#152a45] text-sm normal-case",
                card: "shadow-none border-none bg-transparent",
                headerTitle: "text-[#1e3a5f] font-bold",
                headerSubtitle: "text-[#70869d]",
                footerActionLink: "text-[#d65a50] hover:text-[#c04d44]"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}