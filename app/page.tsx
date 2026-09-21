import { SiteFooter } from "@/components/site/layout/site-footer"
import { SiteHeader } from "@/components/site/layout/site-header"
import { BrandIntro } from "@/components/site/layout/brand-intro"
import { Campaigns } from "@/components/site/sections/campaigns"
import { Categories } from "@/components/site/sections/categories"
import { Faq } from "@/components/site/sections/faq"
import { Hero } from "@/components/site/sections/hero"
import { ProofBar } from "@/components/site/sections/proof-bar"
import { Story } from "@/components/site/sections/story"
import { TransparencyJourney } from "@/components/site/sections/transparency-journey"

export default function Home() {
  return (
    <>
      <BrandIntro />
      <SiteHeader />

      <main className="mz-page-content">
        <Hero />
        <ProofBar />
        <Categories />
        <Campaigns />
        <TransparencyJourney />
        <Story />
        <Faq />
      </main>

      <SiteFooter />
    </>
  )
}
