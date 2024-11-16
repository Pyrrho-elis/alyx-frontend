import { useEffect, useRef } from 'react'

const AutoGrowInput = ({ value, onChange, className, ...props }) => {
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={onChange}
      className={`resize-none overflow-hidden ${className || ''}`}
      {...props}
    />
  )
}

export default AutoGrowInput
