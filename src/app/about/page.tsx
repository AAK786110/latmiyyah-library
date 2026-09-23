import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Latmiyyah Vault, our approach to Arabic latmiyyah lyrics and English translations, attribution, corrections, and the purpose of the archive.",
  alternates: {
    canonical: "https://latmiyyahvault.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <section className="border-b border-border pb-7 pt-2 sm:pb-9 sm:pt-4">
        <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
          About the archive
        </p>

        <h1 className="font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] sm:text-5xl">
          About{" "}
          <span className="text-accent">
            Latmiyyah Vault
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
          A growing archive created to make latmiyyahs and nasheeds easier to
          find, read, understand and return to.
        </p>
      </section>

      {/* Intro */}
      <section className="grid gap-6 border-b border-border py-7 sm:grid-cols-[0.32fr_0.68fr] sm:gap-10 sm:py-9">
        <SectionNumber number="01" />

        <div>
          <h2 className="font-display text-2xl font-medium tracking-[-0.02em]">
            What is Latmiyyah Vault?
          </h2>

          <p className="mt-3 leading-7 text-muted">
            Latmiyyah Vault was created to make latmiyyahs and nasheeds easier
            to find, read, understand, and share. Each entry brings together
            the original Arabic lyrics, an English translation, information
            about the reciter and poet where available, and the original video
            or recitation.
          </p>
        </div>
      </section>

      {/* Translation */}
      <section className="grid gap-6 border-b border-border py-7 sm:grid-cols-[0.32fr_0.68fr] sm:gap-10 sm:py-9">
        <SectionNumber number="02" />

        <div>
          <h2 className="font-display text-2xl font-medium tracking-[-0.02em]">
            Our approach to translation
          </h2>

          <p className="mt-3 leading-7 text-muted">
            The aim is to preserve as much of the meaning, imagery, emotion,
            and context of the original Arabic as possible while still making
            the English understandable. Many latmiyyahs use Iraqi dialect,
            poetic expressions, religious references, and imagery that do not
            always have exact English equivalents.
          </p>

          <p className="mt-4 leading-7 text-muted">
            For that reason, translations are presented alongside the original
            Arabic rather than replacing it. Where necessary, explanatory
            wording may be used to communicate the intended meaning more
            clearly.
          </p>
        </div>
      </section>

      {/* Accuracy */}
      <section className="grid gap-6 border-b border-border py-7 sm:grid-cols-[0.32fr_0.68fr] sm:gap-10 sm:py-9">
        <SectionNumber number="03" />

        <div>
          <h2 className="font-display text-2xl font-medium tracking-[-0.02em]">
            Accuracy and corrections
          </h2>

          <p className="mt-3 leading-7 text-muted">
            Latmiyyah lyrics can sometimes differ between recordings,
            transcriptions, or dialectal interpretations. If you notice a
            mistake in a title, lyric, translation, attribution, or other
            information, you can suggest an edit directly from the relevant
            latmiyyah page.
          </p>

          <p className="mt-4 leading-7 text-muted">
            You can also use the{" "}
            <Link
              href="/feedback"
              className="font-medium text-accent hover:underline"
            >
              Feedback
            </Link>{" "}
            page for broader suggestions or reports.
          </p>
        </div>
      </section>

      {/* Attribution */}
      <section className="grid gap-6 border-b border-border py-7 sm:grid-cols-[0.32fr_0.68fr] sm:gap-10 sm:py-9">
        <SectionNumber number="04" />

        <div>
          <h2 className="font-display text-2xl font-medium tracking-[-0.02em]">
            Reciters and poets
          </h2>

          <p className="mt-3 leading-7 text-muted">
            Reciters and poets are credited wherever that information is
            available. Latmiyyah Vault is an independent archive and does not
            claim ownership of the original recitations, performances, or
            poetry.
          </p>
        </div>
      </section>

      {/* Growing archive */}
      <section className="grid gap-6 py-7 sm:grid-cols-[0.32fr_0.68fr] sm:gap-10 sm:py-9">
        <SectionNumber number="05" />

        <div>
          <h2 className="font-display text-2xl font-medium tracking-[-0.02em]">
            A growing archive
          </h2>

          <p className="mt-3 leading-7 text-muted">
            The Vault will continue to grow over time with more latmiyyahs,
            nasheeds, translations, reciters, poets, themes, and occasions.
            Community submissions and corrections help make the archive more
            useful and accurate.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accentFg transition-all hover:-translate-y-0.5"
            >
              Explore Latmiyyahs
              <ArrowIcon />
            </Link>

            <Link
              href="/submit"
              className="inline-flex items-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Add a Submission
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionNumber({
  number,
}: {
  number: string;
}) {
  return (
    <div>
      <span className="text-[0.65rem] font-medium tracking-[0.22em] text-accent">
        {number}
      </span>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}