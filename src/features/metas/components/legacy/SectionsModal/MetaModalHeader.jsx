import Selo from "../../../assets/selo-atingida.svg";

export default function MetaModalHeader({ meta, onClose }) {
    const status = meta?.card?.monitoramento?.toLowerCase() || "";
    const isAtingida = status.includes("atingida");

    return (
        <div className="flex flex-col items-end justify-center lg:items-center relative">
            <div className="w-full h-full py-2 px-4 relative z-10" style={{ backgroundColor: meta.card.eixo_cor_principal }}>
                <section className="relative lg:left-20 w-20">
                    <button onClick={(e) => {onClose(e);}} className="text-white text-xl lg:text-3xl flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                        <i className="fa-solid fa-arrow-left text-white"></i>
                        Voltar
                    </button>
                </section>
            </div>
            {isAtingida && (
                <div className="absolute -top-1 pointer-events-none z-10">
                    <img src={Selo} alt="Ícone de bandeira da meta atingida" className="w-20 lg:w-30 drop-shadow-md"/>
                </div>
            )}
        </div>
    );
}