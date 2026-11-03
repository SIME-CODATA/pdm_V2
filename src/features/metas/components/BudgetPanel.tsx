import { Banknote } from 'lucide-react'
export function BudgetPanel() {
  return (
    <aside className="metas-budget">
      <Banknote size={21} />
      <div>
        <strong>Orçamento</strong>
        <p>
          Os valores reais são exibidos no detalhamento de cada meta. Nenhum valor é estimado pelo
          frontend.
        </p>
      </div>
    </aside>
  )
}
