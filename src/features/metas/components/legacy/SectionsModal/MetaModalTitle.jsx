export default function MetaModalTitle({ title, color, meta }) {
    return (
        <div className="flex flex-col gap-8 px-3 py-3 w-full lg:w-6/12 h-auto lg:relative lg:left-20 mt-24">
            <p className="uppercase text-white w-30 py-2 px-4 text-center rounded-full text-lg" style={{ background: meta.card.eixo_cor_principal }}> meta {meta.card.numero}</p>
            <section className="flex flex-row gap-3 h-full lg:!h-full" style={{ color: color }}>
                <span className="BebasNeue text-xl lg:text-5xl">{title.strongText} </span>
                <span className="font-bebas-book uppercase font-light text-xl lg:text-5xl">{title.normalText}</span>
            </section>
        </div>
    );
}