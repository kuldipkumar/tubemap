import Papa from 'papaparse';

export const convertCSVToJson = (csvText) => {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return result.data;
};

export const processDataForVisualization = (jsonData) => {
  const lines = jsonData.filter(row => row['Line ID'] && row['Line Name']);
  const stations = jsonData.filter(row => row['Station ID'] && row['Station Name']);
  const benefits = jsonData.filter(row => row['Benefit ID'] && row['Station ID']);

  return {
    lines: lines.map(line => ({
      id: line['Line ID'],
      name: line['Line Name'],
      color: line['Line Color']
    })),
    stations: stations.map(station => ({
      id: station['Station ID'],
      name: station['Station Name'],
      lineId: station['Line ID'],
      x: parseInt(station['X']),
      y: parseInt(station['Y']),
      size: station['Size'],
      isMilestone: station['Milestone'] === 'TRUE',
      benefits: benefits
        .filter(benefit => benefit['Station ID'] === station['Station ID'])
        .map(benefit => ({
          id: benefit['Benefit ID'],
          name: benefit['Benefit Name'],
          impact: parseInt(benefit['Impact'])
        }))
    }))
  };
};