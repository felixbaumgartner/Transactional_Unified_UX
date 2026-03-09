import { useState, useMemo } from "react";
import {
  PHASE1_QUESTIONS,
  PHASE2_QUESTIONS,
} from "../constants";

/* ─────── Classification result ─────── */

export type Classification = {
  purpose: "marketing" | "non_marketing";
  subPurpose?: "transactional";
};

/* ─────── Decision functions ─────── */

function decidePhase1(
  answers: Record<string, "yes" | "no">
): "marketing" | "non_marketing" | null {
  const qs = Object.values(PHASE1_QUESTIONS);
  const allAnswered = qs.every((q) => answers[q] !== undefined);
  if (!allAnswered) return null;

  if (answers[qs[0]] === "no" && answers[qs[1]] === "no" && answers[qs[2]] === "yes") {
    // Q1=no, Q2=no, Q3=yes, Q4=no → non-marketing
    // Q1=no, Q2=no, Q3=yes, Q4=yes → non-marketing (proceeds to Phase 2)
    return "non_marketing";
  }
  return "marketing";
}

function decidePhase2(
  answers: Record<string, "yes" | "no">
): "transactional" | "non_transactional" | "forced_marketing" | null {
  const qs = Object.values(PHASE2_QUESTIONS);
  const allAnswered = qs.every((q) => answers[q] !== undefined);
  if (!allAnswered) return null;

  if (answers[qs[3]] === "yes") return "forced_marketing";
  const firstThreeYes = [qs[0], qs[1], qs[2]].every(
    (q) => answers[q] === "yes"
  );
  return firstThreeYes ? "transactional" : "non_transactional";
}

/* ─────── Props ─────── */

interface ClassificationQuestionnaireProps {
  mode: "modal" | "inline";
  onConfirm?: (classification: Classification) => void;
  onCancel?: () => void;
  onChange?: (classification: Classification | null) => void;
}

/* ─────── Component ─────── */

export default function ClassificationQuestionnaire({
  mode,
  onConfirm,
  onCancel,
  onChange,
}: ClassificationQuestionnaireProps) {
  const [responses, setResponses] = useState<Record<string, "yes" | "no">>({});

  const phase1Result = useMemo(() => decidePhase1(responses), [responses]);

  // Q4=yes gates Phase 2; Q4=no means non-marketing is final
  const q4Value = responses[Object.values(PHASE1_QUESTIONS)[3]];
  const showPhase2 = phase1Result === "non_marketing" && q4Value === "yes";

  const phase2Result = useMemo(
    () => (showPhase2 ? decidePhase2(responses) : null),
    [responses, showPhase2]
  );

  const decision = useMemo((): Classification | null => {
    if (phase1Result === "marketing") {
      return { purpose: "marketing" };
    }
    // Q1=no, Q2=no, Q3=yes, Q4=no → non-marketing (final)
    if (phase1Result === "non_marketing" && !showPhase2) {
      return { purpose: "non_marketing" };
    }
    // Q1=no, Q2=no, Q3=yes, Q4=yes → Phase 2 determines outcome
    if (showPhase2 && phase2Result === "forced_marketing") {
      return { purpose: "marketing" };
    }
    if (showPhase2 && phase2Result === "non_transactional") {
      return { purpose: "non_marketing" };
    }
    if (showPhase2 && phase2Result === "transactional") {
      return {
        purpose: "non_marketing",
        subPurpose: "transactional",
      };
    }
    return null;
  }, [phase1Result, showPhase2, phase2Result]);

  // Notify parent of changes in inline mode
  useMemo(() => {
    if (mode === "inline" && onChange) {
      onChange(decision);
    }
  }, [decision, mode, onChange]);

  function setAnswer(question: string, value: "yes" | "no") {
    setResponses((r) => ({ ...r, [question]: value }));
  }

  /* ─── Questionnaire body (shared between modes) ─── */

  const questionnaireContent = (
    <>
      {/* Phase 1 */}
      <div
        style={{
          marginBottom: 8,
          fontWeight: 700,
          fontSize: 13,
          color: "var(--color-gray-500)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Step 1{showPhase2 ? " of 2" : ""}: Promotional Intent Check
      </div>

      {Object.entries(PHASE1_QUESTIONS).map(([key, question]) => (
        <div key={key} className="question-block">
          <div className="question-text">{question}</div>
          <div className="question-radios">
            <label>
              <input
                type="radio"
                name={`cq-${key}`}
                value="yes"
                checked={responses[question] === "yes"}
                onChange={() => setAnswer(question, "yes")}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`cq-${key}`}
                value="no"
                checked={responses[question] === "no"}
                onChange={() => setAnswer(question, "no")}
              />
              No
            </label>
          </div>
        </div>
      ))}

      {phase1Result === "marketing" && (
        <div className="alert alert-warning">
          <div className="alert-title">This is a Marketing message</div>
          Based on your answers, this message is classified as Marketing. If you
          believe this is incorrect, reach out to #targeting-support.
        </div>
      )}

      {/* Phase 2 — only when non-marketing and Q4=yes */}
      {showPhase2 && (
        <div className="tier-selection-appear">
          <div className="divider" />
          <div
            style={{
              marginBottom: 8,
              fontWeight: 700,
              fontSize: 13,
              color: "var(--color-blue-600)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Step 2 of 2: Is this Transactional?
          </div>
          <p className="text-muted mb-8" style={{ fontSize: 13 }}>
            Transactional messages bypass subscription preferences and receive
            priority delivery. All conditions below must be met (Q8 must be
            "No").
          </p>

          {Object.entries(PHASE2_QUESTIONS).map(([key, question]) => (
            <div
              key={key}
              className="question-block"
              style={{
                background: "var(--color-blue-100)",
                border: "1px solid #b3d4fc",
              }}
            >
              <div className="question-text">{question}</div>
              <div className="question-radios">
                <label>
                  <input
                    type="radio"
                    name={`cq-${key}`}
                    value="yes"
                    checked={responses[question] === "yes"}
                    onChange={() => setAnswer(question, "yes")}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name={`cq-${key}`}
                    value="no"
                    checked={responses[question] === "no"}
                    onChange={() => setAnswer(question, "no")}
                  />
                  No
                </label>
              </div>
            </div>
          ))}

          {phase2Result === "non_transactional" && (
            <div className="alert alert-info">
              <div className="alert-title">
                Non-marketing (not transactional)
              </div>
              This message doesn't meet all transactional criteria. Subscription
              categories will still apply.
            </div>
          )}

          {phase2Result === "forced_marketing" && (
            <div className="alert alert-warning">
              <div className="alert-title">
                Reclassified as Marketing (hybrid content detected)
              </div>
              This message contains promotional content alongside its
              informational purpose. Remove the promotional content to qualify as
              transactional.
            </div>
          )}
        </div>
      )}

    </>
  );

  /* ─── Modal mode ─── */
  if (mode === "modal") {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-title">Message Classification</div>
          <div className="modal-subtitle">
            Answer the following questions to classify this message. The
            classification determines routing priority, delivery SLOs, and retry
            policies.
          </div>

          {questionnaireContent}

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>
              Keep as Marketing
            </button>
            <button
              className="btn btn-primary"
              disabled={!decision || decision.purpose !== "non_marketing"}
              onClick={() => decision && onConfirm?.(decision)}
            >
              {decision?.subPurpose === "transactional"
                ? "Confirm as Transactional"
                : "Confirm as Non-marketing"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Inline mode ─── */
  return <div>{questionnaireContent}</div>;
}
