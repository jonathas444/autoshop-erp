import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Produto {
  id: string
  nome: string
  codigo: string
  categoria: string
  preco_custo: number
  preco_venda: number
  estoque_atual: number
  estoque_minimo: number
}

export default function Estoque() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({
    nome: '', codigo: '', categoria: '',
    preco_custo: '', preco_venda: '',
    estoque_atual: '', estoque_minimo: '5'
  })

  useEffect(() => { buscarProdutos() }, [])

  async function buscarProdutos() {
    setLoading(true)
    const { data } = await supabase.from('produtos').select('*').order('nome')
    setProdutos(data || [])
    setLoading(false)
  }

  async function salvarProduto() {
    if (!form.nome) return alert('Nome é obrigatório')
    await supabase.from('produtos').insert([{
      nome: form.nome,
      codigo: form.codigo,
      categoria: form.categoria,
      preco_custo: Number(form.preco_custo),
      preco_venda: Number(form.preco_venda),
      estoque_atual: Number(form.estoque_atual),
      estoque_minimo: Number(form.estoque_minimo),
    }])
    setForm({ nome: '', codigo: '', categoria: '', preco_custo: '', preco_venda: '', estoque_atual: '', estoque_minimo: '5' })
    setMostrarForm(false)
    buscarProdutos()
  }

  async function excluirProduto(id: string) {
    if (!confirm('Excluir esta peça?')) return
    await supabase.from('produtos').delete().eq('id', id)
    buscarProdutos()
  }

  function statusEstoque(produto: Produto) {
    if (produto.estoque_atual <= 0) return { label: 'Sem estoque', classe: 'bg-red-100 text-red-700' }
    if (produto.estoque_atual <= produto.estoque_minimo) return { label: 'Estoque baixo', classe: 'bg-amber-100 text-amber-700' }
    return { label: 'OK', classe: 'bg-green-100 text-green-700' }
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Estoque de peças</h1>
          <p className="text-sm text-gray-500">{produtos.length} itens cadastrados</p>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Nova peça
        </button>
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-base font-medium text-gray-800 mb-4">Nova peça</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Nome *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Código</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Categoria</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Selecione...</option>
                <option>Óleo</option>
                <option>Filtro</option>
                <option>Freio</option>
                <option>Suspensão</option>
                <option>Elétrica</option>
                <option>Serviço</option>
                <option>Outros</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Estoque atual</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.estoque_atual} onChange={e => setForm({ ...form, estoque_atual: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Preço de custo (R$)</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.preco_custo} onChange={e => setForm({ ...form, preco_custo: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Preço de venda (R$)</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.preco_venda} onChange={e => setForm({ ...form, preco_venda: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Estoque mínimo</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.estoque_minimo} onChange={e => setForm({ ...form, estoque_minimo: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={salvarProduto}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Salvar
            </button>
            <button onClick={() => setMostrarForm(false)}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Carregando...</div>
        ) : produtos.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Nenhuma peça cadastrada ainda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Peça</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Categoria</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Estoque</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Preço venda</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => {
                const status = statusEstoque(p)
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{p.nome}</div>
                      {p.codigo && <div className="text-xs text-gray-400">{p.codigo}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.categoria || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.estoque_atual} un</td>
                    <td className="px-4 py-3 text-gray-600">
                      R$ {Number(p.preco_venda).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.classe}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => excluirProduto(p.id)}
                        className="text-red-500 hover:text-red-700 text-xs">
                        Excluir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}