import React, { Component } from 'react';
import './App.css';

import Typer from 'react-typer';

class App extends Component {
  onType = (typed) => {
    console.log('%conType:   ', 'color:red', typed);
  }

  onTyped = (text) => {
    console.log('%conTyped:  ', 'color:blue', text);
  }

  onErase = (erased) => {
    console.log('%conErase:  ', 'color:green', erased);
  }

  onErased = (text) => {
    console.log('%conErased: ', 'color:orange', text);
  }

  onFinish = () => {
    console.log('Finished!');
  }

  render() {
    const spool = ['🎉 React Typer', '🎊 Hello World!'];

    return (
      <div className="App">
        <Typer
          repeats={1}
          initialAction="erasing"
          spool={spool}
          onType={this.onType}
          onTyped={this.onTyped}
          onErase={this.onErase}
          onErased={this.onErased}
          onFinish={this.onFinish}
        />
      </div>
    );
  }
}

export default App;
