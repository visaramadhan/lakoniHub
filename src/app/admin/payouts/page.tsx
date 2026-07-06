"use client";

import { 
  DollarSign, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminPayouts() {
  const payouts = [
    { id: 'PAY-001', freelancer: 'Budi Santoso', amount: 12500000, project: 'Mobile App FinTech', date: '2026-06-01', status: 'PAID', method: 'Transfer Bank' },
    { id: 'PAY-002', freelancer: 'Sari Dewi', amount: 4500000, project: 'Dashboard Analytics', date: '2026-06-03', status: 'PENDING', method: 'E-Wallet' },
    { id: 'PAY-003', freelancer: 'Andi Firmansyah', amount: 8000000, project: 'Sistem POS Enterprise', date: '2026-06-04', status: 'PROCESSING', method: 'Transfer Bank' },
    { id: 'PAY-004', freelancer: 'Rina Kusuma', amount: 1500000, project: 'Copywriting Batch 5', date: '2026-06-04', status: 'FAILED', method: 'Transfer Bank' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Payout</h2>
          <p className="text-gray-500 text-sm">Monitor distribusi fee dan status pembayaran freelancer.</p>
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
          <Download className="h-4 w-4" /> Export Laporan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-primary">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Dibayarkan</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(450000000)}</h3>
            <span className="text-success text-xs font-bold flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> 12%
            </span>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-orange-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menunggu Pembayaran</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(24500000)}</h3>
            <span className="text-orange-500 text-xs font-bold">12 Transaksi</span>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-green-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendapatan Platform (Fee)</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(67800000)}</h3>
            <span className="text-success text-xs font-bold">Total Net</span>
          </div>
        </div>
      </div>

      {/* Payout Table */}
      <div className="card">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari ID transaksi atau nama freelancer..."
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-2 text-sm focus:outline-none">
              <option>Semua Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Freelancer</th>
                <th className="px-6 py-4">Proyek</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {payouts.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{pay.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{pay.freelancer}</div>
                    <div className="text-[10px] text-gray-400">{pay.method}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{pay.project}</td>
                  <td className="px-6 py-4 font-bold text-primary">{formatCurrency(pay.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      pay.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                      pay.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 
                      pay.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {pay.status === 'PAID' && <CheckCircle2 className="h-3 w-3" />}
                      {pay.status === 'PENDING' && <Clock className="h-3 w-3" />}
                      {pay.status === 'FAILED' && <AlertCircle className="h-3 w-3" />}
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary font-bold hover:underline">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
