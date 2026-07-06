import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await dbConnect();
    const projects = await Project.find({}).populate('team.user', 'name email position positions').sort({ createdAt: -1 });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    let uploadedFiles: File[] = [];

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      body = {
        title: form.get('title'),
        description: form.get('description'),
        rank: form.get('rank'),
        client: form.get('client'),
        budget: Number(form.get('budget') || 0),
        feeForFreelancer: Number(form.get('feeForFreelancer') || 0),
        projectType: form.get('projectType'),
        deadline: form.get('deadline'),
        requiredSkills: JSON.parse(String(form.get('requiredSkills') || '[]')),
        requiredPositions: JSON.parse(String(form.get('requiredPositions') || '[]')),
      };
      uploadedFiles = form.getAll('files').filter((file) => file instanceof File) as File[];
    } else {
      body = await req.json();
    }

    const files = [];
    if (uploadedFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects');
      await fs.mkdir(uploadDir, { recursive: true });

      for (const file of uploadedFiles) {
        const ext = path.extname(file.name);
        const safeName = `${Date.now()}_${crypto.randomUUID()}${ext}`;
        const filePath = path.join(uploadDir, safeName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        files.push({
          name: file.name,
          url: `/uploads/projects/${safeName}`,
          uploadedBy: 'ADMIN',
        });
      }
    }

    const project = await Project.create({
      ...body,
      clientFee: body.budget * 0.7, 
      totalBudget: body.budget,
      feeForFreelancer: body.feeForFreelancer || body.budget * 0.7,
      projectType: body.projectType,
      status: 'OPEN',
      files,
      requiredSkills: Array.isArray(body.requiredSkills)
        ? body.requiredSkills
        : typeof body.requiredSkills === 'string'
          ? body.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      requiredPositions: Array.isArray(body.requiredPositions) ? body.requiredPositions : []
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating project' }, { status: 500 });
  }
}
