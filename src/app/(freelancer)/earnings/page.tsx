"use client";

import { 
  Wallet, 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  Calendar,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function FreelancerEarnings() {
  const earnings = [
    { id: 'TRX-9901', project: 'Website E-commerce PT Maju', amount: 8400000, date: '2026-06-01', status: 'PAID', type: 'Final Payment' },
    { id: 'TRX-9905', project: 'Sistem POS Enterprise', amount: 3500000, date: '2026-06-04', status: 'PENDING', type: 'Milestone 1' },
    { id: 'TRX-9882', project: 'Bug Fixing Dashboard', amount: 1200000, date: '2026-05-25', status: 'PAID', type: 'Task Bonus' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Penghasilan Saya</h2>
          <p className="text-gray-500 text-sm">Monitor pendapatan, bonus, dan status penarikan dana.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <ArrowDownCircle className="h-4 w-4" /> Tarik Saldo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-primary text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-primary-light/80 uppercase tracking-wider">Saldo Tersedia</p>
              <h3 className="text-3xl font-black mt-2">{formatCurrency(12500000)}</h3>
            </div>
            <div className="p-2 bg-white/10 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-primary-light">
            <span className="bg-white/20 px-2 py-0.5 rounded">+15% dari bulan lalu</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendapatan Tertunda</p>
              <h3 className="text-2xl font-bold mt-2 text-orange-600">{formatCurrency(3500000)}</h3>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="mt-4 text-[10px] text-gray-400 italic">*Dana cair setelah milestone disetujui admin</p>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pendapatan (All Time)</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900">{formatCurrency(158400000)}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-success font-bold">
            <CheckCircle2 className="h-3 w-3" /> 42 Proyek Selesai
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b">
          <h3 className="font-bold text-lg">Riwayat Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Proyek & Keterangan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {earnings.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{trx.project}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{trx.type}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> {trx.date}
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{formatCurrency(trx.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      trx.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {trx.status === 'PAID' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary font-bold hover:underline">Download</button>
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
