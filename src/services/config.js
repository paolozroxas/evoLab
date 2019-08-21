module.exports = {
  projectName: 'genesis',
  epochCount: 10000,
  epochLogInterval: 10,
  dna: {
    polygonCount: 75,
    vertexCount: 3,
    mutationProbability: 0.025,
    polygonAlpha: 0.35
  },
  genePool: {
    populationSize: 10,
    matingProbability: 0.3,
    immigrantsPerEpoch: 0.2,
    maxAge: 10,
  }
};
