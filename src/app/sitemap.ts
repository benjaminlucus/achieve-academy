import { MetadataRoute } from 'next';
import { connectDB } from '@/database/connect';
import User from '@/database/models/user.model';
import TutorProfile from '@/database/models/tutor.model';
import StudentProfile from '@/database/models/student.model';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://achieveacademy.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${appUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/howitworks`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/how-to-use`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${appUrl}/feedbacks`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/tutors`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${appUrl}/students`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  try {
    await connectDB();

    // Fetch verified, public tutors
    const publicTutors = await TutorProfile.find({})
      .populate({
        path: 'user',
        model: User,
        match: { status: 'verified', isPublicProfile: { $ne: false } },
        select: '_id',
      })
      .lean();

    const tutorUrls = publicTutors
      .filter((t) => t.user)
      .map((t) => ({
        url: `${appUrl}/tutors/${(t.user as any)._id}`,
        lastModified: t.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    // Fetch verified, public students
    const publicStudents = await StudentProfile.find({})
      .populate({
        path: 'user',
        model: User,
        match: { status: 'verified', isPublicProfile: { $ne: false } },
        select: '_id',
      })
      .lean();

    const studentUrls = publicStudents
      .filter((s) => s.user)
      .map((s) => ({
        url: `${appUrl}/students/${(s.user as any)._id}`,
        lastModified: s.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    return [...staticPages, ...tutorUrls, ...studentUrls];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return staticPages;
  }
}
