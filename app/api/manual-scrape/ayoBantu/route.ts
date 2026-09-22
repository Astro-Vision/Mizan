// app/api/scrape-campaign/route.ts
// Next.js App Router API route: scraping daftar campaign Ayobantu.com pakai Cheerio

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export interface Campaign {
  title: string;
  url: string;
  image: string;
  category: string;
  collected: string;   // contoh: "Rp 10.000"
  target: string;      // contoh: "Rp 500.000.000" atau "tidak terbatas"
  campaigner: string;
  campaignerUrl: string;
  verified: boolean;
  daysLeft: string;    // contoh: "10 hari lagi"
}

const BASE_URL = "https://ayobantu.com/campaign";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Forward query params dari request kita ke Ayobantu
  // (category, status, campaign_type, sort, page, dst)
  const targetUrl = `${BASE_URL}?${searchParams.toString()}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        // beberapa server block request tanpa User-Agent browser
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
      // cache: "no-store", // aktifkan kalau tidak mau di-cache Next.js
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Gagal fetch, status: ${res.status}` },
        { status: res.status }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const campaigns: Campaign[] = [];

    // Setiap campaign card ada di dalam <a href="/campaign/slug"> yang membungkus <img>,
    // diikuti oleh kategori (h6/div kecil), judul (h6 dengan <a>), progress donasi, dan campaigner.
    // Kita pakai anchor "Donasi" (href berakhiran /donate) sebagai penanda akhir tiap card,
    // lalu ambil elemen-elemen sebelumnya dalam parent container yang sama.

    $('a[href$="/donate"]').each((_, donateEl) => {
      const $donate = $(donateEl);
      const $card = $donate.closest("div"); // container per-card (sesuaikan jika struktur beda)

      // Cari elemen judul: <a> ke /campaign/slug yang BUKAN link donate & bukan link gambar/campaigner
      const $titleLink = $card
        .find('a[href*="/campaign/"]')
        .filter((_, el) => {
          const href = $(el).attr("href") || "";
          return (
            !href.endsWith("/donate") &&
            !href.includes("?campaigner=") &&
            $(el).find("h6, h5, strong").length > 0 // link yang membungkus judul
          );
        })
        .first();

      const title = $titleLink.text().trim();
      const url = $titleLink.attr("href") || "";

      const image =
        $card.find('a[href*="/campaign/"] img').first().attr("src") || "";

      const category = $card
        .find("a, div")
        .filter((_, el) => {
          const t = $(el).text().trim();
          return (
            t.length > 0 &&
            t.length < 30 &&
            !t.includes("Rp") &&
            !t.toLowerCase().includes("donasi")
          );
        })
        .first()
        .text()
        .trim();

      const progressText = $card.text();
      const collectedMatch = progressText.match(/Rp[\s.\d]+terkumpul/);
      const targetMatch = progressText.match(
        /dari\s+(Rp[\s.\d]+|∞\s*tidak terbatas)/
      );

      const $campaignerLink = $card
        .find('a[href*="?campaigner="]')
        .first();
      const campaigner = $campaignerLink.text().trim();
      const campaignerUrl = $campaignerLink.attr("href") || "";

      const verified =
        $card.find('img[alt="Verified User"]').length > 0;

      const daysMatch = progressText.match(/\d+\s*hari lagi/);

      if (title && url) {
        campaigns.push({
          title,
          url: `https://ayobantu.com${url.startsWith("/") ? url : `/${url}`}`,
          image,
          category,
          collected: collectedMatch ? collectedMatch[0].replace("terkumpul", "").trim() : "",
          target: targetMatch ? targetMatch[1].trim() : "",
          campaigner,
          campaignerUrl,
          verified,
          daysLeft: daysMatch ? daysMatch[0] : "",
        });
      }
    });

    // Cek apakah ada halaman selanjutnya
    const hasNextPage = $('a:contains("Next")').length > 0;

    return NextResponse.json({
      count: campaigns.length,
      hasNextPage,
      campaigns,
    });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json(
      { error: "Gagal melakukan scraping" },
      { status: 500 }
    );
  }
}