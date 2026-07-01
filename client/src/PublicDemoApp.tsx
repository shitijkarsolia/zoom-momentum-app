import { useState } from 'react';
import { HostDashboard } from './views/HostDashboard';
import type { HostTab } from './views/HostDashboard';
import { StudentView } from './views/StudentView';
import { usePublicDemoMeeting } from './demo/usePublicDemoMeeting';

export default function PublicDemoApp() {
  const { state, transcriptSegments, actions } = usePublicDemoMeeting();
  const [hostTab, setHostTab] = useState<HostTab>('pulse');
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
  const hostParticipantCount = state.scenario.students.length + 1;

  return (
    <main className="public-demo-shell">
      <header className="public-demo-header">
        <div className="public-demo-title">
          <span className="public-demo-kicker">Zoom Momentum</span>
          <h1>{state.scenario.title}</h1>
        </div>
        <div className="public-demo-actions">
          {state.anchorLive ? (
            <button className="btn btn-secondary" onClick={() => { setHostTab('anchor'); actions.stopAnchor(); }}>Pause Lecture</button>
          ) : (
            <button className="btn btn-primary" onClick={() => { setHostTab('anchor'); actions.startAnchor(); }}>Start Lecture</button>
          )}
          <button className="btn btn-secondary" onClick={() => { setHostTab('pulse'); actions.generatePoll(); }}>Pulse Poll</button>
          <button className="btn btn-secondary" onClick={() => { setHostTab('arena'); actions.generateArena(); }}>Arena Quiz</button>
          <button className="btn btn-secondary" onClick={actions.endClass}>End Class</button>
          <button className="btn btn-secondary" onClick={actions.resetDemo}>Reset</button>
        </div>
      </header>

      <section className="public-demo-grid" aria-label="Public product demo">
        <div className="public-demo-panel public-demo-panel--host">
          <div className="public-demo-panel-label">
            <span>Professor Host</span>
            <strong>{state.scenario.hostName}</strong>
          </div>
          <HostDashboard
            userName={state.scenario.hostName}
            connected
            participantCount={hostParticipantCount}
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
        </div>

        <div className="public-demo-panel public-demo-panel--student">
          <div className="public-demo-panel-label">
            <span>Student View</span>
            <strong>{state.scenario.studentName}</strong>
          </div>
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
          />
        </div>
      </section>
    </main>
  );
}
