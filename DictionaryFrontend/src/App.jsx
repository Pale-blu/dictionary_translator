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
        setOutputText("TRANSLATION NOT FOUND");
        return;
      }

      const data = await response.json();
      console.log('Translation response:', data);

      // Check if the translation exists in the response
      if (data && data.translation) {
        setOutputText(data.translation);  // Set the translated word in the output box
      } else {
        setOutputText("TRANSLATION NOT FOUND");  // Display message if translation is not found
      }
    } catch (error) {
      console.error('Error translating:', error);
      setOutputText("TRANSLATION NOT FOUND");
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#F0F1F6', // light grayish background
      padding: '20px',
      margin: 0
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px', // Limit max width for compact layout
        backgroundColor: '#1A1A1B', // Darker background for the container
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'left'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '20px',
          color: '#D4D9E1'  // Light gray header color (similar to ChatGPT)
        }}>
          Language Translator
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
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
                border: '1px solid #888',
                backgroundColor: '#333', // Dark background
                color: '#fff', // White text
                fontSize: '14px'
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
                padding: '8px',
                minHeight: '80px', // Smaller height
                borderRadius: '4px',
                border: '1px solid #888',
                backgroundColor: '#444', // Dark input area
                color: '#fff', // White text
                resize: 'vertical',
                fontSize: '14px'
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
                border: '1px solid #888',
                backgroundColor: '#333', // Dark background
                color: '#fff', // White text
                fontSize: '14px'
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
                padding: '8px',
                minHeight: '80px', // Smaller height
                borderRadius: '4px',
                border: '1px solid #888',
                backgroundColor: '#555', // Dark background for output area
                color: '#fff', // White text
                resize: 'vertical',
                fontSize: '14px'
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
              backgroundColor: (!inputText || !inputLang || !outputLang) ? '#555' : '#00BFFF', // Light blue button color
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
    </div>
  );
}

export default App;
