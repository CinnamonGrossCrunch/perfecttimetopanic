import { SiteHeader } from "../../components/SiteHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader variant="page" />

      <main className="mx-auto max-w-[1280px] px-4 pt-20 pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* ===== HEADER ROW — col-span-12 ===== */}
          <header className="lg:col-span-12 border-b-4 border-black pb-8 pt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-red-600">
              About Worrry
            </p>
            <h1 className="mt-3 font-['Libre_Baskerville',serif] text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-[56px]">
              A Note from the Editor
            </h1>
          </header>

          {/* ===== MAIN TEXT — col 2–8 ===== */}
          <article className="lg:col-span-8 lg:col-start-3 flex flex-col gap-5 text-[16px] leading-[1.8] text-gray-800">

            <p className="font-['Libre_Baskerville',serif] text-xl italic text-gray-700">
              The world is in need of course correction.
            </p>

            {/* DROP CAP paragraph */}
            <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-[-0.1em] first-letter:font-['Libre_Baskerville',serif] first-letter:text-[5.5rem] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-red-600">
              We built Worrry to track the systemic threats to human rights, democracy, global welfare, and society. We aren't here to induce panic. We are here because collective avoidance is how broken systems survive.
            </p>

            <p>
              Our goal is simple: break through the apathy barrier and convert anxiety into resilience.
            </p>

            {/* Section heading */}
            <h2 className="mt-6 border-t-2 border-black pt-8 font-['Libre_Baskerville',serif] text-xl font-bold uppercase tracking-wide text-gray-900 first-letter:float-left first-letter:mr-2 first-letter:mt-[-0.1em] first-letter:text-[5.5rem] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-red-600">
              Origin
            </h2>

            <p>
              Worrry was born out of a very modern friction: the desire to protect our baseline mental health versus our duty to stay informed.
            </p>

            <p>
              The project began when I realized I had formed a dangerous habit. I was swiping away negative news notifications just to get through the day. Skipping the heavy headlines is an effective short-term strategy for personal sanity. On a macro scale, it is disastrous.
            </p>

            <p>
              Inspired by thinkers like Nick Bostrom and Josh Clark's{" "}
              <em>The End of the World</em> podcast, a realization took hold.
            </p>

            {/* PULL QUOTE */}
            <blockquote className="my-6 border-y-4 border-black py-8 text-center font-['Libre_Baskerville',serif] text-3xl italic leading-tight tracking-tight text-red-600">
              Systemic erosion is not an inevitable tragedy. It is a structural vulnerability we can actually fix.
            </blockquote>

            <p>
              But we cannot fix what we refuse to look at. Worrry is the place where we stop looking away. We stripped the lifestyle pieces and palate cleansers from the standard news feed to present the most critical threats directly and clearly.
            </p>

            <h2 className="mt-6 border-t-2 border-black pt-4 font-['Libre_Baskerville',serif] text-xl font-bold uppercase tracking-wide text-gray-900">
              Deliberate Consumption
            </h2>

            <p>
              The balance between mental health and civic duty is fragile. Constant exposure to the 24-hour news cycle leads to burnout, but total avoidance leads to apathy. We built Worrry to resolve this friction.
            </p>

            <p>
              By consolidating the day's most critical developments into a single briefing, we eliminate the need for endless doomscrolling. We curate the crisis so you can engage with the world on your own terms. We provide the facts for when you have the time, the headspace, and the focus required to truly process them and take meaningful action.
            </p>

            <h2 className="mt-6 border-t-2 border-black pt-4 font-['Libre_Baskerville',serif] text-xl font-bold uppercase tracking-wide text-gray-900">
              The Philosophy: Reveal, Rethink, Respond
            </h2>

            <p>
              The name Worrry is spelled with three Rs by design. They represent our core philosophy: a framework to prevent apathy and mobilize action.
            </p>

          </article>

          {/* ===== SIDEBAR — cols 10–12 ===== */}
          <aside className="lg:col-span-3 lg:col-start-11">
            <div className="sticky top-24 border-l border-gray-300 pl-6">
              <h3 className="mb-5 font-['Libre_Baskerville',serif] text-[12px] font-bold uppercase tracking-[0.22em] text-gray-900">
                Worrry In Brief
              </h3>
              <ul className="flex flex-col divide-y divide-gray-200">
                {[
                  {
                    label: "Mission",
                    text: "Track systemic global threats and convert collective anxiety into resilience.",
                  },
                  {
                    label: "Format",
                    text: "AI-classified briefing, refreshed every 2 hours. One page. No fluff.",
                  },
                  {
                    label: "Framework",
                    text: "Reveal → Rethink → Respond. Three Rs. Agency over apathy.",
                  },
                  {
                    label: "Founder",
                    text: "Matt Gross",
                  },
                ].map(({ label, text }) => (
                  <li key={label} className="py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
                      {label}
                    </p>
                    <p className="mt-1.5 text-[13.5px] leading-snug text-gray-700">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ===== 3 Rs BREAKOUT — col-span-12 ===== */}
          <section className="lg:col-span-12 mt-4 border-t-2 border-black pt-8">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-red-600">
              The Framework
            </p>
            <h2 className="mb-8 font-['Libre_Baskerville',serif] mt-1 text-3xl font-bold text-gray-900 md:text-4xl">
           
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Reveal.",
                  body: "Confront the unvarnished reality. We pull back the curtain on the world's most pressing vulnerabilities. By gathering reporting from top global sources, we filter out the noise to deliver an unblinking look at the state of the world. No fluff, no distraction.",
                },
                {
                  n: "02",
                  title: "Rethink.",
                  body: "Move past the initial shock. We break down complex geopolitical and systemic threats into clear structures: the panic, the hope, and the action. We analyze the data so you can understand the mechanics of the threat, shifting your mind from dread to comprehension.",
                },
                {
                  n: "03",
                  title: "Respond.",
                  body: "Convert anxiety into kinetic energy. Doomscrolling is passive. Worrry is active. By clearly revealing the threats and rethinking our relationship to them, we empower you to reclaim your agency, demand accountability, and actively participate in course correction.",
                },
              ].map(({ n, title, body }) => (
                <div key={n} className="border-t-2 border-black pt-5">
                  <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">{n}</p>
                  <h3 className="mt-2 font-['Libre_Baskerville',serif] text-2xl font-bold text-gray-900 first-letter:float-left first-letter:mr-2 first-letter:mt-[-0.1em] first-letter:text-[5.5rem] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-red-600">
                    {title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.75] text-gray-700">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ===== CLOSING — col 2–8 ===== */}
          <div className="lg:col-span-8 lg:col-start-3 flex flex-col gap-5 text-[16px] leading-[1.8] text-gray-800">
            <h2 className="border-t-2 border-black pt-4 font-['Libre_Baskerville',serif] text-xl font-bold uppercase tracking-wide text-gray-900">
              How It Works
            </h2>
            <p>
              Behind the scenes, we continuously gather, classify, and synthesize reporting from trusted global institutions, independent journalists, and specialized think tanks. We evaluate stories for their relevance to global threats including climate destabilization, democratic erosion, and unchecked technological advancement, then lay them out in a clear, single-page briefing.
            </p>

            <p className="font-['Libre_Baskerville',serif] text-lg font-bold italic text-gray-900 first-letter:float-left first-letter:mr-2 first-letter:mt-[-0.1em] first-letter:text-[5.5rem] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-red-600">
              Your Awareness is your power.
            </p>

            {/* SIGN-OFF */}
            <div className="mt-8 border-t border-gray-300 pt-8 text-right">
              <p className="font-['Libre_Baskerville',serif] text-3xl italic text-gray-900">
                Matt Gross
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.28em] text-gray-500">
                Worrrier-in-Chief
              </p>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-gray-300 pb-12 pt-8 text-center text-xs uppercase tracking-[0.18em] text-gray-500">
        <p> A Gross Domestic Publication</p>
      </footer>
    </div>
  );
}
