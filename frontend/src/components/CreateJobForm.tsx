import React, { useState } from 'react';
import { useJobsStore } from '../store/useJobsStore';

export const CreateJobForm: React.FC = () => {
  const [text, setText] = useState('');
  const { createJob, isSubmitting } = useJobsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const urls = text
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      alert('Введите хотя бы один URL');
      return;
    }

    const newJobId = await createJob(urls);
    if (newJobId) {
      setText('');
    }
  };

  return (
    <div style={cardStyle}>
      <h2>Новое задание</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={5}
          placeholder="Вставьте список URL (каждый с новой строки)&#10;https://example.com&#10;https://google.com"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
          style={textareaStyle}
        />
        <button type="submit" disabled={isSubmitting} style={buttonStyle}>
          {isSubmitting ? 'Запуск...' : 'Запустить проверку'}
        </button>
      </form>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  marginBottom: '20px',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontFamily: 'monospace',
  boxSizing: 'border-box',
  resize: 'vertical',
};

const buttonStyle: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px 20px',
  background: '#0066cc',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
};