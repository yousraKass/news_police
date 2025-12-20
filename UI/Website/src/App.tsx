import { useState } from 'react';
import { getData, postData } from '../services/db-api/data-api';
import { askAI } from '../services/ai-api/get-response';
import './App.css';

function App() {
  const [result, setResult] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');

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

  const handleAskAI = async () => {
    const response = await askAI(question);
    setResult(JSON.stringify(response, null, 2));
    console.log('AI:', response);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>News Police API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Database API</h3>
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
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleGet}>Get Data</button>
          <button onClick={handlePost} style={{ marginLeft: '10px' }}>Post Data</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <h3>AI API</h3>
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ padding: '8px', width: '620px' }}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleAskAI}>Ask AI</button>
        </div>
      </div>
      
      <pre style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px', borderRadius: '4px', color: '#333', textAlign: 'left' }}>
        {result}
      </pre>
    </div>
  );
}

export default App;