import Link from "next/link";
import Image from "next/image";

export default function IntroducingAskMichaelAIPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-20">
      <article className="max-w-4xl mx-auto">

        {/* ARTICLE HEADER */}
        <div className="mb-12">
          <Link
            href="/news"
            className="text-sm text-blue-500 hover:text-blue-600 transition"
          >
            ← Back to News & Announcements
          </Link>

          <div className="mt-8 mb-4">
            <span className="text-sm text-blue-500 font-medium">
              Platform Update
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Introducing Ask Michael AI: Bringing Artificial Intelligence to
            Heavy Metal Engineering
          </h1>

          <p className="text-sm text-muted-foreground">
            September 2026
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl">
  <Image
    src="/images/news/ask-michael-ai-heavy-industry.png"
    alt="Ask Michael AI supporting engineering intelligence in a heavy industrial environment"
    width={1600}
    height={900}
    className="w-full h-auto object-cover"
    priority
  />
</div>
        </div>

        {/* ARTICLE CONTENT */}
        <div className="prose prose-lg dark:prose-invert max-w-none">

          <p>
            We are proud to introduce <strong>Ask Michael AI</strong>, an
            industrial artificial intelligence platform designed to bring
            engineering knowledge, procedures, and operational decision
            support into one intelligent environment.
          </p>

          <p>
            Ask Michael AI has been developed with a specific focus on the
            challenges faced by <strong>heavy metal engineering, aluminium
            smelting, maintenance, welding, inspection, and industrial
            operations</strong>.
          </p>

          <h2>Turning Engineering Knowledge Into Practical Intelligence</h2>

          <p>
            Industrial environments contain enormous amounts of valuable
            knowledge—engineering procedures, inspection reports, maintenance
            records, technical documentation, standards, historical
            information, and years of experience.
          </p>

          <p>
            The challenge is not always finding information.
          </p>

          <p>
            The challenge is finding the <strong>right information at the
            right time</strong> and turning it into something useful for an
            engineering or operational decision.
          </p>

          <p>
            Ask Michael AI is designed to help address that challenge.
          </p>

          <p>
            Users can provide relevant engineering documentation and
            operational information to the platform, allowing Ask Michael to
            process that information and provide AI-assisted insights,
            explanations, recommendations, and decision support.
          </p>

          <p>The goal is simple:</p>

          <p>
            <strong>
              Make valuable engineering knowledge easier to access, understand,
              and use.
            </strong>
          </p>

          <h2>Built for Industrial Engineering</h2>

          <p>
            Ask Michael AI is not designed as a general-purpose chatbot.
          </p>

          <p>
            It is being developed around the needs of industrial environments
            where technical knowledge, procedures, maintenance information,
            and operational decisions matter.
          </p>

          <p>Areas of focus include:</p>

          <ul>
            <li>Aluminium smelting and potroom operations</li>
            <li>Heavy metal engineering</li>
            <li>Pot shell and industrial equipment repair</li>
            <li>Welding and fabrication</li>
            <li>Maintenance intelligence</li>
            <li>Engineering procedures</li>
            <li>Inspection and technical documentation</li>
            <li>Industrial knowledge management</li>
            <li>Operational decision support</li>
          </ul>

          <p>
            The platform is particularly focused on helping organisations make
            better use of the engineering knowledge they already possess.
          </p>

          <h2>AI-Assisted Engineering Knowledge</h2>

          <p>
            One of the core ideas behind Ask Michael AI is that artificial
            intelligence should work <strong>with engineering knowledge</strong>,
            rather than simply generate generic answers.
          </p>

          <p>
            By combining AI with relevant technical documentation and
            organisational knowledge, Ask Michael can help users explore
            complex engineering questions, locate relevant information,
            understand procedures, and develop informed recommendations.
          </p>

          <p>
            This approach is especially important in industries such as
            aluminium production, where equipment reliability, maintenance
            decisions, engineering procedures, and operational knowledge can
            have a significant impact on plant performance.
          </p>

          <h2>A Platform That Will Continue to Evolve</h2>

          <p>
            Ask Michael AI is still growing.
          </p>

          <p>
            New capabilities, features, engineering knowledge, partner
            solutions, and improvements will continue to be added to the
            platform.
          </p>

          <p>
            The <strong>News & Announcements</strong> section will be used to
            share these developments, including:
          </p>

          <ul>
            <li>New Ask Michael AI features</li>
            <li>Platform updates</li>
            <li>Engineering knowledge improvements</li>
            <li>New capabilities and tools</li>
            <li>Partner announcements</li>
            <li>Industry-focused developments</li>
            <li>Important system updates</li>
            <li>Educational articles and insights</li>
          </ul>

          <p>
            This page will also become a place where we can share our thinking
            about the role of <strong>AI in industrial engineering and heavy
            metal operations</strong>.
          </p>

          <h2>The Future of Industrial Engineering Intelligence</h2>

          <p>
            Artificial intelligence is rapidly moving beyond general-purpose
            applications and into specialised industrial environments.
          </p>

          <p>
            For engineering teams, the opportunity is not simply to ask an AI
            a question.
          </p>

          <p>
            The greater opportunity is to create systems that can connect
            <strong>
              people, engineering knowledge, procedures, documentation, and
              operational information
            </strong>{" "}
            in a way that supports better decisions.
          </p>

          <p>
            That is the direction we are taking with Ask Michael AI.
          </p>

          <p>
            Our vision is to build an intelligent engineering platform that
            helps organisations preserve knowledge, access information faster,
            support engineering teams, and make better use of the technical
            expertise already within their businesses.
          </p>

          <p>
            <strong>Ask Michael AI is only the beginning.</strong>
          </p>

          <p>
            Follow our News & Announcements section for updates as the platform
            continues to develop.
          </p>

          <h3>Ask Michael AI</h3>

          <p>
            <strong>
              Industrial AI intelligence for heavy metal engineering
              knowledge, procedures, and operational decision support.
            </strong>
          </p>

          <p>
            Visit{" "}
            <strong>askmichaelai.org</strong> to learn more about the platform.
          </p>

        </div>

        {/* BOTTOM CTA */}
        <div className="mt-16 pt-8 border-t">
          <Link
            href="/news"
            className="text-blue-500 hover:text-blue-600 transition"
          >
            ← Back to News & Announcements
          </Link>
        </div>

      </article>
    </main>
  );
}