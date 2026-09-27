import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { DASHBOARD_SESSION_COOKIE, readDashboardSession } from "@/src/lib/auth-session"
import { campaignInputSchema } from "@/src/lib/beneficiary/validation"
import { db } from "@/src/prisma/db"
import { createCampaignWithMilestones } from "@/src/lib/beneficiary/campaign-mutations"

export async function POST(request: Request) {
  try {
    const session = await readDashboardSession((await cookies()).get(DASHBOARD_SESSION_COOKIE)?.value)
    if (!session || session.role !== "BENEFICIARY") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await db.orm.public.User.where({ privyId: session.privyId }).first()
    const activeMembership = user ? await db.orm.public.CommunityMember.where({ userId: user.id, status: "ACTIVE" }).first() : null
    const community = activeMembership ? await db.orm.public.Community.where({ id: activeMembership.communityId }).first() : null

    if (!user || user.role !== "BENEFICIARY" || !community) return NextResponse.json({ error: "Akun ini belum terhubung ke organisasi manapun." }, { status: 403 })
    const parsed = campaignInputSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: "Input kampanye tidak valid.", details: parsed.error.flatten() }, { status: 400 })
    const campaign = await createCampaignWithMilestones(parsed.data, community)
    return NextResponse.json(campaign, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan saat membuat kampanye." }, { status: 500 })
  }
}
