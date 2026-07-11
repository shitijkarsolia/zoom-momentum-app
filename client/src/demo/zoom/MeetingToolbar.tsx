import type { ReactNode } from 'react';
import {
  MicIcon,
  VideoIcon,
  ShieldIcon,
  PeopleIcon,
  ChatIcon,
  ShareIcon,
  RecordIcon,
  SmileIcon,
  AppsIcon,
  CaptionsIcon,
} from './icons';

interface MeetingToolbarProps {
  participantCount: number;
  appsOpen: boolean;
  onToggleApps: () => void;
  onEnd: () => void;
  meetingEnded: boolean;
}

function ToolButton({
  icon,
  label,
  badge,
  active = false,
  disabled = false,
  accent = false,
  onClick,
  tourId,
}: {
  icon: ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  disabled?: boolean;
  accent?: boolean;
  onClick?: () => void;
  tourId?: string;
}) {
  return (
    <button
      type="button"
      className={`zmw-tool ${active ? 'zmw-tool--active' : ''} ${disabled ? 'zmw-tool--decor' : ''} ${accent ? 'zmw-tool--accent' : ''}`}
      onClick={onClick}
      title={disabled ? 'Decorative in this demo' : label}
      data-tour={tourId}
    >
      <span className="zmw-tool-icon">
        {icon}
        {badge !== undefined && <span className="zmw-tool-badge">{badge}</span>}
      </span>
      <span className="zmw-tool-label">{label}</span>
    </button>
  );
}

export function MeetingToolbar({ participantCount, appsOpen, onToggleApps, onEnd, meetingEnded }: MeetingToolbarProps) {
  return (
    <div className="zmw-toolbar">
      <div className="zmw-toolbar-group zmw-toolbar-group--left">
        <ToolButton icon={<MicIcon />} label="Mute" disabled />
        <ToolButton icon={<VideoIcon />} label="Stop Video" disabled />
      </div>
      <div className="zmw-toolbar-group zmw-toolbar-group--center">
        <ToolButton icon={<ShieldIcon />} label="Security" disabled />
        <ToolButton icon={<PeopleIcon />} label="Participants" badge={participantCount} disabled />
        <ToolButton icon={<ChatIcon />} label="Chat" disabled />
        <ToolButton icon={<ShareIcon />} label="Share" accent disabled />
        <ToolButton icon={<RecordIcon />} label="Record" disabled />
        <ToolButton icon={<CaptionsIcon />} label="Captions" disabled />
        <ToolButton icon={<SmileIcon />} label="Reactions" disabled />
        <ToolButton
          icon={<AppsIcon />}
          label="Apps"
          active={appsOpen}
          onClick={onToggleApps}
          tourId="apps-btn"
        />
      </div>
      <div className="zmw-toolbar-group zmw-toolbar-group--right">
        <button type="button" className="zmw-end-btn" onClick={onEnd} disabled={meetingEnded}>
          {meetingEnded ? 'Ended' : 'End'}
        </button>
      </div>
    </div>
  );
}
