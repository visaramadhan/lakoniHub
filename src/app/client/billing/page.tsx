"use client";

import { 
  Wallet, 
  CreditCard, 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ClientBilling() {
  const invoices = [
    { id: 'INV-2026-001', project: 'Aplikasi Mobile E-commerce', amount: 15000000, date: '2026-05-10', status: 'PAID', type: 'Down Payment (30%)' },
    { id: 'INV-2026-005', project: 'Aplikasi Mobile E-commerce', amount: 17500000, date: '2026-06-01', status: 'PENDING', type: 'Milestone 2 (35%)' },
    { id: 'INV-2026-003', project: 'Website Company Profile', amount: 5000000, date: '2026-05-20', status: 'PAID', type: 'Final Payment (100%)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tagihan & Pembayaran</h2>
          <p className="text-gray-500 text-sm">Kelola budget proyek dan riwayat pembayaran Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gray-900 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Investasi Proyek</p>
            <h3 className="text-3xl font-bold mt-2">{formatCurrency(75000000)}</h3>
            <div className="flex items-center gap-2 mt-4 text-xs font-medium">
              <span className="bg-white/10 px-2 py-1 rounded">2 Proyek Aktif</span>
              <span className="bg-white/10 px-2 py-1 rounded">1 Selesai</span>
            </div>
          </div>
          <CreditCard className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 -rotate-12" />
        </div>

        <div className="card p-6 border-l-4 border-orange-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tagihan Tertunda</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-gray-900 text-orange-600">{formatCurrency(17500000)}</h3>
            <button className="text-primary text-xs font-bold hover:underline">Bayar Sekarang</button>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-primary">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimasi Biaya Maintenance</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(2500000)}</h3>
            <span className="text-gray-400 text-xs font-bold">Per Bulan</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Riwayat Invoice</h3>
          <button className="btn btn-secondary py-1.5 text-xs flex items-center gap-2">
            <Download className="h-3.5 w-3.5" /> Download Semua
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">ID Invoice</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{inv.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{inv.project}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{inv.type}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(inv.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {inv.status === 'PAID' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded text-gray-400 hover:text-primary" title="Download PDF">
                      <Download className="h-4 w-4" />
                    </button>
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
