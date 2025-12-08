import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get stored questions
    const generatedQuestions = user.generatedQuestions || new Map();

    // Flatten the questions into an array
    const questions: { questionId?: string; text: string; skill?: string; keywords?: string[] }[] = [];
    for (const [skill, qList] of generatedQuestions.entries()) {
      qList.forEach((q: any, index: number) => {
        questions.push({
          questionId: `${skill}-${index}`,
          text: q.text,
          skill,
          keywords: q.keywords || [],
        });
      });
    }

    return NextResponse.json(questions);

  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
