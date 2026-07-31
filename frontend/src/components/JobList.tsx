import React, { useEffect } from 'react';
import { useJobsStore } from '../store/useJobsStore';

export const JobList: React.FC = () => {
  const { jobs, activeJobId, selectJob, fetchJobs, isLoadingJobs } = useJobsStore();

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  if (isLoadingJobs && jobs.length === 0) {
    return <div style={cardStyle}>Загрузка заданий...</div>;
  }

  return (
    <div style={cardStyle}>
      <h2>История заданий</h2>
      {jobs.length === 0 ? (
        <p style={{ color: '#888' }}>Заданий пока нет</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {jobs.map((job) => {
            const isActive = job.id === activeJobId;
            return (
              <div
                key={job.id}
                onClick={() => void selectJob(job.id)}
                style={{
                  ...itemStyle,
                  borderColor: isActive ? '#0066cc' : '#e0e0e0',
                  background: isActive ? '#f0f7ff' : '#fafafa',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {job.id.substring(0, 8)}...
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(job.createdAt).toLocaleTimeString()}
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                  <StatusBadge status={job.status} />
                  <span style={{ fontSize: '12px', color: '#555' }}>
                    Всего: {job.stats.total} | Успешно: {job.stats.success} | Ошибок: {job.stats.error}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#fff3cd', text: '#856404' },
    in_progress: { bg: '#cce5ff', text: '#004085' },
    completed: { bg: '#d4edda', text: '#155724' },
    failed: { bg: '#f8d7da', text: '#721c24' },
    cancelled: { bg: '#e2e3e5', text: '#383d41' },
    success: { bg: '#d4edda', text: '#155724' },
    error: { bg: '#f8d7da', text: '#721c24' },
  };

  const style = colors[status] ?? { bg: '#eee', text: '#333' };

  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold',
        background: style.bg,
        color: style.text,
      }}
    >
      {status}
    </span>
  );
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const itemStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '6px',
  border: '2px solid #e0e0e0',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};