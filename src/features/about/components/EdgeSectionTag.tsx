interface EdgeSectionTagProps {
  title: string
  eyebrow?: string
}

/** Etiqueta ancorada na borda direita da viewport, fora do Container. */
export function EdgeSectionTag({ title }: EdgeSectionTagProps) {
  return (
    <div className="about-edge-tag" aria-hidden="true">
      <span className="about-edge-tag__title">{title}</span>
    </div>
  )
}
