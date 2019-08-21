import React, { Component } from 'react';

class Portrait extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { canvasRef } = this.props;
    return <div>
      <canvas ref={canvasRef} />
    </div>;
  }
}

export default Portrait;