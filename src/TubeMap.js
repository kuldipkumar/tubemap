import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ForceGraph2D } from 'react-force-graph';
import { convertCSVToJson, processDataForVisualization } from './dataProcessingFunctions';

const TubeMap = () => {
  const [data, setData] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    // In a real application, replace this with an actual CSV file fetch
    const csvData = `Line ID,Line Name,Line Color
app-mod,Application Modernization,#FF6B6B
platform,Platform Capabilities,#4ECDC4
data,Data Management,#45B7D1

Station ID,Station Name,Line ID,X,Y,Size,Milestone
ms,Microservices,app-mod,100,100,large,TRUE
12f,12 Factor App,app-mod,200,100,medium,FALSE
k8s,Kubernetes,platform,150,200,large,TRUE
sm,Service Mesh,platform,250,200,medium,FALSE
kafka,Kafka,data,300,300,large,TRUE

Benefit ID,Station ID,Benefit Name,Impact
b1,ms,Improved scalability,80
b2,ms,Better fault isolation,60
b3,12f,Enhanced maintainability,70
b4,k8s,Efficient orchestration,90
b5,k8s,Auto-scaling,75
b6,sm,Enhanced communication,65
b7,kafka,Real-time data processing,85
b8,kafka,Decoupled architecture,70`;

    const jsonData = convertCSVToJson(csvData);
    const processedData = processDataForVisualization(jsonData);
    setData(processedData);
  }, []);

  useEffect(() => {
    if (data && svgRef.current) {
      renderTubeMap();
    }
  }, [data]);

  const renderTubeMap = () => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = 800;
    const height = 600;

    svg.attr('width', width).attr('height', height);

    // Draw lines
    data.lines.forEach(line => {
      const lineStations = data.stations.filter(station => station.lineId === line.id);
      const lineGenerator = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveBasis);

      svg.append('path')
        .datum(lineStations)
        .attr('d', lineGenerator)
        .attr('stroke', line.color)
        .attr('stroke-width', 10)
        .attr('fill', 'none');
    });

    // Draw stations
    data.stations.forEach(station => {
      const g = svg.append('g')
        .attr('transform', `translate(${station.x}, ${station.y})`)
        .on('click', () => setSelectedStation(station));

      g.append('circle')
        .attr('r', station.size === 'large' ? 15 : 10)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .text(station.name);

      if (station.isMilestone) {
        g.append('circle')
          .attr('r', station.size === 'large' ? 18 : 13)
          .attr('fill', 'none')
          .attr('stroke', 'gold')
          .attr('stroke-width', 2);
      }
    });
  };

  const renderBenefitsBubbles = () => {
    if (!selectedStation) return null;

    const bubbleData = {
      nodes: selectedStation.benefits.map(benefit => ({
        id: benefit.id,
        name: benefit.name,
        value: benefit.impact
      }))
    };

    return (
      <div style={{ width: '400px', height: '400px' }}>
        <h3>{selectedStation.name} Benefits</h3>
        <ForceGraph2D
          graphData={bubbleData}
          nodeLabel="name"
          nodeVal="value"
          nodeColor={() => d3.schemeCategory10[Math.floor(Math.random() * 10)]}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 2 }}>
        <h2>Platform Evolution Tube Map</h2>
        <svg ref={svgRef}></svg>
      </div>
      <div style={{ flex: 1 }}>
        {renderBenefitsBubbles()}
      </div>
    </div>
  );
};

export default TubeMap;