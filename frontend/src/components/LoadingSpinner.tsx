function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <div className="relative">
        <div className="w-20 h-20 border-emerald-200 border-8 rounded-full" />
        <div className="w-20 h-20 border-emerald-500 border-t-6 animate-spin rounded-full absolute left-0 top-0" />
        <div className="sr-only">
          Loading
        </div>
      </div>
    </div>
  )
}
export default LoadingSpinner