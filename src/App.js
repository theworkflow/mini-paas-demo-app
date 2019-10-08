import React from 'react';
import khadi from './khadi.jpg';
import pimpin from './pimpin.jpg';
import './App.css';

const dogs = {
  khadi: {
    image: khadi,
    alt: 'dog-khadi'
  },
  pimpin: {
    image: pimpin,
    alt: 'dog-pimpin'
  }
}

function App() {
  const dog = dogs['pimpin'];
  return (
    <div className="App">
      <header className="App-header">
        <p>Welcome to the Mini PaaS Demo!</p>
        <img src={dog.image} className="App-logo" alt={dog.alt} />
        <p>Checkout my site! What dog is this?</p>
      </header>
    </div>
  );
}

export default App;
