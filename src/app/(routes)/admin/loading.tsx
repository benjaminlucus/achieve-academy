
export default function AdminLoading() {
  return (
    <div className="space-y-8 md:space-y-14 pb-20 animate-pulse">
      {/* Banner Skeleton */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-dark-navy shadow-[8px_8px_0px_0px_rgba(43,65,98,1)] md:shadow-[12px_12px_0px_0px_rgba(43,65,98,1)] flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10 mb-10 md:mb-16">
        <div className="space-y-3 text-center lg:text-left flex-grow">
          <div className="h-7 bg-gray-100 rounded-xl w-48 mx-auto lg:mx-0" />
          <div className="h-3 bg-gray-100 rounded-full w-64 mx-auto lg:mx-0" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-4 w-full lg:w-auto">
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-gray-100 text-center w-full lg:w-40 h-[64px] flex flex-col justify-center items-center gap-2">
            <div className="h-2 bg-gray-200/80 rounded-full w-20" />
            <div className="h-4 bg-gray-200/80 rounded-xl w-16" />
          </div>
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-gray-100 text-center w-full lg:w-40 h-[64px] flex flex-col justify-center items-center gap-2">
            <div className="h-2 bg-gray-200/80 rounded-full w-20" />
            <div className="h-4 bg-gray-200/80 rounded-xl w-16" />
          </div>
          <div className="h-[52px] bg-gray-100 rounded-2xl w-full lg:w-36 flex-shrink-0" />
        </div>
      </div>

      {/* Overview Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl" />
              <div className="w-16 h-6 bg-gray-50 rounded-full border border-gray-100" />
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-100 rounded-full w-24" />
              <div className="h-6 bg-gray-100 rounded-xl w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Tables Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <div className="space-y-3">
                <div className="h-5 bg-gray-100 rounded-xl w-36" />
                <div className="h-3 bg-gray-100 rounded-full w-48" />
              </div>
              <div className="h-4 bg-gray-100 rounded-lg w-16" />
            </div>
            <div className="p-6 space-y-6">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded-full w-28" />
                      <div className="h-3 bg-gray-100 rounded-full w-20" />
                    </div>
                  </div>
                  <div className="h-6 bg-gray-50 rounded-lg w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
