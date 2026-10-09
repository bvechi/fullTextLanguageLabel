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

        return false;
    }
}
