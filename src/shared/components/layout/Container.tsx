import type { ComponentPropsWithoutRef } from 'react'

type ContainerProps = ComponentPropsWithoutRef<'div'>

export function Container({ children, className = '', ...props }: ContainerProps) {
  return (
    <div className={`max-w-content px-gutter mx-auto w-full sm:px-8 ${className}`} {...props}>
      {children}
    </div>
  )
}
