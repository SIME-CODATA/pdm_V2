import type { ComponentPropsWithoutRef } from 'react'

type ContainerProps = ComponentPropsWithoutRef<'div'>

export function Container({ children, className = '', ...props }: ContainerProps) {
  return (
    <div className={`max-w-[1726px] px-gutter mx-auto w-full sm:px-8 ${className}`} {...props}>
      {children}
    </div>
  )
}
