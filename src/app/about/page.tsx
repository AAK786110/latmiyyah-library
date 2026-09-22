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
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          About Latmiyyah Vault
        </h1>

        <p className="mt-3 text-muted">
          A growing archive of latmiyyahs and qasidas with original Arabic
          lyrics, English translations, reciter information, and easy ways to
          discover related works.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold">
            What is Latmiyyah Vault?
          </h2>

          <p className="mt-3 leading-7 text-muted">
            Latmiyyah Vault was created to make latmiyyahs and qasidas easier
            to find, read, understand, and share. Each entry brings together
            the original Arabic lyrics, an English translation, information
            about the reciter and poet where available, and the original video
            or recitation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            Our approach to translation
          </h2>

          <p className="mt-3 leading-7 text-muted">
            The aim is to preserve as much of the meaning, imagery, emotion,
            and context of the original Arabic as possible while still making
            the English understandable. Many latmiyyahs use Iraqi dialect,
            poetic expressions, religious references, and imagery that do not
            always have exact English equivalents.
          </p>

          <p className="mt-3 leading-7 text-muted">
            For that reason, translations are presented alongside the original
            Arabic rather than replacing it. Where necessary, explanatory
            wording may be used to communicate the intended meaning more
            clearly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            Accuracy and corrections
          </h2>

          <p className="mt-3 leading-7 text-muted">
            Latmiyyah lyrics can sometimes differ between recordings,
            transcriptions, or dialectal interpretations. If you notice a
            mistake in a title, lyric, translation, attribution, or other
            information, you can suggest an edit directly from the relevant
            latmiyyah page.
          </p>

          <p className="mt-3 leading-7 text-muted">
            You can also use the{" "}
            <Link
              href="/feedback"
              className="font-medium text-accent hover:underline"
            >
              Feedback
            </Link>{" "}
            page for broader suggestions or reports.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            Reciters and poets
          </h2>

          <p className="mt-3 leading-7 text-muted">
            Reciters and poets are credited wherever that information is
            available. Latmiyyah Vault is an independent archive and does not
            claim ownership of the original recitations, performances, or
            poetry.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            A growing archive
          </h2>

          <p className="mt-3 leading-7 text-muted">
            The vault will continue to grow over time with more latmiyyahs,
            qasidas, translations, reciters, poets, themes, and occasions.
            Community submissions and corrections help make the archive more
            useful and accurate.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accentFg hover:opacity-90"
            >
              Explore Latmiyyahs
            </Link>

            <Link
              href="/submit"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
            >
              Add a Submission
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}