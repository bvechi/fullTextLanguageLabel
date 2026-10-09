(function () {
  "use strict";

  const MAX_CONCURRENT_REQUESTS = 4;

  async function applyFullTextLanguageLabels() {
    const fullTextLinks = Array.from(
      document.querySelectorAll(
        [
          "a.obj_galley_link.pdf",
          "a.obj_galley_link.file"
        ].join(", ")
      )
    );

    if (!fullTextLinks.length) {
      return;
    }

    const articles = new Map();

    function removeAccents(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    function getLanguageFromLabel(link) {
      const label = removeAccents(
        link.textContent
      ).toLowerCase();

      if (
        label.includes("english") ||
        label.includes("ingles")
      ) {
        return "en";
      }

      if (
        label.includes("spanish") ||
        label.includes("espanol")
      ) {
        return "es";
      }

      if (
        label.includes("portuguese") ||
        label.includes("portugues")
      ) {
        return "pt";
      }

      return "";
    }

    function getArticleUrl(galleyUrl) {
      const result = String(galleyUrl).match(
        /^(.*\/article\/view\/\d+)(?:\/.*)?$/
      );

      return result ? result[1] : "";
    }

    function normalizeLanguage(value) {
      const language = String(value || "")
        .trim()
        .toLowerCase()
        .split(/[-_]/)[0];

      return ["pt", "en", "es"].includes(language)
        ? language
        : "";
    }

    function getCachedLanguage(key) {
      try {
        return sessionStorage.getItem(key) || "";
      } catch (error) {
        return "";
      }
    }

    function cacheLanguage(key, language) {
      try {
        sessionStorage.setItem(key, language);
      } catch (error) {
        /*
         * The plugin works without browser storage.
         */
      }
    }

    async function fetchArticleLanguage(articleUrl) {
      const cacheKey =
        "ojs-fulltext-language:v1:" + articleUrl;

      const cachedLanguage =
        getCachedLanguage(cacheKey);

      if (cachedLanguage) {
        return cachedLanguage;
      }

      try {
        const response = await fetch(articleUrl, {
          credentials: "same-origin"
        });

        if (!response.ok) {
          return "";
        }

        const html = await response.text();

        const articleDocument =
          new DOMParser().parseFromString(
            html,
            "text/html"
          );

        const metadataValue =
          articleDocument.querySelector(
            'meta[name="citation_language"]'
          )?.content ||
          articleDocument.querySelector(
            'meta[name="DC.Language" i]'
          )?.content ||
          "";

        const language =
          normalizeLanguage(metadataValue);

        if (language) {
          cacheLanguage(cacheKey, language);
        }

        return language;
      } catch (error) {
        return "";
      }
    }

    function applyLanguage(
      link,
      language,
      source
    ) {
      const listItem = link.closest("li");

      if (!listItem || !language) {
        return;
      }

      listItem.dataset.ojsFulltextLanguage =
        language;

      listItem.dataset.ojsLanguageSource =
        source;
    }

    /*
     * Resolve labels that explicitly declare a language
     * and group the remaining links by article.
     */
    fullTextLinks.forEach(function (link) {
      const explicitLanguage =
        getLanguageFromLabel(link);

      if (explicitLanguage) {
        applyLanguage(
          link,
          explicitLanguage,
          "galley-label"
        );

        return;
      }

      const articleUrl = getArticleUrl(link.href);

      if (!articleUrl) {
        return;
      }

      if (!articles.has(articleUrl)) {
        articles.set(articleUrl, []);
      }

      articles.get(articleUrl).push(link);
    });

    const pendingArticles = Array.from(
      articles.entries()
    );

    let nextArticleIndex = 0;

    /*
     * Limit simultaneous requests so large issues do not
     * overload the journal server.
     */
    async function worker() {
      while (
        nextArticleIndex < pendingArticles.length
      ) {
        const currentIndex = nextArticleIndex;
        nextArticleIndex += 1;

        const entry =
          pendingArticles[currentIndex];

        const articleUrl = entry[0];
        const links = entry[1];

        const language =
          await fetchArticleLanguage(articleUrl);

        if (!language) {
          continue;
        }

        links.forEach(function (link) {
          applyLanguage(
            link,
            language,
            "article-metadata"
          );
        });
      }
    }

    const workerCount = Math.min(
      MAX_CONCURRENT_REQUESTS,
      pendingArticles.length
    );

    await Promise.all(
      Array.from(
        { length: workerCount },
        function () {
          return worker();
        }
      )
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      applyFullTextLanguageLabels,
      { once: true }
    );
  } else {
    applyFullTextLanguageLabels();
  }
})();
