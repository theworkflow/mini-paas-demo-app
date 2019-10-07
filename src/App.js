import React from 'react';
import logo from './logo.svg';
import khadi from './khadi.jpg';
import pimpin from './pimpin.jpg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={pimpin} className="App-logo" alt="logo" />
        <p>Welcome to the Mini PaaS Demo!</p>
        <a>Checkout my site! What dog is this?</a>
      </header>
    </div>
  );
}

export default App;
