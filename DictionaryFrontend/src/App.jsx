import React, { useState, useEffect } from 'react';

function App() {
  const [languages, setLanguages] = useState([]);
  const [inputLang, setInputLang] = useState('');
  const [outputLang, setOutputLang] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Fetch languages when component mounts
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('http://localhost:5206/api/dictionary/languages');
        const data = await response.json();
        setLanguages(data);
        console.log('Languages fetched:', data);
        if (data.length > 0) {
          setInputLang(data[0]);
          setOutputLang(data[1] || data[0]);
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };

    fetchLanguages();
  }, []);

  // Handle translation on button click
  const handleTranslate = async () => {
    if (!inputText || !inputLang || !outputLang) {
      console.error('Input fields are missing');
      return;
    }
  
    console.log('Translating:', {
      InputWord: inputText,
      InputLanguage: inputLang,
      OutputLanguage: outputLang
    });
  
    try {
      const response = await fetch('http://localhost:5206/api/dictionary/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          InputWord: inputText,
          InputLanguage: inputLang,
          OutputLanguage: outputLang
        })
      });
  
      if (!response.ok) {
        console.error('Failed to translate:', response.statusText);
        return;
      }
  
      const data = await response.json();
      console.log('Translation response:', data);
  
      // Adjust the following line based on the response format
      // If the response contains "translation", update it to reflect that
      if (data && data.translation) {
        setOutputText(data.translation);  // Set the translated word in the output box
      } else {
        console.error('Invalid response format:', data);
      }
    } catch (error) {
      console.error('Error translating:', error);
    }
  };
  

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Language Translator
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Input Section */}
        <div>
          <select
            value={inputLang}
            onChange={(e) => setInputLang(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="">Select Input Language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate"
            style={{
              width: '100%',
              padding: '10px',
              minHeight: '150px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Output Section */}
        <div>
          <select
            value={outputLang}
            onChange={(e) => setOutputLang(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="">Select Output Language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <textarea
            value={outputText}
            readOnly
            placeholder="Translation will appear here"
            style={{
              width: '100%',
              padding: '10px',
              minHeight: '150px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Translate Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleTranslate}
          disabled={!inputText || !inputLang || !outputLang}
          style={{
            padding: '10px 30px',
            fontSize: '16px',
            backgroundColor: (!inputText || !inputLang || !outputLang) ? '#cccccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!inputText || !inputLang || !outputLang) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          Translate
        </button>
      </div>
    </div>
  );
}

export default App;
