const _ = require('lodash');

const DNA = require('./dna');
const { pixelDiff } = require('./imageTools')
const config = require('./config');

class GenePool {
  constructor(imageWidth, imageHeight, sourcePixels) {
    // config vars
    this.genePoolPopulationSize = config.genePool.populationSize;
    this.genePoolMatingProbability = config.genePool.matingProbability;
    this.genePoolMaxAge = config.genePool.maxAge;
    this.genePoolImmigrantsPerEpoch = config.genePool.immigrantsPerEpoch;

    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.sourcePixels = sourcePixels;

    this.dnas = _.times(
      this.genePoolPopulationSize,
      () => new DNA(imageWidth, imageHeight).populate()
    );
  }

  advanceEpoch = (epochIdx) => {
    // change genetic code
    this.mutateAll();
    // this.incrementAges();
    // this.reapTheElderly();
    this.initiateMatingSeason();
    // this.introduceImmigrants();
    
    // post-render methods
    this.renderDnas();
    this.calculateDiffs();
    this.sortDnasByDiff();
    this.cullAll();
  
    if (epochIdx % config.epochLogInterval === 0) {
      console.log(`epoch: ${epochIdx}, minDiff: ${this.dnas[0].diffScore}`)
    }
  
  }

  renderDnas () {
    this.dnas.forEach((dna) => {
      dna.renderToCanvas();
    })
  }

  calculateDiffs () {
    this.dnas.forEach((dna) => {
      dna.diffScore = pixelDiff(dna.getPixelData(), this.sourcePixels);
    });
  }

  sortDnasByDiff () {
    this.dnas.sort((dna1, dna2) => {
      return dna1.diffScore - dna2.diffScore;
    })
  }

  mate (dna1, dna2) {
    var child = new DNA(this.imageWidth, this.imageHeight);
    for (var i = 0; i < dna1.polygons.length; i++) {
      var p = Math.random();
      if (p < 0.5) {
        child.polygons.push(_.cloneDeep(dna1.polygons[i]));
      } else {
        child.polygons.push(_.cloneDeep(dna2.polygons[i]));
      }
    }
    return child;
  }

  initiateMatingSeason () {
    const children = [];
    for (var i = 0; i < this.dnas.length; i++) {
      for (var j = 0; j < this.dnas.length; j++) {
        if (Math.random() < this.genePoolMatingProbability) {
          children.push(this.mate(this.dnas[i], this.dnas[j]))
        }
      }
    }
    this.dnas.push(...children);
  }

  incrementAges () {
    this.dnas.forEach((dna) => {
      dna.age++;
    })
  }

  reapTheElderly() {
    this.dnas = this.dnas.filter((dna) => {
      return dna.age <= this.genePoolMaxAge;
    });
  }

  cullAll () {
    this.dnas = this.dnas.slice(0, this.genePoolPopulationSize);
  }

  mutateAll () {
    this.dnas.forEach(dna => dna.mutate());
  }

  introduceImmigrants () {
    const numberOfImmigrants = Math.floor(this.genePoolPopulationSize * this.genePoolImmigrantsPerEpoch);
    this.dnas.push(..._.times(numberOfImmigrants, () => new DNA(this.imageWidth, this.imageHeight).populate()));
  }

};

module.exports = GenePool;