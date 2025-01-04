interface AdProps {
  type: 'banner' | 'square' | 'floating'
  className?: string
}

export function AdPlaceholder({ type, className = '' }: AdProps) {
  const height = type === 'banner' ? 'h-[50px]' : type === 'square' ? 'h-[250px]' : 'h-[60px]'
  
  return (
    <div className={`w-full ${height} bg-white/90 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}>
      <span className="text-sm text-gray-500">広告</span>
    </div>
  )
}

