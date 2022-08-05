import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import ActivityGraph from "../components/activity-graph/activity-graph";
import BrowserOnly from "@docusaurus/BrowserOnly";

const features = [
  {
    title: <>Network Control</>,
    imageUrl: "img/network.svg",
    description: (
      <>
        Wireless network segmentation and fine gained control of connected IoT devices.
      </>
    ),
  },
  {
    title: <>Network Monitor</>,
    imageUrl: "img/monitor.svg",
    description: (
      <>
        Traffic monitoring and detection of compromised IoT devices.
      </>
    ),
  },
  {
    title: <>Secure Storage</>,
    imageUrl: "img/vault.svg",
    description: (
      <>
        Implementation of a secure key/value store on top of hardware secure storage.
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
Feature.propTypes = {
  description: PropTypes.node.isRequired,
  imageUrl: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
};

/**
 * Docusaurus example home page
 *
 * @returns {React.Element} Home page
 */
function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`Homepage ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className={styles.titleContainer}>
          <div className={styles.shadeBox}>
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className={styles.buttons}>
              <Link
                className={clsx(
                "button button--outline button--secondary button--lg",
                styles.getStarted,
                styles.buttonText,
              )}
                to={useBaseUrl("docs/")}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <BrowserOnly>
          {() => <ActivityGraph />}
        </BrowserOnly>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
