import React from 'react';
import { Sparkles, Check, ArrowRight, Zap } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const DynamicSuggestions = () => {
  const { suggestions, applySuggestion } = useTraffic();

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={20} color="var(--primary-orange)" />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
            Dynamic Traffic Suggestions
          </h3>
        </div>
        <Badge variant="orange" size="sm">
          AI Adaptive Rules
        </Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            style={{
              padding: '16px',
              backgroundColor: sug.applied ? 'var(--status-healthy-bg)' : 'var(--bg-surface-warm)',
              border: sug.applied ? '1px solid var(--status-healthy-border)' : '1px solid var(--border-warm)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {sug.title}
                </span>
                <Badge variant={sug.priority === 'URGENT' ? 'critical' : 'orange'} size="sm">
                  {sug.priority}
                </Badge>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Reason: {sug.reason}
              </p>
            </div>

            <div>
              {sug.applied ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-healthy)', fontWeight: '700', fontSize: '13px' }}>
                  <Check size={16} />
                  <span>Applied</span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => applySuggestion(sug.id)}
                >
                  Apply Suggestion
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
