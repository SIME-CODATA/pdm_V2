import { Container } from '@/shared/components/layout/Container'
import { footerContent } from './footer.content'
interface FooterLogoProps {
  src: string
  alt: string
  className?: string
}

function FooterLogo({ src, alt, className = '' }: FooterLogoProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`block h-auto max-w-full object-contain object-left ${className}`}
    />
  )
}

export function Footer() {
  const { signature, logos, social, institutional } = footerContent

  return (
    <footer className="w-full bg-white text-black">
      {/* Assinatura institucional */}
      <div className="border-y border-neutral-500">
        <Container className="py-2">
          <p className="text-center text-[11px] font-bold uppercase sm:text-left">{signature}</p>
        </Container>
      </div>

      {/* Conteúdo do rodapé */}
      <Container className="py-8 sm:py-10">
        <div className="grid grid-cols-2 items-start gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-[1.45fr_1fr_0.75fr_1fr_1fr_1.55fr] xl:gap-x-6">
          {/* Prefeitura */}
          <div className="col-span-2 sm:col-span-1 lg:w-52">
            <FooterLogo
              src={logos.prefeitura.src}
              alt={logos.prefeitura.alt}
              className="max-h-15 max-w-40"
            />
          </div>

          {/* Redes sociais */}
          <div
            role="group"
            aria-label="Redes sociais"
            className="flex flex-wrap items-center gap-2"
          >
            {social.map(({ label, iconUrl }) => (
              <span
                key={label}
                title={label}
                className="inline-flex size-6 items-center justify-center"
              >
                <img
                  src={iconUrl}
                  alt={label}
                  className="size-full object-contain"
                  loading="lazy"
                />
              </span>
            ))}
          </div>

          {/* SIME */}
          <div>
            <FooterLogo src={logos.sime.src} alt={logos.sime.alt} className="max-h-14 max-w-35" />
          </div>

          {/* CPMA */}
          <div>
            <FooterLogo src={logos.cpma.src} alt={logos.cpma.alt} className="max-h-14 max-w-35" />
          </div>

          {/* CODATA */}
          <div>
            <FooterLogo
              src={logos.codata.src}
              alt={logos.codata.alt}
              className="max-h-14 max-w-35"
            />
          </div>

          {/* Informações institucionais */}
          <div className="col-span-2 sm:col-span-3 xl:col-span-1">
            <p className="max-w-60 text-xs leading-snug">
              <span className="font-black">{institutional.description}</span>
              <br />
              {institutional.department}
            </p>

            <a
              href={institutional.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary focus-visible:outline-primary mt-1 inline-block max-w-60 text-xs leading-snug text-black underline underline-offset-2 transition-colors hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {institutional.websiteLabel}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
