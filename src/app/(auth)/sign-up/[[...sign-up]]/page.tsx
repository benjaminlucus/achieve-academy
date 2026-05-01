import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f8f9fa]">
      
      {/* Left Side: Motivational Branding */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: "bg-[#1e3a5f] hover:bg-[#152a45] text-sm normal-case",
                card: "shadow-none border-none bg-transparent",
                headerTitle: "text-[#1e3a5f] font-bold",
                headerSubtitle: "text-[#70869d]",
                footerActionLink: "text-[#d65a50] hover:text-[#c04d44]"
              }
            }}
          />
        </div>
      </div>

      {/* Right Side: Clerk Sign Up Component */}
      <div className="hidden md:flex flex-col justify-center items-center bg-[#1e3a5f] p-12 text-white">
        <div className="max-w-md space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#d65a50]/20 text-[#d65a50] text-xs font-bold uppercase tracking-wider">
            Join the Community
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Start Your Journey with <span className="text-[#d65a50]">Achieve Academy</span>
          </h1>
          <ul className="space-y-4 text-[#70869d]">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d65a50]" />
              Access to top-tier global tutors
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d65a50]" />
              Personalized learning goals
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d65a50]" />
              Flexible scheduling & real-time sessions
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}