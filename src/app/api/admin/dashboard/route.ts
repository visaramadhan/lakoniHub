import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';

export async function GET() {
  try {
    await dbConnect();

    // 1. Stats
    const totalFreelancers = await User.countDocuments({ role: 'FREELANCER', status: 'APPROVED' });
    const activeProjects = await Project.countDocuments({ status: 'ON_PROGRESS' });
    const pendingReview = await User.countDocuments({ 
      $or: [
        { status: 'PENDING' },
        { status: { $exists: false } },
        { status: '' }
      ],
      isApproved: false
    });
    
    // Calculate total earnings (sum of project budgets that are DONE)
    const finishedProjects = await Project.find({ status: 'DONE' });
    const totalEarnings = finishedProjects.reduce((acc, curr) => acc + (curr.totalBudget || curr.budget || 0), 0);

    // 2. Pending Users (Everyone)
    const pendingUsers = await User.find({ 
      $or: [
        { status: 'PENDING' },
        { status: { $exists: false } },
        { status: '' }
      ],
      isApproved: false
    })
      .select('name email role createdAt status')
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Recent Projects
    const recentProjects = await Project.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Top Freelancers (by initialScore)
    const topFreelancers = await User.find({ role: 'FREELANCER', status: 'APPROVED' })
      .sort({ 'stats.initialScore': -1 })
      .limit(5);

    return NextResponse.json({
      stats: {
        totalFreelancers,
        activeProjects,
        pendingReview,
        totalEarnings
      },
      pendingUsers,
      recentProjects,
      topFreelancers
    });

  } catch (error: any) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ message: 'Error fetching dashboard data' }, { status: 500 });
  }
}
