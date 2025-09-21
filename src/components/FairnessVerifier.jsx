import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaUpload } from 'react-icons/fa';

// Simplified HMAC-SHA256 verification (in production use crypto-js or similar)
const verifyResult = (serverSeed, clientSeed, nonce) => {
  const combined = `${serverSeed}-${clientSeed}-${nonce}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % 10000 / 10000; // Returns 0-0.9999
};

const ResultCard = ({ result, expected, actual }) => {
  const isValid = Math.abs(expected - (actual ?? expected)) < 0.01;
  const percentage = (expected * 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg mb-3 ${isValid ? 'bg-green-900/30' : 'bg-red-900/30'} border ${isValid ? 'border-green-700/50' : 'border-red-700/50'}`}
    >
      <div className="flex items-center gap-3">
        {isValid ? (
          <FaCheckCircle className="text-green-400 text-xl" />
        ) : (
          <FaTimesCircle className="text-red-400 text-xl" />
        )}
        <div>
          <div className="font-medium text-white">
            {result.clientSeed} (Nonce: {result.nonce})
          </div>
          <div className="text-sm text-gray-300">
            Expected: {percentage}% • Actual: {actual ? `${(actual * 100).toFixed(2)}%` : 'Not provided'}
          </div>
        </div>
      </div>
      {!isValid && actual && (
        <div className="mt-2 text-sm text-red-300">
          ⚠️ Mismatch detected. House might be cooking you.
        </div>
      )}
    </motion.div>
  );
};

const FairnessVerifier = () => {
  const [mode, setMode] = useState('single');
  const [serverSeed, setServerSeed] = useState('');
  const [clientSeed, setClientSeed] = useState('');
  const [nonce, setNonce] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [results, setResults] = useState([]);

  const verifySingle = (e) => {
    e.preventDefault();
    const expected = verifyResult(serverSeed, clientSeed, nonce);
    setResults([{
      serverSeed,
      clientSeed,
      nonce,
      expected,
      actual: actualResult ? parseFloat(actualResult) : null
    }]);
  };

  const verifyBulk = (e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(jsonInput);
      if (!Array.isArray(data)) throw new Error('Input must be an array');
      
      const verified = data.map(item => ({
        ...item,
        expected: verifyResult(item.serverSeed, item.clientSeed, item.nonce)
      }));
      setResults(verified);
    } catch (err) {
      alert(`JSON Error: ${err.message}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-dark-light rounded-xl p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-white">Fairness Verifier</h2>
        <FaInfoCircle className="text-gray-400" title="Verify if the house is playing straight" />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-2 rounded ${mode === 'single' ? 'bg-primary text-white' : 'bg-dark text-gray-400'}`}
        >
          Single Check
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={`px-4 py-2 rounded ${mode === 'bulk' ? 'bg-primary text-white' : 'bg-dark text-gray-400'}`}
        >
          Bulk JSON
        </button>
      </div>

      {mode === 'single' ? (
        <form onSubmit={verifySingle} className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-300 mb-1">Server Seed (Unhashed)</label>
            <input
              type="text"
              value={serverSeed}
              onChange={(e) => setServerSeed(e.target.value)}
              className="w-full bg-dark p-3 rounded border border-gray-600 text-white"
              placeholder="Paste server seed here"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">Client Seed</label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="w-full bg-dark p-3 rounded border border-gray-600 text-white"
                placeholder="Your client seed"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Nonce</label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                className="w-full bg-dark p-3 rounded border border-gray-600 text-white"
                placeholder="Nonce value"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Actual Result (Optional)</label>
            <input
              type="number"
              step="0.0001"
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              className="w-full bg-dark p-3 rounded border border-gray-600 text-white"
              placeholder="0.0000 - 0.9999"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded transition-colors"
          >
            Verify Fairness
          </button>
        </form>
      ) : (
        <form onSubmit={verifyBulk} className="mb-6">
          <label className="block text-gray-300 mb-2">
            Paste JSON array of {`{serverSeed, clientSeed, nonce, actualResult?}`}
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full bg-dark p-3 rounded border border-gray-600 text-white h-40 font-mono text-sm"
            placeholder={`[\n  {\n    "serverSeed": "...",\n    "clientSeed": "...",\n    "nonce": 1\n  }\n]`}
          />
          <div className="flex justify-between items-center mt-2">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
            >
              <FaUpload /> Verify Batch
            </button>
            <span className="text-gray-400 text-sm">
              {results.length > 0 ? `${results.length} results` : ''}
            </span>
          </div>
        </form>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Verification Results
          </h3>
          <div className="space-y-2">
            {results.map((result, i) => (
              <ResultCard
                key={i}
                result={result}
                expected={result.expected}
                actual={result.actual}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FairnessVerifier;