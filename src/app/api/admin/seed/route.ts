import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const adminEmail = 'admin@prosesin.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Update password just in case
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'ADMIN';
      existingAdmin.isApproved = true;
      existingAdmin.status = 'APPROVED';
      await existingAdmin.save();
      
      return NextResponse.json({ 
        message: 'Akun admin default sudah ada dan telah diperbarui.',
        user: { email: adminEmail, role: 'ADMIN' }
      });
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const newAdmin = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
      status: 'APPROVED',
      position: 'Administrator'
    });

    return NextResponse.json({ 
      message: 'Akun admin default berhasil dibuat.',
      user: { email: newAdmin.email, role: 'ADMIN' }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Seed Admin Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan saat seeding: ' + error.message }, { status: 500 });
  }
}
