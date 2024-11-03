import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingSkeleton() {
  return (
    <div className="w-full">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Skeleton className="h-8 w-[120px]" />
            <div className="hidden sm:block">
              <div className="flex space-x-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-[60px]" />
                ))}
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Skeleton className="h-12 w-[250px] mx-auto mb-4" />
          <Skeleton className="h-4 w-full max-w-[600px] mx-auto" />
          <Skeleton className="h-4 w-full max-w-[400px] mx-auto mt-2" />
          <Skeleton className="h-10 w-[150px] mx-auto mt-6" />
        </div>
      </div>

      {/* Featured Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-4">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-6 w-[180px]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-[100px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Skeleton className="h-8 w-[200px] mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
                <Skeleton className="h-4 w-4/6 mt-2" />
                <div className="flex items-center mt-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="ml-4">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px] mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[140px]" />
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t flex justify-between items-center">
            <Skeleton className="h-4 w-[200px]" />
            <div className="flex space-x-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-6 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .skeleton {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(to right, #f6f7f8 4%, #edeef1 25%, #f6f7f8 36%);
          background-size: 1000px 100%;
        }
      `}</style>
    </div>
  )
}