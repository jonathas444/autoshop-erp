import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Metricas {
  totalClientes: number
  totalOS: number
  osAbertas: number
  totalProdutos: number
  produtosCriticos: number
  faturamentoOS: number
}

interface OSRecente {
  id: string
  numero: number
  status: string
  valor_total: number
  criado_em: string
  clientes: { nome: string }
}

interface ProdutoCritico {
  id: string
  nome: string
  estoque_atual: number
  estoque_minimo: number
}

export default function Dashboard() {
  const [metricas, setMetricas] = useState<Metricas>({
    totalClientes: 0, totalOS: 0, osAbertas: 0,
    totalProdutos: 0, produtosCriticos: 0, faturamentoOS: 0
  })
  const [osRecentes, setOsRecentes] = useState<OSRecente[]>([])
  const [criticos, setCriticos] = useState<ProdutoCritico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    setLoading(true)

    const [
      { count: totalClientes },
      { count: totalOS },
      { count: osAbertas },
      { count: totalProdutos },
      { data: produtosCriticosData },
      { data: osData },
      { data: osRecentesData },
    ] = await Promise.all([
      supabase.from('clientes').select('*', { count: 'exact', head: true }),
      supabase.from('ordens_servico').select('*', { count: 'exact', head: true }),
      supabase.from('ordens_servico').select('*', { count: 'exact', head: true }).in('status', ['Aguardando', 'Em andamento']),
      supabase.from('produtos').select('*', { count: 'exact', head: true }),
      supabase.from('produtos').select('id, nome, estoque_atual, estoque_minimo').filter('estoque_atual', 'lte', 'estoque_minimo'),
      supabase.from('ordens_servico').select('valor_total').eq('status', 'Concluída'),
      supabase.from('ordens_servico').select('*, clientes(nome)').order('criado_em', { ascending: false }).limit(5),
    ])

    const faturamentoOS = (osData || []).reduce((s, o) => s + Number(o.valor_total), 0)

    setMetricas({
      totalClientes: totalClientes || 0,
      totalOS: totalOS || 0,
      osAbertas: osAbertas || 0,
      totalProdutos: totalProdutos || 0,
      produtosCriticos: (produtosCriticosData || []).length,
      faturamentoOS,
    })
    setCriticos(produtosCriticosData || [])
    setOsRecentes(osRecentesData || [])
    setLoading(false)
  }

  function badgeStatus(status: string) {
    const cores: Record<string, string> = {
      'Aguardando': 'bg-blue-100 text-blue-700',
      'Em andamento': 'bg-amber-100 text-amber-700',
      'Concluída': 'bg-green-100 text-green-700',
      'Cancelada': 'bg-red-100 text-red-700',
    }
    return cores[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Carregando dashboard...
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral da oficina</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase font-medium mb-1">Clientes cadastrados</div>
          <div className="text-3xl font-semibold text-gray-800">{metricas.totalClientes}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase font-medium mb-1">OS em aberto</div>
          <div className="text-3xl font-semibold text-amber-600">{metricas.osAbertas}</div>
          <div className="text-xs text-gray-400 mt-1">{metricas.totalOS} no total</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase font-medium mb-1">Faturamento (OS concluídas)</div>
          <div className="text-3xl font-semibold text-green-600">
            R$ {metricas.faturamentoOS.toFixed(2).replace('.', ',')}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase font-medium mb-1">Peças em estoque</div>
          <div className="text-3xl font-semibold text-gray-800">{metricas.totalProdutos}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase font-medium mb-1">Estoque crítico</div>
          <div className="text-3xl font-semibold text-red-600">{metricas.produtosCriticos}</div>
          <div className="text-xs text-gray-400 mt-1">abaixo do mínimo</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase font-medium mb-1">Total de OS</div>
          <div className="text-3xl font-semibold text-gray-800">{metricas.totalOS}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* OS recentes */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-800">Últimas ordens de serviço</h2>
          </div>
          {osRecentes.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">Nenhuma OS ainda</div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {osRecentes.map(os => (
                  <tr key={os.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-blue-600 font-medium">#{os.numero}</td>
                    <td className="px-4 py-3 text-gray-800">{os.clientes?.nome}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeStatus(os.status)}`}>
                        {os.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-right">
                      R$ {Number(os.valor_total).toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Estoque crítico */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-800">⚠️ Estoque crítico</h2>
          </div>
          {criticos.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">Nenhum item crítico</div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {criticos.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{p.nome}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-red-600 font-semibold">{p.estoque_atual}</span>
                      <span className="text-gray-400 text-xs"> / mín {p.estoque_minimo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}