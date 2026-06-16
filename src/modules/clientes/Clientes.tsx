import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Cliente {
  id: string
  nome: string
  cpf: string
  telefone: string
  email: string
  endereco: string
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', email: '', endereco: '' })

  useEffect(() => {
    buscarClientes()
  }, [])

  async function buscarClientes() {
    setLoading(true)
    const { data } = await supabase.from('clientes').select('*').order('nome')
    setClientes(data || [])
    setLoading(false)
  }

  async function salvarCliente() {
    if (!form.nome) return alert('Nome é obrigatório')
    await supabase.from('clientes').insert([form])
    setForm({ nome: '', cpf: '', telefone: '', email: '', endereco: '' })
    setMostrarForm(false)
    buscarClientes()
  }

  async function excluirCliente(id: string) {
    if (!confirm('Excluir este cliente?')) return
    await supabase.from('clientes').delete().eq('id', id)
    buscarClientes()
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-500">{clientes.length} clientes cadastrados</p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Novo cliente
        </button>
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-base font-medium text-gray-800 mb-4">Novo cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Nome *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">CPF</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Telefone</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Email</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 uppercase font-medium">Endereço</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={salvarCliente}
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
        ) : clientes.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Nenhum cliente cadastrado ainda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Telefone</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">CPF</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-medium">Email</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{c.telefone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.cpf || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => excluirCliente(c.id)}
                      className="text-red-500 hover:text-red-700 text-xs">
                      Excluir
                    </button>
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