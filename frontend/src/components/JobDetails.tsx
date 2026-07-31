import React from 'react';
import { useJobsStore } from '../store/useJobsStore';
import { StatusBadge } from './JobList';

export const JobDetails: React.FC = () => {
  const { activeJobDetails, isLoadingDetails, cancelJob } = useJobsStore();

  if (isLoadingDetails && !activeJobDetails) {
    return <div style={cardStyle}>Загрузка деталей...</div>;
  }

  if (!activeJobDetails) {
    return (
      <div style={cardStyle}>
        <h3>Выберите задание из списка слева</h3>
      </div>
    );
  }

  const { id, status, stats, urls } = activeJobDetails;
  const progressPercent =
    stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;

  const canCancel = status === 'pending' || status === 'in_progress';

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Задание {id.substring(0, 8)}...</h2>
          <StatusBadge status={status} />
        </div>
        {canCancel && (
          <button
            onClick={() => void cancelJob(id)}
            style={cancelButtonStyle}
          >
            Отменить задание
          </button>
        )}
      </div>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
          <span>Прогресс: {stats.processed} из {stats.total}</span>
          <span>{progressPercent}%</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: status === 'failed' ? '#dc3545' : '#28a745',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <h3>Список URL-адресов</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>URL</th>
              <th style={thStyle}>Статус</th>
              <th style={thStyle}>HTTP Код</th>
              <th style={thStyle}>Длительность</th>
              <th style={thStyle}>Ошибка</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((item, index) => (
              <tr key={index}>
                <td style={{ ...tdStyle, fontFamily: 'monospace', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.url}
                </td>
                <td style={tdStyle}>
                  <StatusBadge status={item.status} />
                </td>
                <td style={tdStyle}>
                  {item.httpStatus ? <strong>{item.httpStatus}</strong> : '-'}
                </td>
                <td style={tdStyle}>
                  {item.durationMs ? `${item.durationMs} ms` : '-'}
                </td>
                <td style={{ ...tdStyle, color: '#dc3545', fontSize: '12px' }}>
                  {item.errorMessage ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#dc3545',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '10px',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '2px solid #ddd',
  background: '#f8f9fa',
  fontSize: '13px',
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  fontSize: '13px',
};