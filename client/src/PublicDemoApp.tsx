import { useCallback, useEffect, useState } from 'react';
import { HostDashboard } from './views/HostDashboard';
import type { HostTab } from './views/HostDashboard';
import { StudentView } from './views/StudentView';
import type { StudentTab } from './views/StudentView';
import { usePublicDemoMeeting } from './demo/usePublicDemoMeeting';
import { MeetingStage } from './demo/zoom/MeetingStage';
import type { StageParticipant } from './demo/zoom/MeetingStage';
import { MeetingToolbar } from './demo/zoom/MeetingToolbar';
import { AppsPanel } from './demo/zoom/AppsPanel';
import { ZoomLogoIcon } from './demo/zoom/icons';
import { TourOverlay } from './demo/tour/TourOverlay';
import { tourSteps } from './demo/tour/tourSteps';
import type { TourLayout, TourPov, TourStep } from './demo/tour/tourSteps';
import { useTour } from './demo/tour/useTour';
import './demo/demo.css';

const GITHUB_URL = 'https://github.com/shitijkarsolia/zoom-momentum-app';
const HOST_ID = 'demo-host';
const STUDENT_ID = 'demo-student';

export default function PublicDemoApp() {
  const { state, transcriptSegments, dispatch, actions } = usePublicDemoMeeting();

  // Tour/demo chrome typeface. Loaded at runtime so the font request only
  // happens in the public demo, never inside Zoom (where CSP is strict).
  useEffect(() => {
    if (document.getElementById('demo-tour-font')) return;
    const link = document.createElement('link');
    link.id = 'demo-tour-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap';
    document.head.appendChild(link);
  }, []);

  const [pov, setPov] = useState<TourPov>('host');
  const [layout, setLayout] = useState<TourLayout>('meeting');
  const [panelOpen, setPanelOpen] = useState(false);
  const [hostTab, setHostTab] = useState<HostTab>('anchor');
  const [studentTab, setStudentTab] = useState<StudentTab>('timeline');

  const handleStepChange = useCallback((step: TourStep) => {
    setPov(step.pov);
    setLayout(step.layout ?? 'meeting');
    setPanelOpen(step.panelOpen ?? true);
    if (step.hostTab) setHostTab(step.hostTab);
    if (step.studentTab) setStudentTab(step.studentTab);
  }, []);

  const handleFinish = useCallback((reason: 'completed' | 'skipped') => {
    if (reason === 'skipped') {
      setLayout('meeting');
      setPov('host');
    }
    setPanelOpen(true);
  }, []);

  const tour = useTour({
    steps: tourSteps,
    dispatch,
    onStepChange: handleStepChange,
    onFinish: handleFinish,
  });
  const touring = tour.status === 'active';

  // --- Stage participants -------------------------------------------------
  const reactions = new Map<string, string>();
  if (!state.meetingEnded) {
    if (state.pulse.phase === 'live') {
      for (const id of state.pulse.responses.keys()) reactions.set(id, '✓');
    }
    if (state.arena.phase === 'question' || state.arena.phase === 'leaderboard') {
      for (const id of state.arena.responses.keys()) reactions.set(id, '⚡');
    }
    if (state.arena.phase === 'finished' && state.arena.finalLeaderboard[0]) {
      reactions.set(state.arena.finalLeaderboard[0].participantId, '🏆');
    }
  }

  const participants: StageParticipant[] = [
    {
      id: HOST_ID,
      name: state.scenario.hostName,
      role: 'host',
      isYou: pov === 'host' && layout === 'meeting',
      isSpeaking: state.activeSpeaker === state.scenario.hostName && !state.meetingEnded,
      micOn: state.anchorLive && !state.meetingEnded,
      reaction: reactions.get(HOST_ID) ?? null,
    },
    {
      id: STUDENT_ID,
      name: state.scenario.studentName,
      role: 'student',
      isYou: pov === 'student' && layout === 'meeting',
      isSpeaking: false,
      micOn: false,
      reaction: reactions.get(STUDENT_ID) ?? null,
    },
    ...state.scenario.students.map(student => ({
      id: student.participantId,
      name: student.name,
      role: 'student' as const,
      isYou: false,
      isSpeaking: false,
      micOn: false,
      reaction: reactions.get(student.participantId) ?? null,
    })),
  ];

  // --- Panels ---------------------------------------------------------------
  const currentQuestion = state.arena.questions[state.arena.currentIndex] ?? null;
  const studentQuestion = currentQuestion && state.arena.studentPhase !== 'waiting'
    ? {
        index: state.arena.currentIndex,
        total: state.arena.questions.length,
        question: currentQuestion.question,
        options: currentQuestion.options,
      }
    : null;
  const liveStudentPoll = state.pulse.phase === 'live' ? state.pulse.activePoll : null;

  const hostPanel = (
    <HostDashboard
      userName={state.scenario.hostName}
      connected
      participantCount={state.scenario.students.length + 1}
      pulsePhase={state.pulse.phase}
      pulseDraft={state.pulse.draft}
      pulseResponseCount={state.pulse.responses.size}
      pulseActivePoll={state.pulse.activePoll}
      pulseResponses={state.pulse.responses}
      pulseError={null}
      onPulseGenerate={actions.generatePoll}
      onPulseUpdateDraft={actions.updatePollDraft}
      onPulseLaunch={actions.launchPoll}
      onPulseEndPoll={actions.endPoll}
      onPulseReset={actions.resetPoll}
      arenaPhase={state.arena.phase}
      arenaCurrentQuestion={currentQuestion}
      arenaCurrentIndex={state.arena.currentIndex}
      arenaTotalQuestions={state.arena.questions.length}
      arenaResponseCount={state.arena.responses.size}
      arenaCountdown={state.arena.countdown}
      arenaLeaderboard={state.arena.leaderboard}
      arenaQuestionAccuracy={state.arena.questionAccuracy}
      arenaError={null}
      arenaQuestions={state.arena.questions}
      onArenaFetchQuestions={actions.generateArena}
      onArenaAppendQuestions={actions.appendArenaQuestions}
      onArenaUpdateQuestion={actions.updateArenaQuestion}
      onArenaStartGame={actions.startArena}
      onArenaShowLeaderboard={actions.showArenaLeaderboard}
      onArenaNextQuestion={actions.nextArenaQuestion}
      onArenaEndGame={actions.endArena}
      onArenaReset={actions.resetArena}
      anchorTopics={state.topics}
      anchorCurrentTopicId={state.currentTopicId}
      anchorGlossary={state.glossary}
      anchorIsPolling={state.anchorLive}
      anchorError={null}
      meetingId={state.scenario.meetingId}
      isInZoom={false}
      useMockTranscript
      onToggleTranscriptSource={() => undefined}
      onAnchorStartPolling={actions.startAnchor}
      onAnchorStopPolling={actions.stopAnchor}
      onEndClass={actions.endClass}
      onResetMeeting={actions.resetDemo}
      transcriptSegments={transcriptSegments}
      activeTabOverride={hostTab}
      onActiveTabChange={setHostTab}
    />
  );

  const studentPanel = (
    <StudentView
      userName={state.scenario.studentName}
      connected
      meetingId={state.scenario.meetingId}
      anchorIsLive={state.anchorLive}
      activePoll={liveStudentPoll}
      selectedOption={state.pulse.selectedOption}
      hasAnswered={state.pulse.hasAnswered}
      pollResults={state.pulse.studentResults}
      onSelectOption={actions.selectPollOption}
      onSubmitAnswer={actions.submitPollAnswer}
      arenaPhase={state.arena.studentPhase}
      arenaCurrentQuestion={studentQuestion}
      arenaSelectedOption={state.arena.selectedOption}
      arenaCountdown={state.arena.countdown}
      arenaLeaderboard={state.arena.leaderboard}
      arenaCorrectIndex={state.arena.correctIndex}
      arenaExplanation={state.arena.explanation}
      arenaFinalLeaderboard={state.arena.finalLeaderboard}
      onArenaSelectAndSubmit={actions.selectArenaOption}
      anchorTopics={state.topics}
      anchorCurrentTopicId={state.currentTopicId}
      anchorGlossary={state.glossary}
      anchorBookmarks={state.bookmarks}
      onBookmark={(_meetingId, _userId, options) => actions.bookmarkCurrentTopic(options?.topicOverride)}
      onRemoveBookmark={actions.removeBookmark}
      meetingEnded={state.meetingEnded}
      lateJoinInfo={null}
      activeSpeaker={state.activeSpeaker}
      transcriptSegments={transcriptSegments}
      disableRemoteTranslations
      recoveryItemsOverride={state.recoveryItems}
      activeTabOverride={studentTab}
      onActiveTabChange={setStudentTab}
    />
  );

  const povLabel = layout === 'split' ? 'both' : pov;

  const setPerspective = (next: 'host' | 'student' | 'both') => {
    if (next === 'both') {
      setLayout('split');
      setPanelOpen(true);
      return;
    }
    setLayout('meeting');
    setPanelOpen(true);
    setPov(next);
  };

  return (
    <div className="demo-root">
      <header className="demo-bar">
        <div className="demo-bar-brand">
          <span className="demo-bar-logo"><ZoomLogoIcon size={22} /></span>
          <strong>Zoom Momentum</strong>
          <span className="demo-bar-note">Interactive demo · simulated Zoom meeting</span>
        </div>
        <div className="demo-bar-actions">
          {!touring && (
            <>
              <div className="demo-seg" role="group" aria-label="Perspective">
                {(['host', 'student', 'both'] as const).map(option => (
                  <button
                    key={option}
                    type="button"
                    className={povLabel === option ? 'active' : ''}
                    onClick={() => setPerspective(option)}
                  >
                    {option === 'host' ? 'Professor' : option === 'student' ? 'Student' : 'Both'}
                  </button>
                ))}
              </div>
              <button type="button" className="demo-bar-btn" onClick={tour.restart}>
                Replay tour
              </button>
              <button type="button" className="demo-bar-btn" onClick={actions.resetDemo}>
                Reset class
              </button>
            </>
          )}
          <a className="demo-bar-btn demo-bar-btn--link" href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </header>

      <div className={`zmw ${layout === 'split' ? 'zmw--split' : ''}`}>
        <div className="zmw-main">
          {layout === 'split' && (
            <AppsPanel
              viewingAs={state.scenario.hostName}
              viewingRole="host"
              side="left"
              label="Professor view"
            >
              {hostPanel}
            </AppsPanel>
          )}

          <MeetingStage
            title={state.scenario.title}
            participants={participants}
            meetingEnded={state.meetingEnded}
            recording={state.anchorLive}
            compact={layout === 'split'}
          />

          {layout === 'split' ? (
            <AppsPanel
              viewingAs={state.scenario.studentName}
              viewingRole="student"
              side="right"
              label="Student view"
            >
              {studentPanel}
            </AppsPanel>
          ) : (
            panelOpen && (
              <AppsPanel
                viewingAs={pov === 'host' ? state.scenario.hostName : state.scenario.studentName}
                viewingRole={pov}
                onSwitchRole={!touring ? () => setPov(current => (current === 'host' ? 'student' : 'host')) : undefined}
                onClose={!touring ? () => setPanelOpen(false) : undefined}
              >
                {pov === 'host' ? hostPanel : studentPanel}
              </AppsPanel>
            )
          )}
        </div>

        <MeetingToolbar
          participantCount={state.scenario.students.length + 2}
          appsOpen={panelOpen || layout === 'split'}
          onToggleApps={() => {
            if (layout === 'split') {
              setLayout('meeting');
              setPanelOpen(true);
            } else {
              setPanelOpen(open => !open);
            }
          }}
          onEnd={actions.endClass}
          meetingEnded={state.meetingEnded}
        />
      </div>

      {touring && (
        <TourOverlay
          step={tour.step}
          stepIndex={tour.stepIndex}
          totalSteps={tour.totalSteps}
          onNext={tour.next}
          onBack={tour.back}
          onSkip={tour.skip}
        />
      )}
    </div>
  );
}
