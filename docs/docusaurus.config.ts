import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Project Documentation',
  tagline: 'Documentation for your project',
  favicon: 'img/favicon.ico',

  url: 'https://your-project.dev',
  baseUrl: '/',

  organizationName: 'your-org',
  projectName: 'your-project',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '.',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/your-org/your-project/tree/main/docs/',
          include: ['ddd/**/*.md', 'ddd/**/*.mdx', 'bdd/**/*.md', 'bdd/**/*.mdx', 'plans/**/*.md', 'plans/**/*.mdx', 'roads/**/*.md', 'roads/**/*.mdx', 'changes/**/*.md', 'changes/**/*.mdx', 'agents/**/*.md', 'agents/**/*.mdx', 'adr/**/*.md', 'adr/**/*.mdx', 'nfr/**/*.md', 'nfr/**/*.mdx', 'index.md', 'index.mdx'],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    './plugins/bdd-data-plugin.js',
    './plugins/roadmap-data-plugin.js',
  ],

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
  },

  themeConfig: {
    // Social card image for link previews (create your own or remove this line)
    // image: 'img/social-card.png',
    navbar: {
      title: 'Project Docs',
      logo: {
        alt: 'Project Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'dddSidebar',
          position: 'left',
          label: 'DDD',
        },
        {
          type: 'docSidebar',
          sidebarId: 'planningSidebar',
          position: 'left',
          label: 'Planning',
        },
        {
          type: 'docSidebar',
          sidebarId: 'bddSidebar',
          position: 'left',
          label: 'BDD',
        },
        {
          type: 'docSidebar',
          sidebarId: 'agentsSidebar',
          position: 'left',
          label: 'Agents',
        },
        {
          type: 'docSidebar',
          sidebarId: 'roadsSidebar',
          position: 'left',
          label: 'Roadmap',
        },
        {
          type: 'docSidebar',
          sidebarId: 'adrSidebar',
          position: 'left',
          label: 'ADRs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'nfrSidebar',
          position: 'left',
          label: 'NFRs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'changesSidebar',
          position: 'left',
          label: 'Changes',
        },
        {
          href: 'https://github.com/your-org/your-project',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Domain Overview',
              to: '/docs/ddd/index',
            },
            {
              label: 'Architecture Decisions',
              to: '/docs/adr/index',
            },
            {
              label: 'Roadmap',
              to: '/docs/roads/index',
            },
            {
              label: 'Non-Functional Requirements',
              to: '/docs/nfr/index',
            },
          ],
        },
        {
          title: 'Development',
          items: [
            {
              label: 'BDD Testing',
              to: '/docs/bdd/index',
            },
            {
              label: 'Implementation Plans',
              to: '/docs/plans/index',
            },
            {
              label: 'Change History',
              to: '/docs/changes/index',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/your-org/your-project',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Your Project. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'javascript', 'json', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
