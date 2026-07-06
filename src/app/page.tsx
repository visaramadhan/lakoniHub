import Link from 'next/link';
import { Briefcase, Shield, Users, Zap } from 'lucide-react';
import Brand from '@/components/Brand';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white">
        <Brand href="/" />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Fitur
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Harga
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Masuk
          </Link>
          <Link className="btn btn-primary text-sm h-10 px-5" href="/register">
            Daftar
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary-light">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Platform Freelance dengan Smart Team Matching
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Bangun tim impian Anda dengan sistem ranking cerdas. Efisien, transparan, dan professional.
                </p>
              </div>
              <div className="space-x-4">
                <Link className="btn btn-primary h-11 px-8" href="/register">
                  Mulai Sekarang
                </Link>
                <Link className="btn btn-secondary h-11 px-8" href="#">
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
                <Shield className="h-12 w-12 text-primary mb-2" />
                <h3 className="text-xl font-bold">Sistem Ranking S-D</h3>
                <p className="text-sm text-gray-500 text-center">
                  Hierarki freelancer yang jelas berdasarkan performa dan keahlian nyata.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
                <Users className="h-12 w-12 text-primary mb-2" />
                <h3 className="text-xl font-bold">Smart Team Matching</h3>
                <p className="text-sm text-gray-500 text-center">
                  STMS Engine membantu admin memilih tim terbaik untuk setiap proyek.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
                <Zap className="h-12 w-12 text-primary mb-2" />
                <h3 className="text-xl font-bold">Manajemen Proyek</h3>
                <p className="text-sm text-gray-500 text-center">
                  Sistem monitoring proyek yang rapih untuk client dan tim freelancer.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
                <Briefcase className="h-12 w-12 text-primary mb-2" />
                <h3 className="text-xl font-bold">Distribusi Fee Adil</h3>
                <p className="text-sm text-gray-500 text-center">
                  Sistem bagi hasil otomatis berdasarkan bobot rank dan kontribusi tim.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2026 FreelanceHub. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Syarat & Ketentuan
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privasi
          </Link>
        </nav>
      </footer>
    </div>
  );
}
