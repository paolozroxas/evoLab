import React, { Component } from 'react';
import _ from 'lodash'
import '../stylesheets/App.css';
import GenePool from '../services/genePool';
import Portrait from "./Portrait";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReadyToSimulate: false,
    }

    this.visibleCanvases = [];
  }

  componentDidMount() {
    this.initVisibleCanvases();
  }

  simulate = () => {
    this.genePool = new GenePool(this.imageWidth, this.imageHeight, this.sourcePixels);
    this.genePool.advanceEpoch(0);

    // copy top dnas to visible canvases
    this.visibleCanvases.forEach((visibleCanvas, idx) => {
      const context = visibleCanvas.getContext('2d');
      context.drawImage(this.genePool.dnas[idx].canvas, 0, 0);
    });
  }

  initVisibleCanvases = async () => {
    await this.renderSourceCanvas();
    this.visibleCanvases.forEach((canvas) => {
      canvas.width = this.imageWidth;
      canvas.height = this.imageHeight;
    });
    this.setState({ isReadyToSimulate: true });
  }

  renderSourceCanvas = () => {
    const image = new Image();
    image.src = 'pikachu.png';

    return new Promise((resolve) => {
      image.onload = () => {
        this.imageWidth = image.width;
        this.imageHeight = image.height;
  
        this.sourceCanvas.width = this.imageWidth;
        this.sourceCanvas.height = this.imageHeight;
        const context = this.sourceCanvas.getContext('2d');
        context.drawImage(image, 0, 0);
  
        this.sourcePixels = context.getImageData(0, 0, this.imageWidth, this.imageHeight).data;
        resolve();
      }
    })
  }

  render() {
    const { isReadyToSimulate } = this.state;
    return (
      <div className='App'>
        <input
          type='submit'
          value={isReadyToSimulate ? 'Start' : 'Loading...'}
          onClick={this.simulate}
        />
        <Portrait canvasRef={(ref) => this.sourceCanvas = ref}/>
        { _.times(5, (idx) => {
            return <Portrait key={idx} canvasRef={(ref) => this.visibleCanvases[idx] = ref} />
          })
        }
      </div>
    );
  }
}

export default App;
