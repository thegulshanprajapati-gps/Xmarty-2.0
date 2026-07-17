import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    
    // Seed default subscription plans if empty
    const count = await db.collection('subscription_plans').countDocuments({});
    if (count === 0) {
      const defaultPlans = [
        {
          name: "Student Plan",
          slug: "student-plan",
          description: "Standard creative courses access, verified certificates download, and WhatsApp QA group access.",
          monthlyPrice: 199,
          yearlyPrice: 1999,
          currency: "INR",
          trialDays: 3,
          features: [
            "Access to all basic courses",
            "Download PPTX/PDF certificates",
            "WhatsApp & Telegram communities",
            "Standard quiz attempts allowed"
          ],
          badge: "Best for Starters",
          popular: false,
          isActive: true,
          createdAt: new Date()
        },
        {
          name: "Premium Plan",
          slug: "premium-plan",
          description: "Popular membership unlocking unlimited proctored quizzes, developer code sandboxes, and early updates access.",
          monthlyPrice: 399,
          yearlyPrice: 3999,
          currency: "INR",
          trialDays: 7,
          features: [
            "Access to 100% video courses",
            "Unlimited proctored exam sessions",
            "Anti-cheat proctoring warnings analytics",
            "Direct Slack support group channels",
            "1-on-1 monthly mentorship call"
          ],
          badge: "Most Popular",
          popular: true,
          isActive: true,
          createdAt: new Date()
        },
        {
          name: "Institution Plan",
          slug: "institution-plan",
          description: "Full group enterprise licensing package for colleges, schools, and developers teams with custom layouts branding.",
          monthlyPrice: 999,
          yearlyPrice: 9999,
          currency: "INR",
          trialDays: 14,
          features: [
            "Team access keys management",
            "Custom branding configurations",
            "Priority developer features release",
            "Offline android apk assets license",
            " Graders support manual dashboard overrides"
          ],
          badge: "Enterprise",
          popular: false,
          isActive: true,
          createdAt: new Date()
        }
      ];
      await db.collection('subscription_plans').insertMany(defaultPlans);
    }

    const plans = await db.collection('subscription_plans').find({ isActive: true }).toArray();

    return NextResponse.json({
      success: true,
      plans: plans.map((p: any) => ({
        ...p,
        id: p._id.toString(),
        _id: undefined
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
