# Full Text Language Label

A generic plugin for Open Journal Systems (OJS) that displays the language beside full-text galley links.

## Compatibility

This release is intended for:

- OJS 3.3.0-x
- Initial target: OJS 3.3.0-22

## Features

- Adds a discreet language label beside full-text galley links.
- Works on issue pages, journal homepages and article pages.
- Supports PDF and generic file galleys.
- Recognizes common PDF, file, HTML, EPUB and XML classes used by OJS themes.
- Supports Portuguese, English and Spanish full texts.
- Translates labels according to the interface language.
- Does not modify OJS core files or theme templates.
- Uses only same-origin requests.
- Limits simultaneous article requests to four.
- Stores detected languages in browser session storage.

## Language detection

The plugin uses the following order:

1. If the galley label explicitly declares a language, such as `PDF (English)` or `HTML (Español)`, that language is used.
2. If the galley label does not declare a language, the plugin reads `citation_language` from the article landing page.
3. If `citation_language` is unavailable, `DC.Language` is used as a fallback.
4. If no supported language is found, no label is displayed.

Supported language codes:

- `pt`
- `en`
- `es`

Regional values such as `pt-BR`, `en-US` and `es-ES` are normalized to their primary language codes.

## Supported galley classes

The plugin recognizes these link classes:

```text
obj_galley_link pdf
obj_galley_link file
obj_galley_link html
obj_galley_link epub
obj_galley_link xml
```

Some OJS themes use a specific format class, such as `pdf` or `html`. Other themes use the generic `file` class for non-PDF galleys.

## Installation

### Through the OJS interface

1. Download the release package.
2. Sign in to OJS as an administrator.
3. Go to `Settings > Website > Plugins`.
4. Select `Upload A New Plugin`.
5. Upload the `.tar.gz` plugin package.
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

The plugin adds attributes to the list item containing each supported galley link:

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

## Performance

On listing pages, links without an explicitly declared language require a same-origin request to the corresponding article landing page.

The plugin:

- groups links belonging to the same article;
- requests each article page only once per execution;
- limits simultaneous requests to four;
- caches identified languages in browser session storage.

## Limitations

- The plugin depends on the standard OJS class `obj_galley_link`.
- Custom themes that replace the standard galley markup may require adjustments.
- Language detection is limited to Portuguese, English and Spanish.
- Incorrect galley labels or article metadata may produce an incorrect language indication.
- The OJS class `file` is generic and does not, by itself, identify the actual file format.
- A generic `file` galley is treated as full text when it appears among the publication's galley links.
- The plugin does not inspect the contents of downloaded files.

## License

This plugin is distributed under the GNU General Public License v3.0. See the `LICENSE` file.
