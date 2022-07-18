import React from "react";
import Layout from "@theme/Layout";

/**
 * An iframe showing the static docusaraurus docs.
 *
 * @returns {React.ReactElement} The iframe to render.
 */
function DoxygenIframe() {
  return (
    <Layout
      title={"C API (Doxygen)"}
      description="Doxygen generated documentation for the EDGESec C API"
    >
      <iframe src="https://nqminds.github.io/edgesec" width="100%" style={{height: "90vh"}} />
    </Layout>
  );
}

export default DoxygenIframe;
