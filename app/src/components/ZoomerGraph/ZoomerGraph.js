import React, { useEffect, useState } from 'react';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory';
import './ZoomerGraph.module.scss';

const ZoomerGraph = ({ prices }) => {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(10);
  const [plotData, setPlotData] = useState(prices || []);

  useEffect(() => {
    const newData = [];
    let min = prices[1] || 0;
    let max = prices[1] || 10;
    for (let i = 1; i < prices.length; i++) {
      const price = prices[i];
      if (price < min) {
        min = price;
      }
      if (price > max) {
        max = price;
      }
      newData.push({ x: i, y: price });
    }
    setMin(min);
    setMax(max);
    setPlotData(newData);
  }, [prices]);

  return (
    <article className="stock-graph">
      <VictoryChart
        domain={{ y: [min, max] }}
        domainPadding={{ x: [30, 30], y: [30, 30] }}
        theme={VictoryTheme.material}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={(tick) => `${parseFloat(tick).toFixed(2)}`}
        />
        <VictoryAxis tickFormat={(tick) => ''} />
        <VictoryLine
          style={{
            data: { stroke: '#3f51b5' },
            parent: { border: '1px solid #ccc' },
          }}
          data={plotData}
        />
      </VictoryChart>
    </article>
  );
};

export default ZoomerGraph;
