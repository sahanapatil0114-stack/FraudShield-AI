import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

const PAGE_SIZE = 10

export default function DataTable({ data = [], columns = [], searchable = true, onExport }) {
  const [query,   setQuery]   = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page,    setPage]    = useState(1)
  const [status,  setStatus]  = useState('')
  const [risk,    setRisk]    = useState('')

  const filtered = useMemo(() => {
    let rows = [...data]
    if (query) {
      const q = query.toLowerCase()
      rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)))
    }
    if (status) rows = rows.filter(r => r.status === status)
    if (risk)   rows = rows.filter(r => r.risk_level === risk)
    if (sortKey) {
      rows.sort((a, b) => {
        const va = a[sortKey] ?? ''
        const vb = b[sortKey] ?? ''
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, query, status, risk, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ col }) => (
    <span className="ml-1 opacity-40">
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/5 flex flex-wrap gap-3 items-center">
        {searchable && (
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search transactions..."
              className="input-cyber pl-10"
            />
          </div>
        )}
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-cyber w-36">
          <option value="">All Status</option>
          <option value="fraud">Fraud</option>
          <option value="safe">Safe</option>
          <option value="pending">Pending</option>
        </select>
        <select value={risk} onChange={e => { setRisk(e.target.value); setPage(1) }} className="input-cyber w-36">
          <option value="">All Risk</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {onExport && (
          <button onClick={onExport} className="btn-outline py-2 px-4 text-xs flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        )}
        <span className="text-xs text-white/30 ml-auto">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="cyber-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)} className={col.sortable !== false ? 'cursor-pointer select-none' : ''}>
                  {col.label}
                  {col.sortable !== false && <SortIcon col={col.key} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-white/30">
                  <div className="text-4xl mb-2">📭</div>
                  No records found
                </td>
              </tr>
            ) : paginated.map((row, i) => (
              <motion.tr key={row.id ?? i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                {columns.map(col => (
                  <td key={col.key}>{col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}</td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/30">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline py-1 px-3 text-xs disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
            return (
              <button key={p} onClick={() => setPage(p)} className={`py-1 px-3 text-xs rounded-lg transition-all ${p === page ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30 font-cyber' : 'text-white/40 hover:text-white/60'}`}>{p}</button>
            )
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline py-1 px-3 text-xs disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
        </div>
      </div>
    </div>
  )
}
