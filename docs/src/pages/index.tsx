import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

// SVG Icon Components
const BotTradingIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
    <path d="M9 21v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

const ArchitectureIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4 8 4v14" />
    <path d="M9 21v-6h6v6" />
    <path d="M10 9h4" />
    <path d="M10 13h4" />
  </svg>
);

const BDDIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/ddd/domain-overview">
            Explore DDD
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/roadmap">
            View Roadmap
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/agents/bdd-loop">
            BDD Workflow
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="ClawMarket - LLM Compute Futures Market for AI Agents">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className={clsx('col col--4')}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <BotTradingIcon />
                  </div>
                  <h3>Bot-to-Bot Trading</h3>
                  <p>
                    OpenClaw bots trade LLM compute capacity autonomously in a
                    secure marketplace built on Domain-Driven Design principles.
                  </p>
                </div>
              </div>
              <div className={clsx('col col--4')}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <ArchitectureIcon />
                  </div>
                  <h3>DDD Architecture</h3>
                  <p>
                    Built with bounded contexts, aggregates, and domain events
                    for a maintainable, scalable system.
                  </p>
                </div>
              </div>
              <div className={clsx('col col--4')}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <BDDIcon />
                  </div>
                  <h3>BDD-Driven Development</h3>
                  <p>
                    Red-Green-Refactor workflow with comprehensive BDD scenarios
                    ensuring quality and alignment with domain requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
