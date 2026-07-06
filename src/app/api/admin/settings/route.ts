import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (key) {
      const setting = await Setting.findOne({ key });
      return NextResponse.json(setting);
    }
    
    const settings = await Setting.find({});
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { key, value, description } = await req.json();
    
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, description },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating setting' }, { status: 500 });
  }
}
