# Full Text Language Label

A generic plugin for Open Journal Systems (OJS) that displays the language of the full text beside PDF galley links.

## Compatibility

This release is intended for:

- OJS 3.3.0-x
- Initial target: OJS 3.3.0-22

## Features

- Adds a discreet language label beside PDF galley links.
- Works on issue pages, journal homepages and article pages.
- Supports Portuguese, English and Spanish full texts.
- Translates labels according to the interface language.
- Does not modify OJS core files or theme templates.
- Uses only same-origin requests.
- Stores detected languages in browser session storage.

## Language detection

The plugin uses the following order:

1. If the galley label explicitly declares a language, such as `PDF (English)`, that language is used.
2. If the galley label is only `PDF`, the plugin reads `citation_language` from the article landing page.
3. If `citation_language` is unavailable, `DC.Language` is used as a fallback.
4. If no supported language is found, no label is displayed.

Supported language codes:

- `pt`
- `en`
- `es`

Regional values such as `pt-BR`, `en-US` and `es-ES` are normalized to their primary language codes.

## Installation

### Through the OJS interface

1. Download the release package.
2. Sign in to OJS as an administrator.
3. Go to `Settings > Website > Plugins`.
4. Select `Upload A New Plugin`.
5. Upload the plugin package.
6. Enable **Full Text Language Label** in the Generic Plugins list.

### Manual installation

Extract the plugin into:

```text
plugins/generic/fullTextLanguageLabel/
```

The resulting structure must include:

```text
plugins/generic/fullTextLanguageLabel/index.php
plugins/generic/fullTextLanguageLabel/version.xml
```

Then enable the plugin in the OJS plugin interface.

## Generated attributes

The plugin adds attributes to the list item containing each PDF link:

```html
<li
  data-ojs-fulltext-language="pt"
  data-ojs-language-source="article-metadata"
>
```

The language source may be:

- `galley-label`
- `article-metadata`

These attributes do not alter publication metadata.

## Interface labels

### Portuguese interface

- Texto em português
- Texto em inglês
- Texto em espanhol

### English interface

- Full text in Portuguese
- Full text in English
- Full text in Spanish

### Spanish interface

- Texto en portugués
- Texto en inglés
- Texto en español

## Limitations

- The plugin depends on the standard OJS classes `obj_galley_link`, `pdf` and `galleys_links`.
- Custom themes that replace these classes may require adjustments.
- Language detection is limited to Portuguese, English and Spanish.
- A PDF with an incorrect galley label or incorrect article metadata may receive an incorrect language indication.
- On listing pages, PDFs without an explicit language require a same-origin request to each article landing page. Results are cached for the duration of the browser session.

## License

This plugin is distributed under the GNU General Public License v3.0. See the `LICENSE` file.
