<?php

/**
 * @file FullTextLanguageLabelPlugin.inc.php
 *
 * Distributed under the GNU GPL v3.
 *
 * @class FullTextLanguageLabelPlugin
 * @ingroup plugins_generic_fullTextLanguageLabel
 *
 * @brief Adds full-text language labels beside PDF galley links.
 */

import('lib.pkp.classes.plugins.GenericPlugin');

class FullTextLanguageLabelPlugin extends GenericPlugin
{
    /** @var bool Whether the frontend assets have been registered. */
    private $assetsRegistered = false;

    /**
     * @copydoc Plugin::register()
     */
    public function register(
        $category,
        $path,
        $mainContextId = null
    ) {
        $success = parent::register(
            $category,
            $path,
            $mainContextId
        );

        if (
            !Config::getVar('general', 'installed') ||
            defined('RUNNING_UPGRADE')
        ) {
            return true;
        }

        if ($success && $this->getEnabled()) {
            HookRegistry::register(
                'TemplateManager::display',
                [$this, 'registerFrontendAssets']
            );
        }

        return $success;
    }

    /**
     * Return the localized plugin name.
     *
     * @return string
     */
    public function getDisplayName()
    {
        return __(
            'plugins.generic.fullTextLanguageLabel.displayName'
        );
    }

    /**
     * Return the localized plugin description.
     *
     * @return string
     */
    public function getDescription()
    {
        return __(
            'plugins.generic.fullTextLanguageLabel.description'
        );
    }

    /**
     * Register the JavaScript and CSS on frontend pages.
     *
     * @param string $hookName
     * @param array $params
     *
     * @return bool
     */
    public function registerFrontendAssets(
        $hookName,
        $params
    ) {
        if ($this->assetsRegistered) {
            return false;
        }

        $this->assetsRegistered = true;

        $templateManager =& $params[0];
        $request = Application::get()->getRequest();

        $assetBaseUrl =
            $request->getBaseUrl() .
            '/' .
            $this->getPluginPath();

        $templateManager->addStyleSheet(
            'fullTextLanguageLabel',
            $assetBaseUrl .
            '/styles/fullTextLanguageLabel.css',
            [
                'contexts' => ['frontend'],
            ]
        );

        $templateManager->addJavaScript(
            'fullTextLanguageLabel',
            $assetBaseUrl .
            '/js/fullTextLanguageLabel.js',
            [
                'contexts' => ['frontend'],
            ]
        );

        $galleyLocales = $this->getGalleyLocales(
            $templateManager
        );

        if ($galleyLocales) {
            $templateManager->addJavaScript(
                'fullTextLanguageLabelGalleyLocales',
                'window.fullTextLanguageLabelGalleyLocales = ' .
                json_encode(
                    $galleyLocales,
                    JSON_HEX_TAG |
                    JSON_HEX_AMP |
                    JSON_HEX_APOS |
                    JSON_HEX_QUOT
                ) .
                ';',
                [
                    'inline' => true,
                    'contexts' => ['frontend'],
                ]
            );
        }

        return false;
    }

    /**
     * Map the galleys shown on the current page to their locales.
     *
     * Keys follow the galley URL path:
     * "{articleBestId}/{galleyBestId}".
     *
     * @param TemplateManager $templateManager
     *
     * @return array
     */
    private function getGalleyLocales($templateManager)
    {
        $galleyLocales = [];

        // Article landing page
        $article = $templateManager->getTemplateVars(
            'article'
        );
        $primaryGalleys = $templateManager->getTemplateVars(
            'primaryGalleys'
        );

        if ($article && is_array($primaryGalleys)) {
            foreach ($primaryGalleys as $galley) {
                $this->addGalleyLocale(
                    $galleyLocales,
                    $article,
                    $galley
                );
            }
        }

        // Issue table of contents
        $publishedSubmissions =
            $templateManager->getTemplateVars(
                'publishedSubmissions'
            );

        if (is_array($publishedSubmissions)) {
            foreach ($publishedSubmissions as $section) {
                foreach ($section['articles'] as $submission) {
                    foreach ($submission->getGalleys() as $galley) {
                        $this->addGalleyLocale(
                            $galleyLocales,
                            $submission,
                            $galley
                        );
                    }
                }
            }
        }

        return $galleyLocales;
    }

    /**
     * Add one galley locale to the map.
     *
     * @param array $galleyLocales
     * @param Submission $submission
     * @param ArticleGalley $galley
     */
    private function addGalleyLocale(
        &$galleyLocales,
        $submission,
        $galley
    ) {
        if (!$galley->getLocale()) {
            return;
        }

        $key =
            $submission->getBestId() .
            '/' .
            $galley->getBestGalleyId();

        $galleyLocales[$key] = $galley->getLocale();
    }
}
