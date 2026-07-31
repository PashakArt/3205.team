import React from 'react';
import { CreateJobForm } from './components/CreateJobForm';
import { JobList } from './components/JobList';
import { JobDetails } from './components/JobDetails';
import { useJobsStore } from './store/useJobsStore';

export const App: React.FC = () => {
  const error = useJobsStore((state) => state.error);

  return (
    <div style={layoutStyle}>
      <header style={headerStyle}>
        <h1>🔍 URL Checker Dashboard</h1>
      </header>

      {error && <div style={errorAlertStyle}>{error}</div>}

      <main style={gridStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <CreateJobForm />
          <JobList />
        </div>

        <div>
          <JobDetails />
        </div>
      </main>
    </div>
  );
};

const layoutStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#333',
};

const headerStyle: React.CSSProperties = {
  marginBottom: '20px',
  borderBottom: '2px solid #eee',
  paddingBottom: '10px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.5fr',
  gap: '20px',
};

const errorAlertStyle: React.CSSProperties = {
  padding: '12px',
  background: '#f8d7da',
  color: '#721c24',
  borderRadius: '6px',
  marginBottom: '20px',
};

export default App;