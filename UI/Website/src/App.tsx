import { useState } from 'react';
import { getData, postData } from '../services/db-api/data-api';
import './App.css';

function App() {
  const [result, setResult] = useState('');

  const handleGet = async () => {
    const data = await getData();
    setResult(JSON.stringify(data, null, 2));
    console.log('GET:', data);
  };

  const handlePost = async () => {
    const data = await postData({ title: "Test", content: "Hello" });
    setResult(JSON.stringify(data, null, 2));
    console.log('POST:', data);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>News Police API Test</h1>
      <button onClick={handleGet}>Get Data</button>
      <button onClick={handlePost} style={{ marginLeft: '10px' }}>Post Data</button>
      <pre style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px', borderRadius: '4px', color: '#333' }}>
        {result}
      </pre>
    </div>
  );
}

export default App;