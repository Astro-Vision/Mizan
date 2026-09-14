import { SiteFooter } from "@/components/site/layout/site-footer"
import { SiteHeader } from "@/components/site/layout/site-header"
import { TestnetBanner } from "@/components/site/layout/testnet-banner"
import { Campaigns } from "@/components/site/sections/campaigns"
import { Categories } from "@/components/site/sections/categories"
import { ClosingCta } from "@/components/site/sections/closing-cta"
import { Faq } from "@/components/site/sections/faq"
import { FundFlow } from "@/components/site/sections/fund-flow"
import { Hero } from "@/components/site/sections/hero"
import { HowItWorks } from "@/components/site/sections/how-it-works"
import { ProofBar } from "@/components/site/sections/proof-bar"
import { StatsBand } from "@/components/site/sections/stats-band"
import { Story } from "@/components/site/sections/story"

export default function Home() {
  return (
    <>
      <TestnetBanner />
      <SiteHeader />

      <main>
        <Hero />
        <ProofBar />
        <Categories />
        <Campaigns />
        <HowItWorks />
        <FundFlow />
        <StatsBand />
        <Story />
        <Faq />
        <ClosingCta />
      </main>

      <SiteFooter />
    </>
  )
}
