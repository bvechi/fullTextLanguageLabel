(function () {
  "use strict";

  async function applyFullTextLanguageLabels() {
    const pdfLinks = Array.from(
      document.querySelectorAll(
        "a.obj_galley_link.pdf"
      )
    );

    if (!pdfLinks.length) {
      return;
    }

    const articleRequests = new Map();

    function removeAccents(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    function getLanguageFromLabel(pdfLink) {
      const label = removeAccents(
        pdfLink.textContent
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

    function getArticleUrl(pdfUrl) {
      const result = String(pdfUrl).match(
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

    await Promise.all(
      pdfLinks.map(async function (pdfLink) {
        let language =
          getLanguageFromLabel(pdfLink);

        let source = "galley-label";

        if (!language) {
          const articleUrl =
            getArticleUrl(pdfLink.href);

          if (!articleUrl) {
            return;
          }

          if (!articleRequests.has(articleUrl)) {
            articleRequests.set(
              articleUrl,
              fetchArticleLanguage(articleUrl)
            );
          }

          language =
            await articleRequests.get(articleUrl);

          source = "article-metadata";
        }

        const listItem = pdfLink.closest("li");

        if (!listItem || !language) {
          return;
        }

        listItem.dataset.ojsFulltextLanguage =
          language;

        listItem.dataset.ojsLanguageSource =
          source;
      })
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
