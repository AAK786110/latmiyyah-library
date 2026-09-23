import { normalize } from "./normalize";
import { expandQuery } from "./aliases";
import {
  transliterationTokenKey,
} from "./transliteration";
import type { Latmiyyah } from "../types";

function levenshtein(
  a: string,
  b: string
): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from(
    { length: m + 1 },
    (_, i) => [
      i,
      ...Array(n).fill(0),
    ]
  );

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 +
            Math.min(
              dp[i - 1][j - 1],
              dp[i - 1][j],
              dp[i][j - 1]
            );
    }
  }

  return dp[m][n];
}

function typoThreshold(
  a: string,
  b: string
): number {
  const length = Math.min(
    a.length,
    b.length
  );

  if (length <= 3) return 0;
  if (length <= 6) return 1;
  if (length <= 10) return 2;

  return 3;
}

/**
 * Scores one query token against one field token.
 *
 * Strongest:
 * exact > sensible prefix > typo > transliteration
 */
function tokenMatchScore(
  queryToken: string,
  fieldToken: string
): number {
  if (
    queryToken === fieldToken
  ) {
    return 10;
  }

  /**
   * Prefix matching for incomplete words.
   *
   * Example:
   * husa -> husayn
   * tifl -> tifli
   *
   * This is much safer than matching
   * fragments anywhere inside a word.
   */
  if (
    queryToken.length >= 4 &&
    fieldToken.length >= 4 &&
    (
      fieldToken.startsWith(
        queryToken
      ) ||
      queryToken.startsWith(
        fieldToken
      )
    )
  ) {
    return 8;
  }

  /**
   * Ordinary typo matching.
   */
  const threshold =
    typoThreshold(
      queryToken,
      fieldToken
    );

  if (threshold > 0) {
    const distance =
      levenshtein(
        queryToken,
        fieldToken
      );

    if (
      distance <= threshold
    ) {
      return distance === 1
        ? 7
        : 5;
    }
  }

  /**
   * Arabic transliteration fallback.
   *
   * Only use this on reasonably
   * substantial words, otherwise
   * short fragments become too broad.
   */
  if (
    queryToken.length < 4 ||
    fieldToken.length < 4
  ) {
    return 0;
  }

  const queryPhonetic =
    transliterationTokenKey(
      queryToken
    );

  const fieldPhonetic =
    transliterationTokenKey(
      fieldToken
    );

  if (
    queryPhonetic.length < 3 ||
    fieldPhonetic.length < 3
  ) {
    return 0;
  }

  if (
    queryPhonetic ===
    fieldPhonetic
  ) {
    return 7;
  }

  /**
   * One typo after transliteration
   * normalization, but only for
   * substantial phonetic keys.
   */
  if (
    queryPhonetic.length >= 4 &&
    fieldPhonetic.length >= 4 &&
    levenshtein(
      queryPhonetic,
      fieldPhonetic
    ) === 1
  ) {
    return 4;
  }

  return 0;
}

function bestTokenScore(
  queryToken: string,
  fieldValue:
    | string
    | null
    | undefined
): number {
  if (!fieldValue) return 0;

  const fieldTokens =
    normalize(fieldValue)
      .split(" ")
      .filter(Boolean);

  let best = 0;

  for (const fieldToken of fieldTokens) {
    best = Math.max(
      best,
      tokenMatchScore(
        queryToken,
        fieldToken
      )
    );
  }

  return best;
}

function searchableFields(
  item: Latmiyyah
) {
  return [
    {
      value: item.title,
      weight: 4,
    },
    {
      value: item.arabic_title,
      weight: 4,
    },
    {
      value: item.reciter,
      weight: 2.5,
    },
    {
      value: item.poet,
      weight: 1.5,
    },
    ...(item.tags || []).map(
      (tag) => ({
        value: tag.name,
        weight: 3,
      })
    ),
  ];
}

function scoreQueryToken(
  item: Latmiyyah,
  queryToken: string
): number {
  let best = 0;

  for (
    const field
    of searchableFields(item)
  ) {
    const rawScore =
      bestTokenScore(
        queryToken,
        field.value
      );

    best = Math.max(
      best,
      rawScore * field.weight
    );
  }

  return best;
}

export function rankLatmiyyahs(
  items: Latmiyyah[],
  query: string
): Latmiyyah[] {
  const rawQuery = query.trim();

  if (!rawQuery) {
    return items;
  }

  const normalizedQuery =
    normalize(rawQuery);

  const {
    canonicalTokens,
    expandedTerms,
  } = expandQuery(rawQuery);

  const rawTokens =
    normalizedQuery
      .split(" ")
      .filter(Boolean);

  /**
   * Keep normal words, but ignore
   * ultra-short phonetic fragments
   * that would create noisy results.
   */
  const meaningfulTokens =
    rawTokens.filter((token) => {
      if (token.length < 3) {
        return false;
      }

      const phonetic =
        transliterationTokenKey(
          token
        );

      return (
        token.length >= 4 ||
        phonetic.length >= 3
      );
    });

  const scored = items.map(
    (item) => {
      let score = 0;
      let matchedTokens = 0;

      for (
        const queryToken
        of meaningfulTokens
      ) {
        const tokenScore =
          scoreQueryToken(
            item,
            queryToken
          );

        if (tokenScore > 0) {
          matchedTokens += 1;
          score += tokenScore;
        }
      }

      /**
       * MULTI-WORD RULE
       *
       * If someone types multiple
       * meaningful words, all of them
       * should match somewhere on the
       * same latmiyyah.
       *
       * This prevents random results
       * from appearing just because
       * one loose token matched.
       */
      if (
        meaningfulTokens.length >= 2 &&
        matchedTokens <
          meaningfulTokens.length
      ) {
        score = 0;
      }

      const metadata =
        normalize(
          [
            item.title,
            item.arabic_title,
            item.reciter,
            item.poet,
            ...(item.tags || []).map(
              (tag) => tag.name
            ),
          ]
            .filter(Boolean)
            .join(" ")
        );

      /**
       * Strong literal phrase bonus.
       */
      if (
        metadata.includes(
          normalizedQuery
        )
      ) {
        score += 50;
      }

      /**
       * Alias/concept fallback.
       *
       * Keeps:
       * bibi zahra -> Sayyida Fatima
       * etc.
       */
      if (
        canonicalTokens.length > 0
      ) {
        for (
          const canonical
          of canonicalTokens
        ) {
          void canonical;

          for (
            const field
            of searchableFields(item)
          ) {
            if (!field.value) {
              continue;
            }

            const normalizedField =
              normalize(
                field.value
              );

            for (
              const term
              of expandedTerms
            ) {
              if (
                normalizedField ===
                  term ||
                normalizedField.includes(
                  term
                )
              ) {
                score +=
                  15 *
                  field.weight;
              }
            }
          }
        }
      }

      return {
        item,
        score,
      };
    }
  );

  return scored
    .filter(
      ({ score }) => score > 0
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.item.title.localeCompare(
          b.item.title
        )
    )
    .map(({ item }) => item);
}

export function buildIlikeTerms(
  query: string
): string[] {
  const { expandedTerms } =
    expandQuery(query);

  return expandedTerms
    .filter(
      (term) =>
        term.length >= 2
    )
    .slice(0, 20);
}