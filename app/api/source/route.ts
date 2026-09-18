import { db } from "@/src/prisma/db"
import { createSource } from "@/src/service/sourceService"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const data = await createSource(body)

        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
    }
}

export async function GET(request: Request) {
    try {
        const sources = await db.orm.public.Source.all()

        return NextResponse.json(sources)
    } catch (error) {
        console.log(error)
    }
}