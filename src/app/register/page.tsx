"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, FileText, Upload, Trash2, Eye, EyeOff, Calendar } from "lucide-react";
import Brand from "@/components/Brand";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FREELANCER",
    phone: "",
    position: "Frontend Developer",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingPeriod, setIsCheckingPeriod] = useState(true);
  const [recruitmentPeriod, setRecruitmentPeriod] = useState<any>(null);
  const [isWithinPeriod, setIsWithinPeriod] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const checkRecruitmentPeriod = async () => {
    try {
      const res = await fetch('/api/admin/settings?key=RECRUITMENT_PERIOD');
      const data = await res.json();
      
      if (data?.value) {
        setRecruitmentPeriod(data.value);
        const now = new Date();
        const start = new Date(data.value.startDate);
        const end = new Date(data.value.endDate);
        
        // Set end to end of day
        end.setHours(23, 59, 59, 999);
        
        if (now >= start && now <= end) {
          setIsWithinPeriod(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingPeriod(false);
    }
  };

  useEffect(() => {
    checkRecruitmentPeriod();
  }, []);

  if (isCheckingPeriod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isWithinPeriod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="h-10 w-10 text-orange-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pendaftaran Ditutup</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Maaf, saat ini rekrutmen sedang tidak dibuka. Silakan kembali lagi pada periode rekrutmen berikutnya.
            </p>
            {recruitmentPeriod && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">Periode Rekrutmen</p>
                <p className="text-sm font-bold text-orange-900">
                  {formatDate(recruitmentPeriod.startDate)} - {formatDate(recruitmentPeriod.endDate)}
                </p>
              </div>
            )}
          </div>
          <div className="pt-4">
            <Link href="/" className="text-primary font-bold hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!cvFile) {
        throw new Error("CV wajib diupload");
      }

      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("password", formData.password);
      form.append("role", "FREELANCER");
      form.append("position", formData.position);
      form.append("cv", cvFile);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Registrasi Berhasil!</h2>
          <p className="text-gray-600">
            Data diri dan CV Anda telah kami terima. Silakan tunggu review dari Admin. Hasil review akan kami kabarkan melalui email.
          </p>
          <div className="pt-4">
            <Link href="/login" className="btn btn-primary w-full">
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Brand href="/" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Daftar Freelancer</h2>
          <p className="mt-2 text-sm text-gray-600">
            Lengkapi data diri dan unggah CV terbaik Anda untuk bergabung
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Informasi Pribadi</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Budi Santoso"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="budi@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Keahlian & CV</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posisi yang Dilamar</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>UI/UX Designer</option>
                  <option>Mobile Developer</option>
                  <option>Data Analyst</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unggah CV (PDF)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer relative group">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-10 w-10 text-gray-400 group-hover:text-primary" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:text-secondary-dark">
                        <span>Upload CV</span>
                        <input type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 italic">Maksimal 5MB</p>
                  </div>
                </div>
                {cvFile && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      {cvFile.name}
                    </div>
                    <button type="button" onClick={() => setCvFile(null)} className="text-blue-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 font-bold shadow-md"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Kirim Pendaftaran"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
