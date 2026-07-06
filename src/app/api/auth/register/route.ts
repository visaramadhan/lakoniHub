import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let reqBody: any = {};
    let cvFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      reqBody = {
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        role: form.get('role') || 'FREELANCER',
        position: form.get('position'),
        skills: form.get('skills'),
      };
      const uploaded = form.get('cv');
      if (uploaded && uploaded instanceof File) {
        cvFile = uploaded;
      }
    } else {
      reqBody = await req.json();
    }

    const { name, email, password, role } = reqBody;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 });
    }

    await dbConnect();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let cvName: string | undefined = reqBody.cvName;
    let cvUrl: string | undefined = reqBody.cvUrl;

    if (cvFile) {
      const maxBytes = 10 * 1024 * 1024;
      if (cvFile.size > maxBytes) {
        return NextResponse.json({ message: 'Ukuran CV maksimal 10MB' }, { status: 400 });
      }

      const ext = path.extname(cvFile.name).toLowerCase();
      const allowedExt = new Set(['.pdf', '.doc', '.docx']);
      if (!allowedExt.has(ext)) {
        return NextResponse.json({ message: 'Format CV harus PDF/DOC/DOCX' }, { status: 400 });
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cv');
      await fs.mkdir(uploadDir, { recursive: true });

      const safeName = `${Date.now()}_${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, safeName);
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      cvName = cvFile.name;
      cvUrl = `/uploads/cv/${safeName}`;
    }

    // Create user (isApproved default to false for FREELANCER and CLIENT)
    // ADMIN can be pre-approved or created manually
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      position: reqBody.position,
      positions: reqBody.position ? [{ name: reqBody.position, rank: 'C', isPrimary: true }] : [],
      cvName,
      cvUrl,
      skills: typeof reqBody.skills === 'string' 
        ? reqBody.skills.split(',').map((s: string) => s.trim()) 
        : reqBody.skills,
      isApproved: role === 'ADMIN' ? true : false, 
      status: role === 'ADMIN' ? 'APPROVED' : 'PENDING'
    });

    return NextResponse.json({ 
      message: 'Registrasi berhasil. Tunggu persetujuan admin untuk login.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
