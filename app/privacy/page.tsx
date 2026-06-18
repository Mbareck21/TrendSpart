export const metadata = {
  title: "Privacy Policy — TrendSpark",
  description: "Privacy Policy for the TrendSpark content tool.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0e1a] px-6 py-16 text-slate-300">
      <div className="mx-auto max-w-3xl space-y-6 leading-relaxed">
        <header>
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: June 17, 2026</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">1. What this policy covers</h2>
          <p>
            This policy explains what information TrendSpark handles when you use it to
            generate and publish short videos to your own TikTok account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">2. Information we handle</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Topics and keywords you enter to find news.</li>
            <li>Content generated for you (scripts, voiceovers, video files).</li>
            <li>
              TikTok authorization tokens obtained when you connect your account, and basic
              profile information TikTok returns (such as your username and open id).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">3. How we use it</h2>
          <p>
            Information is used only to operate the service for you: to find news, generate
            content, and publish videos to the TikTok account you authorize. We do not sell
            your information or use it for advertising.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">4. Third-party services</h2>
          <p>
            To provide the service, content may be processed by third-party providers,
            including NewsAPI (news headlines), Groq and OpenAI (text and voice generation),
            Pexels and Pixabay (stock footage), and TikTok (publishing). Their handling of
            data is governed by their own policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">5. TikTok data</h2>
          <p>
            TrendSpark accesses TikTok only through TikTok&apos;s official API and only for
            the account you authorize. Authorization tokens are stored securely and used
            solely to post and manage content at your direction. We comply with TikTok&apos;s
            developer policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">6. Retention and deletion</h2>
          <p>
            You can revoke TrendSpark&apos;s access to your TikTok account at any time from
            your TikTok settings, which stops further access. To request deletion of
            information held about you, contact us using the address below.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">7. Contact</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a className="text-violet-400 underline" href="mailto:missara.lamine@gmail.com">
              missara.lamine@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
