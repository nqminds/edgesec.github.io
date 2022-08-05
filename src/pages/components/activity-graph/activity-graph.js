import React, {useRef, useState, useEffect} from "react";
import clsx from "clsx";
import styles from "../../styles.module.css";

import useDimensions from "react-cool-dimensions";
import {ForceGraph3D} from "react-force-graph";
import activityData from "./activity-data";

const grey = "#FAFAFA";
const cameraDistance = 750;

/**
 * Device Types graph
 *
 * @returns {object} - Types page
 */
function ActivityGraph() {
  const graphRef = useRef();
  const [counter, setCounter] = useState(0);
  const [angle, setAngle] = useState(0);
  const [graphData, setGraphData] = useState({nodes: [], links: []});
  const [size, setSize] = useState({width: 100, height: 100});
  const {observe} = useDimensions({onResize: ({width, height}) => {
    if (size.width !== width || size.height !== height) {
      setSize({height, width});
    }
  }});

  // Data loading
  useEffect(() => {
    setGraphData(activityData);
  }, []);

  // Particle emission
  useEffect(() => {
    if (!graphRef.current || !graphRef.current.cameraPosition) return () => {};

    const timer = setInterval(() => {
      graphRef.current.cameraPosition({
        x: cameraDistance * Math.sin(angle),
        z: cameraDistance * Math.cos(angle),
      });
      setAngle(angle + Math.PI / 300);

      setCounter(((counter + 1) % (activityData.nodes && activityData.nodes.rows.length)) || 0);
      // if (counter % 2) {
      //   const {ip_src, ip_dst} = activityData.nodes && activityData.nodes.rows[counter] || {};
      //   const link = graphData.links.find(({source, target}) => source.id === ip_src && target.id === ip_dst);
      //   graphRef.current.emitParticle(link);
      // }
    }, 50);

    return () => clearInterval(timer);
  });

  return (
    <div className={clsx(styles.bannerBox)}>
      <div className={clsx(styles.bannerContainer)} ref={observe}>
        <ForceGraph3D
          backgroundColor="rgba(0,0,0,0)" // transparent
          width={size.width} height={size.height}
          ref={graphRef}
          graphData={graphData}
          nodeOpacity={0.9}
          linkDirectionalParticleColor={() => grey}
          linkDirectionalParticleWidth={5}
          linkOpacity={0.5}
          enableNodeDrag={false}
          enableNavigationControls={false}
          showNavInfo={false}
        />
      </div>
    </div>
  );
}

export default ActivityGraph;

