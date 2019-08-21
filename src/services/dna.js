const gaussian = require('gaussian');
const _ = require('lodash');

var config = require('./config.js');

class DNA {
  constructor(imageWidth, imageHeight) {
    // config vars
    this.dnaPolygonCount = config.dna.polygonCount;
    this.dnaVertexCount = config.dna.vertexCount;
    this.dnaMutationProbability = config.dna.mutationProbability;
    this.dnaPolygonAlpha = config.dna.polygonAlpha;
    this.projectName = config.projectName;

    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight

    // mutable vars
    this.polygons = [];
    this.canvas = null;
    this.diffScore = null;
    this.age = 0;

  }

  populate() {
    this.polygons = _.times(this.dnaPolygonCount, () => ({
      coordinates: _.times(this.dnaVertexCount, this.createVertex.bind(this)),
      color: this.createColor(),
    }));
    
    // so that we can create a new populated DNA via `new DNA().populate()`
    return this;
  }
  
  mutate() {
    this.polygons.forEach((polygon) => {
      polygon.coordinates.forEach((coordinate) => {
        this.mutateCoordinate(coordinate);
      });

      this.mutateColor(polygon.color);

      // let's leave this out until there's a good reason for it:
      // this.mutateNumberOfVertices(polygon);
    });
  }

  createVertex() {
    return { x: _.random(this.imageWidth), y: _.random(this.imageHeight) };
  }

  createColor() {
    return {
      r: _.random(255),
      g: _.random(255),
      b: _.random(255),
    };
  }

  mutateValue (original, min, max, isInteger = false) {
    // should mutation occur?
    const p = Math.random();
    let result = original;
    if (p <= this.dnaMutationProbability) {
      // choose perturbation from a normal dist and apply to original value
      
      // we want most mutations to fall between min and max
      // 98% of results are within 2 standard deviations of the mean
      // so max - min represents a distance of 4 SDs
      const variance =  Math.pow((max - min) / 4, 2)
      var perturbation = gaussian(0, variance).ppf(Math.random());
      result += perturbation;
    }

    // check if result is invalid, try again if so
    if (result < min || result > max) {
      return this.mutateValue(original, min, max, isInteger);
    }

    // convert to integer if necessary
    if (isInteger) {
      result = Math.floor(result);
    }

    return result;
  }

  mutateCoordinate(coordinate) {
    coordinate.x = this.mutateValue(coordinate.x, 0, this.imageWidth);
    coordinate.y = this.mutateValue(coordinate.y, 0, this.imageHeight);
  }

  mutateColor(color) {
    color.r = this.mutateValue(color.r, 0, 255, true);
    color.g = this.mutateValue(color.g, 0, 255, true);
    color.b = this.mutateValue(color.b, 0, 255, true);
  }

  mutateNumberOfVertices (polygon) {
    var pMutate = Math.random();
    if (pMutate < this.dnaMutationProbability) {
      var pAdd = Math.random();
      if (pAdd >= 0.5) {
        this.addVertex(polygon);
      } else {
        this.removeVertex(polygon);
      }
    }
  }

  addVertex (polygon) {
    var newVertex = this.createVertex();
    polygon.coordinates.push(newVertex);
  }

  removeVertex(polygon) {
    if (polygon.coordinates.length > 3) {
      var removalIndex = Math.floor(Math.random() * polygon.length);
      polygon.coordinates.splice(removalIndex, 1);
    }
  }

  clearCanvas() {
    if (this.canvas) {
      const ctx = this.canvas.getContext('2d');
      ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
    }
  }

  renderToCanvas() {
    // create canvas if none exists
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.imageWidth;
      this.canvas.height = this.imageHeight;
    }

    const ctx = this.canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.fillRect(0, 0, this.imageWidth, this.imageHeight);
    
    this.polygons.forEach((polygon) => {
      ctx.fillStyle = `rgba(${polygon.color.r}, ${polygon.color.g}, ${polygon.color.b}, ${this.dnaPolygonAlpha})`;
      ctx.beginPath();
      ctx.moveTo(polygon.coordinates[0].x, polygon.coordinates[0].y);
      for (var i = 1; i < polygon.coordinates.length; i++) {
        ctx.lineTo(polygon.coordinates[i].x, polygon.coordinates[i].y);
      }
      ctx.closePath();
      ctx.fill();
    });
  }

  getPixelData() {
    if (this.canvas) {
      const ctx = this.canvas.getContext('2d');
      return ctx.getImageData(0, 0, this.imageWidth, this.imageHeight).data;
    }
  }

}

module.exports = DNA;
