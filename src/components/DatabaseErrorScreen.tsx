"use client";

export default function DatabaseErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-gray-100 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-deep-black uppercase tracking-tight">Connection Issue</h1>
        <p className="text-steel-blue font-medium">
          We're having trouble connecting to our database. This is usually due to an IP whitelist issue or temporary maintenance.
        </p>
        <div className="pt-4">
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-4 bg-purple-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-primary/90 transition-all shadow-xl shadow-purple-primary/20"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

