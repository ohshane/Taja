import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const reader = new FileReader();

  const [typebox, setTypebox] = useState('');
  const [file, setFile] = useState('');
  const [line, setLine] = useState(0);
  const [speed, setSpeed] = useState(0);


  const [prevTypoCount, setPrevTypoCount] = useState(0);
  const [prevCorrectCount, setPrevCorrectCount] = useState(0);

  const [currentTypoCount, setCurrentTypoCount] = useState(0);
  const [currentCorrectCount, setCurrentCorrectCount] = useState(0);

  const [elapsed, setElapsed] = useState(0);

  let intervalRef = useRef();

  useEffect(() => {
    setLine(0)
    setTypebox('')
    setElapsed(0)
  }, [file])

  useEffect(() => {
    const delta = 10
    if ((typebox.length > 0) || (elapsed > 0)) {
      intervalRef.current = setInterval(() => setElapsed(elapsed + delta), delta)
      setSpeed(Math.floor(typebox.length / elapsed * (600000 / delta)))
    }
    return () => clearInterval(intervalRef.current)
  }, [elapsed, typebox, file, line])

  useEffect(() => {
    if (file.length > 0) {
      let rowTypoCount = 0;
      for (let i = 0; i < typebox.length; i++) {
        if (typebox[i] !== file[line][i]) {
          rowTypoCount++
        }
      }
      setCurrentTypoCount(rowTypoCount)
      setCurrentCorrectCount(typebox.length - rowTypoCount)
    }
  }, [typebox, file, line])

  reader.onload = () => {
    const rows = reader.result.split('\n').map((x) => x.trim())
    setFile(rows)
  }

  function handleInput(e) {
    if (e.key === 'Enter') {
      setPrevCorrectCount(prevCorrectCount + currentCorrectCount)
      setPrevTypoCount(prevTypoCount + (file[line].length - currentCorrectCount))

      setLine(line+1)
      setTypebox('')

      clearInterval(intervalRef.current)
      setElapsed(0)
      setSpeed(0)
    }
  }

  function highlight() {
    const chars = [];
    for (let i = 0; i < file[line].length; i++) {
      let color = "black"
      if (i < typebox.length) {
        if (typebox[i] !== file[line][i]) {
          color = "red"
        }
      }
      chars.push(<span style={{color, "fontWeight": "bold"}}>{file[line][i]}</span>)
    }
    return chars
  }

  return (
    <div className="App">
      <div className="box">
        <div className="container">
          <table>
            <tr><th style={{ textAlign: "left" }}>Speed</th><td>{speed}</td></tr>
            <tr><th style={{ textAlign: "left" }}>Typo</th><td>{(currentTypoCount+prevTypoCount)}/{(currentCorrectCount+prevCorrectCount+currentTypoCount+prevTypoCount)}</td></tr>
            <tr><th style={{ textAlign: "left" }}>Pages</th><td>{line}/{file.length}</td></tr>
          </table>
        </div>
      </div>
      <div className="box">
        <div className="container">
          <div className="box sentence">
          { file.length > 0 ? highlight() : null }
          </div>
          <input
            className="box sentence"
            id="typebox"
            type="text"
            onChange={ e => setTypebox(e.target.value) }
            onKeyDown={ handleInput }
            value={ typebox }
            disabled={ file.length > 0 ? false : true }
          />
        </div>
      </div>
      <div className="box">
        <input id="fileupload" type="file" accept=".txt" onChange={ e => {
          reader.readAsText(e.target.files[0])
        }} />
      </div>
    </div>
  );
}

export default App;
