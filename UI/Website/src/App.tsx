import { useState } from 'react';
import { getData, postData } from '../services/db-api/data-api';
import './App.css';

function App() {
  const [result, setResult] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleGet = async () => {
    const response = await getData();
    setResult(JSON.stringify(response, null, 2));
    console.log('GET:', response);
  };

  const handlePost = async () => {
    const response = await postData({ title, content });
    setResult(JSON.stringify(response, null, 2));
    console.log('POST:', response);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>News Police API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
      </div>

      <button onClick={handleGet}>Get Data</button>
      <button onClick={handlePost} style={{ marginLeft: '10px' }}>Post Data</button>
      
      <pre style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px', borderRadius: '4px', color: '#333', textAlign: 'left' }}>
        {result}
      </pre>
    </div>
  );
}

export default App;