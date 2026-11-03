import type { ComponentPropsWithoutRef } from 'react'

type ContainerProps = ComponentPropsWithoutRef<'div'>

export function Container({ children, className = '', ...props }: ContainerProps) {
  return (
    <div className={`px-gutter mx-auto w-full max-w-[1726px] sm:px-8 ${className}`} {...props}>
      {children}
    </div>
  )
}
