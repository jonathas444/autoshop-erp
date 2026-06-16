import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Cliente { id: string; nome: string }
interface Veiculo { id: string; modelo: string; placa: string; cliente_id: string }
interface OS {
  id: string; numero: number; descricao: string;
  status: string; mecanico: string; valor_total: number; criado_em: string;
  clientes: { nome: string }
  veiculos: { modelo: string; placa: string }
}

const STATUS = ['Aguardando', 'Em andamento', 'Concluída', 'Cancelada']

export default function OrdensServico() {
  const [ordens, setOrdens] = useState<OS[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [form, setForm] = useState({
    cliente_id: '', veiculo_id: '', descricao: '',
    mecanico: '', valor_total: '', status: 'Aguardando'
  })

  useEffect(() => {
    buscarOrdens()
    buscarClientes()
  }, [])

  async function buscarOrdens() {
    setLoading(true)
    const { data } = await supabase
      .from('ordens_servico')
      .select('*, clientes(nome), veiculos(modelo, placa)')
      .order('criado_em', { ascending: false })
    setOrdens(data || [])
    setLoading(false)
  }

  async function buscarClientes() {
    const { data } = await supabase.from('clientes').select('id, nome').order('nome')
    setClientes(data || [])
  }

  async function buscarVeiculos(clienteId: string) {
    const { data } = await supabase.from('veiculos').select('id, modelo, placa, cliente_id').eq('cliente_id', clienteId)
    setVeiculos(data || [])
  }

  async function salvarOS() {
    if (!form.cliente_id) return alert('Selecione um cliente')
    if (!form.descricao) return alert('Descreva o serviço')
    await supabase.from('ordens_servico').insert([{
      cliente_id: form.cliente_id,
      veiculo_id: form.veiculo_id || null,
      descricao: form.descricao,
      mecanico: form.mecanico,
      valor_total: Number(form.valor_total),
      status: form.status,
    }])
    setForm({ cliente_id: '', veiculo_id: '', descricao: '', mecanico: '', valor_total: '', status: 'Aguardando' })
    setMostrarForm(false)
    buscarOrdens()
  }

  async function atualizarStatus(id: string, status: string) {
    await supabase.from('ordens_servico').update({ status }).eq('id', id)
    buscarOrdens()
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

  const ordensFiltradas = filtroStatus ? ordens.filter(o => o.status === filtroStatus) : ordens

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Ordens de serviço</h1>
          <p className="text-sm text-gray-500">{ordens.length} ordens no total</p>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Nova OS
        </button>
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-base font-medium text-gray-800 mb-4">Nova ordem de serviço</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Cliente *</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.cliente_id}
                onChange={e => {
                  setForm({ ...form, cliente_id: e.target.value, veiculo_id: '' })
                  buscarVeiculos(e.target.value)
                }}>
                <option value="">Selecione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Veículo</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.veiculo_id}
                onChange={e => setForm({ ...form, veiculo_id: e.target.value })}>
                <option value="">Selecione...</option>
                {veiculos.map(v => <option key={v.id} value={v.id}>{v.modelo} — {v.placa}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 uppercase font-medium">Descrição do serviço *</label>
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" rows={3}
                value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Mecânico responsável</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.mecanico} onChange={e => setForm({ ...form, mecanico: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Valor total (R$)</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.valor_total} onChange={e => setForm({ ...form, valor_total: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Status</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={salvarOS}
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

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFiltroStatus('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!filtroStatus ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          Todas
        </button>
        {STATUS.map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filtroStatus === s ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Carregando...</div>
        ) : ordensFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Nenhuma ordem encontrada.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">OS</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Serviço</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Mecânico</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Valor</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ordensFiltradas.map(os => (
                <tr key={os.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-blue-600">#{os.numero}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{os.clientes?.nome}</div>
                    {os.veiculos && <div className="text-xs text-gray-400">{os.veiculos.modelo} — {os.veiculos.placa}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{os.descricao}</td>
                  <td className="px-4 py-3 text-gray-600">{os.mecanico || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    R$ {Number(os.valor_total).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={os.status}
                      onChange={e => atualizarStatus(os.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${badgeStatus(os.status)}`}>
                      {STATUS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}