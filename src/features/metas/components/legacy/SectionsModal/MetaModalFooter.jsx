export default function MetaModalFooter({ card }) {
  if (!card.eixo_frase) return null;
  
  return (
    <div className="h-auto py-5" style={{ backgroundColor: card.eixo_cor_principal }}>
      <div className="flex flex-col md:flex-row items-center justify-evenly gap-6 px-4">
        <div style={{ backgroundColor: card.eixo_cor_secundaria }} className="p-4 md:w-60 md:h-25 text-white flex items-center justify-center rounded-lg">
          <h4 className="text-xl md:text-3xl font-bebas-bold">{card.eixo_nome}</h4>
        </div>
        <div className="text-start md:text-left text-white flex flex-col gap-8">
          <h3 className="text-2xl md:text-4xl roboto-bold">{card.eixo_frase[0]}</h3>
          <p className="text-lg md:text-xl max-w-xl roboto-regular opacity-90">{card.eixo_frase[1]}</p>
        </div>
      </div>
    </div>
  );
}