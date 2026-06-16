import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Produto {
  id: string
  nome: string
  preco_venda: number
  estoque_atual: number
  categoria: string
}

interface ItemCarrinho {
  produto: Produto
  quantidade: number
}

export default function PDV() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [finalizando, setFinalizando] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro')

  useEffect(() => { buscarProdutos() }, [])

  async function buscarProdutos() {
    setLoading(true)
    const { data } = await supabase.from('produtos').select('*').order('nome')
    const parsed = (data || []).map(p => ({
      ...p,
      preco_venda: parseFloat(p.preco_venda) || 0,
      estoque_atual: parseInt(p.estoque_atual) || 0,
    }))
    setProdutos(parsed)
    setLoading(false)
  }

  function adicionarAoCarrinho(produto: Produto) {
    if (produto.estoque_atual <= 0) return alert('Sem estoque!')
    setCarrinho(prev => {
      const existe = prev.find(i => i.produto.id === produto.id)
      if (existe) {
        if (existe.quantidade >= produto.estoque_atual) {
          alert('Estoque insuficiente!')
          return prev
        }
        return prev.map(i =>
          i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...prev, { produto, quantidade: 1 }]
    })
  }

  function alterarQuantidade(id: string, delta: number) {
    setCarrinho(prev =>
      prev
        .map(i => i.produto.id === id
        ? { ...i, quantidade: i.quantidade + delta, produto: { ...i.produto, preco_venda: parseFloat(String(i.produto.preco_venda)) } }
        : i)
      .filter(i => i.quantidade > 0)
    )
  }

  function removerItem(id: string) {
    setCarrinho(prev => prev.filter(i => i.produto.id !== id))
  }

  const total = carrinho.reduce((s, i) => {
  const preco = parseFloat(String(i.produto.preco_venda)) || 0
  return s + preco * i.quantidade
}, 0)


  async function finalizarVenda() {
    if (carrinho.length === 0) return alert('Carrinho vazio!')
    setFinalizando(true)
    for (const item of carrinho) {
      await supabase.from('produtos').update({
        estoque_atual: item.produto.estoque_atual - item.quantidade
      }).eq('id', item.produto.id)
    }
    alert(`✅ Venda finalizada!\nTotal: R$ ${total.toFixed(2).replace('.', ',')}\nPagamento: ${formaPagamento}`)
    setCarrinho([])
    setFinalizando(false)
    buscarProdutos()
  }

  const produtosFiltrados = produtos.filter(p =>
    (!busca || p.nome.toLowerCase().includes(busca.toLowerCase())) &&
    (!categoria || p.categoria === categoria)
  )

  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))]

  return (
    <div className="flex gap-4 h-full">

      {/* Lado esquerdo */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">Frente de caixa</h1>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="🔍 Buscar peça ou serviço..."
              value={busca}
              onChange={e => setBusca(e.target.value)} />
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}>
              <option value="">Todas categorias</option>
              {categorias.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-sm py-8">Carregando...</div>
        ) : (
          <div className="grid grid-cols-3 gap-3 overflow-y-auto">
            {produtosFiltrados.map(p => (
              <button
                key={p.id}
                onClick={() => adicionarAoCarrinho(p)}
                className={`bg-white border rounded-xl p-3 text-left transition hover:border-blue-400 hover:shadow-sm ${p.estoque_atual <= 0 ? 'opacity-40 cursor-not-allowed' : 'border-gray-200'}`}>
                <div className="text-sm font-medium text-gray-800 mb-1">{p.nome}</div>
                <div className="text-blue-600 font-semibold text-sm">
                  R$ {p.preco_venda.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {p.categoria} · {p.estoque_atual} em estoque
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lado direito — carrinho */}
      <div className="w-80 bg-white border border-gray-200 rounded-xl flex flex-col p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">🛒 Carrinho</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {carrinho.length} itens
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {carrinho.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">Carrinho vazio</div>
          ) : carrinho.map(item => (
            <div key={item.produto.id} className="border border-gray-100 rounded-lg p-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-gray-800 font-medium leading-tight">{item.produto.nome}</span>
                <button onClick={() => removerItem(item.produto.id)}
                  className="text-red-400 hover:text-red-600 text-xs shrink-0">✕</button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => alterarQuantidade(item.produto.id, -1)}
                    className="w-6 h-6 border border-gray-200 rounded text-sm hover:bg-gray-100">−</button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantidade}</span>
                  <button onClick={() => alterarQuantidade(item.produto.id, 1)}
                    className="w-6 h-6 border border-gray-200 rounded text-sm hover:bg-gray-100">+</button>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  R$ {(item.produto.preco_venda * item.quantidade).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Subtotal</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-800 mb-3">
            <span>Total</span>
            <span className="text-blue-600">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-500 uppercase font-medium">Forma de pagamento</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              value={formaPagamento}
              onChange={e => setFormaPagamento(e.target.value)}>
              <option>Dinheiro</option>
              <option>Cartão de débito</option>
              <option>Cartão de crédito</option>
              <option>PIX</option>
            </select>
          </div>

          <button
            onClick={finalizarVenda}
            disabled={finalizando || carrinho.length === 0}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {finalizando ? 'Finalizando...' : '✅ Finalizar venda'}
          </button>
          <button
            onClick={() => setCarrinho([])}
            className="w-full mt-2 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
            Limpar carrinho
          </button>
        </div>
      </div>
    </div>
  )
}