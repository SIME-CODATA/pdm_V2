import { MessageSquareQuote, X } from 'lucide-react'
import { useRef } from 'react'

import { homeContent } from '../data/home.content'

export function MayorMessageSection() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { quote, attribution, dateLabel, fullText } = homeContent.mayor

  return (
    <section aria-labelledby="mayor-quote" className="py-20 sm:py-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-gutter text-center">
        <blockquote>
          <p id="mayor-quote" className="text-xl leading-snug font-normal text-primary sm:text-2xl lg:text-3xl">
            “{quote}”
          </p>
          <footer className="mt-5 text-sm leading-tight font-semibold text-primary">
            {attribution}
            <br />
            {dateLabel}
          </footer>
        </blockquote>

        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="mt-2 inline-flex min-h-11 w-full max-w-sm items-center justify-center gap-3 rounded-full border border-neutral-200 bg-white px-5 py-2 font-semibold text-secondary shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <MessageSquareQuote size={22} aria-hidden="true" />
          <span className="text-sm sm:text-base">PALAVRA DO PREFEITO COMPLETA</span>
        </button>
      </div>

      {/* <dialog> oferece Escape, foco gerenciado pelo navegador e backdrop nativos. */}
      <dialog
        ref={dialogRef}
        aria-labelledby="mayor-dialog-title"
        className="fixed inset-0 m-auto max-h-[85vh] w-[min(90vw,720px)] overflow-y-auto rounded-2xl border-0 bg-white p-0 text-primary shadow-2xl backdrop:bg-primary/60"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close()
        }}
      >
        <div className="relative p-6 sm:p-9">
          <button
            type="button"
            aria-label="Fechar palavra do prefeito"
            onClick={() => dialogRef.current?.close()}
            className="absolute top-5 right-5 rounded-md p-2 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X aria-hidden="true" />
          </button>

          <h2 id="mayor-dialog-title" className="pr-12 font-display text-4xl">
            Palavra do Prefeito
          </h2>
          <div className="mt-6 space-y-5 font-sans text-base leading-relaxed">
            {fullText ? (
              fullText.split(/\n\s*\n/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <>
                <p>“{quote}”</p>
                <p className="text-sm text-neutral-600">
                  O texto completo oficial ainda não foi fornecido. Este modal já está
                  preparado para recebê-lo.
                </p>
              </>
            )}
          </div>
        </div>
      </dialog>
    </section>
  )
}
