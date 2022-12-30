import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import BrowserOnly from "@docusaurus/BrowserOnly";

const features = [
  {
    title: <>Network Control</>,
    imageUrl: "img/network.png",
    description: (
      <>
        Wireless network segmentation and fine gained control of connected IoT devices.
      </>
    ),
  },
  {
    title: <>Network Monitor</>,
    imageUrl: "img/monitor.png",
    description: (
      <>
        Traffic monitoring and detection of compromised IoT devices.
      </>
    ),
  },
  {
    title: <>Secure Storage</>,
    imageUrl: "img/vault.png",
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
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        {imgUrl && (
          <div className="text--center">
            <img className={styles.featureImg} src={imgUrl} alt={title} />
          </div>
        )}
        <div className="text--center padding-horiz--md">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
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
          <h1 className="hero__title">{siteConfig.title}</h1>
          <h2 className="hero__subtitle">{siteConfig.tagline}</h2>
        </div>
        <BrowserOnly fallback={<div>Loading...</div>}>
          {() => {
            const ActivityGraph = require("../components/activity-graph/activity-graph").default;
            return <ActivityGraph />;
          }}
        </BrowserOnly>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className={styles.row}>
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
