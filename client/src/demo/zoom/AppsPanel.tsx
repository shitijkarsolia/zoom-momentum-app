import type { ReactNode } from 'react';
import { BoltIcon, CloseIcon } from './icons';

interface AppsPanelProps {
  children: ReactNode;
  viewingAs: string;
  viewingRole: 'host' | 'student';
  onSwitchRole?: () => void;
  onClose?: () => void;
  side?: 'left' | 'right';
  label?: string;
}

export function AppsPanel({
  children,
  viewingAs,
  viewingRole,
  onSwitchRole,
  onClose,
  side = 'right',
  label,
}: AppsPanelProps) {
  return (
    <aside className={`zmw-panel zmw-panel--${side}`} data-tour={side === 'left' ? 'panel-left' : 'panel'}>
      <div className="zmw-panel-header">
        <span className="zmw-panel-app">
          <span className="zmw-panel-appicon"><BoltIcon size={12} /></span>
          Momentum
        </span>
        {onClose && (
          <button type="button" className="zmw-panel-close" onClick={onClose} title="Close panel">
            <CloseIcon size={14} />
          </button>
        )}
      </div>
      <div className={`zmw-panel-persona zmw-panel-persona--${viewingRole}`} data-tour={side === 'left' ? 'persona-left' : 'persona'}>
        <span className="zmw-persona-copy">
          {label ?? 'Viewing as'} <strong>{viewingAs}</strong>
          <em>{viewingRole === 'host' ? 'Professor · Host' : 'Student'}</em>
        </span>
        {onSwitchRole && (
          <button type="button" className="zmw-persona-switch" onClick={onSwitchRole}>
            Switch to {viewingRole === 'host' ? 'student' : 'professor'}
          </button>
        )}
      </div>
      <div className="zmw-panel-body" key={viewingRole}>
        {children}
      </div>
    </aside>
  );
}
