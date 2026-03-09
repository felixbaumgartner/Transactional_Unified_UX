import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageChannel, CHANNEL_LABELS } from "../constants";
import ClassificationQuestionnaire, {
  Classification,
} from "../components/ClassificationQuestionnaire";

/* ── 3-question purpose questionnaire (non-marketing path) ── */

const PURPOSE_QUESTIONS = {
  q1: "Is the purpose of this message to make a sale or promote products or services to a potential customer?",
  q2: "Does this message include ads, offers, or invitations to buy or join something?",
  q3: "Does this message only provide information about an existing booking or about benefits/features the customer already has?",
};

function decidePurpose(answers: Record<string, "yes" | "no">): {
  purpose: "marketing" | "non_marketing";
} | null {
  const qs = Object.values(PURPOSE_QUESTIONS);
  if (!qs.every((q) => answers[q] !== undefined)) return null;
  if (answers[qs[0]] === "yes" || answers[qs[1]] === "yes") {
    return { purpose: "marketing" };
  }
  return { purpose: "non_marketing" };
}

/* ── Topic schema fields (mock) ── */

const TOPIC_FIELDS: Record<string, string[]> = {
  booking_events: [
    "booking_id", "affiliate_id", "hotel_id", "checkin_date",
    "checkout_date", "booker_cc1", "hotel_cc1", "status",
    "room_count", "total_price", "currency", "created_at",
  ],
  payment_events: [
    "payment_id", "booking_id", "amount", "currency",
    "status", "method", "created_at",
  ],
  identity_events: [
    "user_id", "event_type", "email", "phone",
    "ip_address", "created_at",
  ],
  trip_events: [
    "trip_id", "booking_id", "event_type", "destination",
    "checkin_date", "created_at",
  ],
  browsing_events: [
    "session_id", "user_id", "page_url", "dest_id",
    "search_query", "created_at",
  ],
  engagement_events: [
    "user_id", "campaign_id", "action", "channel", "created_at",
  ],
};

const OPERATORS = [
  { value: "eq", label: "Equals" },
  { value: "ne", label: "Not equals" },
  { value: "lt", label: "Less than" },
  { value: "le", label: "Less than or equal" },
  { value: "gt", label: "Greater than" },
  { value: "ge", label: "Greater than or equal" },
  { value: "in", label: "In" },
];

interface RuleItem {
  id: string;
  field: string;
  operator: string;
  value: string;
  tag: string;
}

interface RuleGroup {
  id: string;
  combinator: "and" | "or";
  rules: RuleItem[];
}

interface OutputField {
  id: string;
  field: string;
  propertyName: string;
}

let _ruleId = 0;
function nextId(prefix: string) {
  return `${prefix}_${++_ruleId}`;
}

type MessageType = "" | "marketing" | "non_marketing" | "transactional";

/* ══════════════════════════════════════════════════════════════════════ */

export default function MessageCreateDemo() {
  const navigate = useNavigate();

  /* ── Common state ── */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");
  const [channel, setChannel] = useState<MessageChannel>("email");

  /* ── Non-marketing modal (3 questions) ── */
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [purposeResponses, setPurposeResponses] = useState<
    Record<string, "yes" | "no">
  >({});

  /* ── Transactional modal (10 questions) ── */
  const [showTxModal, setShowTxModal] = useState(false);
  const [classification, setClassification] = useState<Classification | null>(
    null
  );

  /* ── Trigger: Input Configuration ── */
  const [inputTopic, setInputTopic] = useState("");
  const [consentCheck, setConsentCheck] = useState(false);
  const [eventTimeWindow, setEventTimeWindow] = useState(false);
  const [eventTimeMinutes, setEventTimeMinutes] = useState("");
  const [eventDelay, setEventDelay] = useState(false);
  const [eventDelayMinutes, setEventDelayMinutes] = useState("");

  /* ── Trigger: Rules ── */
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]);

  /* ── Trigger: Output Configuration ── */
  const [outputFields, setOutputFields] = useState<OutputField[]>([]);
  const [uuidFields, setUuidFields] = useState<string[]>([]);
  const [reuseUuid, setReuseUuid] = useState(false);

  /* ── Campaign: Metadata ── */
  const [usesVouchers, setUsesVouchers] = useState("");
  const [holdoutVertical, setHoldoutVertical] = useState("");
  const [holdoutFunnel, setHoldoutFunnel] = useState("");

  /* ── Campaign: Send Configuration ── */
  const [pipeline, setPipeline] = useState("");
  const [activationType, setActivationType] = useState("");

  /* ── Campaign: Base Content ── */
  const [contentTrackingLabel, setContentTrackingLabel] = useState("");
  const [messageCategory, setMessageCategory] = useState("");

  /* ── Campaign: Eligibility Rules ── */
  const [eligibilityRules, setEligibilityRules] = useState<
    { id: number; field: string; operator: string; value: string }[]
  >([]);

  /* ── Campaign: Experiment ── */
  const [experimentEnabled, setExperimentEnabled] = useState(false);
  const [experimentTag, setExperimentTag] = useState("");
  const [variantCount, setVariantCount] = useState(2);

  /* ── Campaign: Reporting ── */
  const [affiliateId, setAffiliateId] = useState("");
  const [parentAffiliateId, setParentAffiliateId] = useState("");

  /* ── UI ── */
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const purposeDecision = useMemo(
    () => decidePurpose(purposeResponses),
    [purposeResponses]
  );

  const isTransactional = messageType === "transactional";
  const isTransactionalConfirmed =
    classification?.subPurpose === "transactional";

  /* ── Handlers ── */

  function handleMessageTypeChange(value: MessageType) {
    if (value === "non_marketing") {
      setShowPurposeModal(true);
      setPurposeResponses({});
      return;
    }
    if (value === "transactional") {
      setShowTxModal(true);
      setClassification(null);
      return;
    }
    setMessageType(value);
    setClassification(null);
  }

  function handlePurposeModalConfirm() {
    if (!purposeDecision || purposeDecision.purpose !== "non_marketing") return;
    setMessageType("non_marketing");
    setShowPurposeModal(false);
  }

  function handlePurposeModalCancel() {
    setShowPurposeModal(false);
    setPurposeResponses({});
    setMessageType("marketing");
  }

  function handleSave() {
    setSaved(true);
    setToast("Message saved successfully!");
    setTimeout(() => setToast(null), 3000);
  }

  /* ── Saved confirmation screen ── */

  if (saved) {
    const typeLabel =
      messageType === "transactional"
        ? "Transactional"
        : messageType === "non_marketing"
          ? "Non-marketing"
          : "Marketing";
    return (
      <div className="app-page">
        <div className="page-header">
          <div className="page-header-main">
            <h1 className="page-title">Message Created</h1>
          </div>
        </div>
        <div className="bui-box" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
          <h2 style={{ marginBottom: 8 }}>Message Created</h2>
          <p className="text-muted mb-16">
            "{name}" has been saved as a {typeLabel} message.
            {isTransactional && (
              <>
                {" "}
                Trigger configuration and campaign settings were saved together.
              </>
            )}
          </p>
          <div
            className="btn-group"
            style={{ justifyContent: "center", marginTop: 24 }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/messages")}
            >
              View All Messages
            </button>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════ */

  return (
    <div className="app-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">New Message</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <span className="badge badge-outline">
              {CHANNEL_LABELS[channel]}
            </span>
            {messageType === "marketing" && (
              <span className="badge badge-marketing">Marketing</span>
            )}
            {messageType === "non_marketing" && (
              <span className="badge badge-outline">Non-marketing</span>
            )}
            {messageType === "transactional" && (
              <span className="badge badge-constructive">Transactional</span>
            )}
            <span className="badge badge-draft">Draft</span>
          </div>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/messages")}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-large"
            disabled={!name || !messageType}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>

      {/* ═══ Section 1: Basic Information ═══ */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Basic Information
        </div>

        <div className="form-group">
          <label className="form-label">Message Name</label>
          <input
            className="form-input"
            placeholder="e.g., booking_confirmation_email"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
          <div className="text-muted" style={{ marginTop: 4, fontSize: 12 }}>
            {name.length}/50 chars
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Describe the purpose of this message..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* ═══ Section 2: Message Type ═══ */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Message Type
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div className="form-group">
            <label className="form-label">
              Message Type
              <span
                title="Marketing: Main goal is to drive business.&#10;Non-marketing: Updates that do not drive business.&#10;Transactional: Booking confirmations, OTPs, payment receipts. Bypasses subscriptions, includes trigger configuration."
                style={{
                  marginLeft: 6,
                  cursor: "help",
                  color: "var(--color-gray-300)",
                  fontSize: 14,
                }}
              >
                &#9432;
              </span>
            </label>
            <select
              className="form-select"
              value={messageType}
              onChange={(e) =>
                handleMessageTypeChange(e.target.value as MessageType)
              }
            >
              <option value="">Select message type...</option>
              <option value="marketing">Marketing</option>
              <option value="non_marketing">Non-marketing</option>
              <option value="transactional">Transactional</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Campaign Uses Vouchers or Coupons
            </label>
            <select
              className="form-select"
              value={usesVouchers}
              onChange={(e) => setUsesVouchers(e.target.value)}
            >
              <option value="">Please select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Holdout Vertical</label>
            <select
              className="form-select"
              value={holdoutVertical}
              onChange={(e) => setHoldoutVertical(e.target.value)}
            >
              <option value="">Select vertical...</option>
              <option>Hotels</option>
              <option>Flights</option>
              <option>Cars</option>
              <option>Attractions</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Holdout Funnel</label>
            <select
              className="form-select"
              value={holdoutFunnel}
              onChange={(e) => setHoldoutFunnel(e.target.value)}
            >
              <option value="">Select funnel...</option>
              <option>Acquisition</option>
              <option>Booking</option>
              <option>Post-booking</option>
              <option>Loyalty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactional confirmed banner */}
      {isTransactional && isTransactionalConfirmed && (
        <div className="tier-selection-appear">
          <div
            className="alert"
            style={{
              background: "var(--color-green-100)",
              borderLeft: "4px solid var(--color-green-600)",
              color: "var(--color-green-600)",
              marginBottom: 0,
            }}
          >
            This message has been validated as transactional. It will be routed
            through the priority transactional pipeline, bypassing Janeway.
            Trigger configuration sections are shown below.
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
           TRIGGER CONFIGURATION (only when Transactional)
           ═══════════════════════════════════════════════════════════════ */}

      {isTransactional && isTransactionalConfirmed && (
        <>
          {/* Section divider */}
          <div className="section-divider tier-selection-appear">
            <div className="section-divider-line" />
            <div className="section-divider-label">
              Trigger Configuration
            </div>
            <div className="section-divider-line" />
          </div>

          {/* ─── Input Configuration ─── */}
          <div className="bui-box tier-selection-appear">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              Input Configuration
            </div>

            {/* Channel radio cards */}
            <div className="form-group">
              <label className="form-label">Channel</label>
              <div className="radio-card-group">
                {(["email", "notification", "sms"] as MessageChannel[]).map(
                  (ch) => (
                    <div
                      key={ch}
                      className={`radio-card ${channel === ch ? "selected" : ""}`}
                      onClick={() => setChannel(ch)}
                      style={{ padding: "12px 16px" }}
                    >
                      <div className="radio-card-header">
                        <div className="radio-card-radio" />
                        <div className="radio-card-title">
                          {CHANNEL_LABELS[ch]}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Input Topic */}
            <div className="form-group">
              <label className="form-label">Input Topic</label>
              <select
                className="form-select"
                value={inputTopic}
                onChange={(e) => setInputTopic(e.target.value)}
              >
                <option value="">Select a topic...</option>
                <option>booking_events</option>
                <option>payment_events</option>
                <option>identity_events</option>
                <option>trip_events</option>
                <option>browsing_events</option>
                <option>engagement_events</option>
              </select>
            </div>

            {/* Consent check */}
            <div className="form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={consentCheck}
                  onChange={() => setConsentCheck(!consentCheck)}
                />
                Enable Consent Check
                <span
                  title="When enabled, checks marketing vs non-marketing campaign eligibility before sending."
                  style={{
                    cursor: "help",
                    color: "var(--color-gray-300)",
                    fontSize: 14,
                  }}
                >
                  &#9432;
                </span>
              </label>
            </div>

            {/* Event time window */}
            <div className="form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={eventTimeWindow}
                  onChange={() => setEventTimeWindow(!eventTimeWindow)}
                />
                Set event time window
              </label>
              {eventTimeWindow && (
                <div
                  className="tier-selection-appear"
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    paddingLeft: 24,
                  }}
                >
                  Track topics in the last
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    style={{ width: 80 }}
                    value={eventTimeMinutes}
                    onChange={(e) => setEventTimeMinutes(e.target.value)}
                    placeholder="60"
                  />
                  minutes
                </div>
              )}
            </div>

            {/* Event evaluation delay */}
            <div className="form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={eventDelay}
                  onChange={() => setEventDelay(!eventDelay)}
                />
                Set event evaluation delay
              </label>
              {eventDelay && (
                <div
                  className="tier-selection-appear"
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    paddingLeft: 24,
                  }}
                >
                  Delay event evaluation
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="360"
                    style={{ width: 80 }}
                    value={eventDelayMinutes}
                    onChange={(e) => setEventDelayMinutes(e.target.value)}
                    placeholder="5"
                  />
                  minutes
                </div>
              )}
            </div>
          </div>

          {/* ─── Rules ─── */}
          <div className="bui-box tier-selection-appear">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              Rules
            </div>
            <p className="text-muted mb-16">
              Configure filtering rules to determine which events trigger a
              message. Rules are evaluated against the input event fields.
            </p>

            {ruleGroups.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  border: "1px dashed var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                }}
              >
                <p className="text-muted" style={{ marginBottom: 12 }}>
                  No rules configured. Add a rule group to filter events.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setRuleGroups([
                        {
                          id: nextId("grp"),
                          combinator: "and",
                          rules: [
                            {
                              id: nextId("rule"),
                              field: "",
                              operator: "eq",
                              value: "",
                              tag: "",
                            },
                          ],
                        },
                      ])
                    }
                  >
                    + Add Rule
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setRuleGroups([
                        {
                          id: nextId("grp"),
                          combinator: "and",
                          rules: [],
                        },
                      ])
                    }
                  >
                    + Add Group
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {ruleGroups.map((group, gi) => (
                  <div key={group.id} className="rule-group">
                    <div className="rule-group-header">
                      <button
                        className={`combinator-toggle ${group.combinator}`}
                        onClick={() =>
                          setRuleGroups((gs) =>
                            gs.map((g, i) =>
                              i === gi
                                ? {
                                    ...g,
                                    combinator:
                                      g.combinator === "and" ? "or" : "and",
                                  }
                                : g
                            )
                          )
                        }
                      >
                        {group.combinator.toUpperCase()}
                      </button>
                      <button
                        className="btn btn-tertiary btn-destructive"
                        style={{ fontSize: 12, marginLeft: "auto" }}
                        onClick={() =>
                          setRuleGroups((gs) =>
                            gs.filter((_, i) => i !== gi)
                          )
                        }
                      >
                        Remove Group
                      </button>
                    </div>

                    {group.rules.map((rule, ri) => (
                      <div key={rule.id} className="rule-row">
                        <select
                          className="form-select"
                          value={rule.field}
                          style={{ minWidth: 160 }}
                          onChange={(e) =>
                            setRuleGroups((gs) =>
                              gs.map((g, i) =>
                                i === gi
                                  ? {
                                      ...g,
                                      rules: g.rules.map((r, j) =>
                                        j === ri
                                          ? { ...r, field: e.target.value }
                                          : r
                                      ),
                                    }
                                  : g
                              )
                            )
                          }
                        >
                          <option value="">Select field</option>
                          {inputTopic &&
                            (TOPIC_FIELDS[inputTopic] || []).map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                        </select>

                        <select
                          className="form-select"
                          value={rule.operator}
                          style={{ minWidth: 140 }}
                          onChange={(e) =>
                            setRuleGroups((gs) =>
                              gs.map((g, i) =>
                                i === gi
                                  ? {
                                      ...g,
                                      rules: g.rules.map((r, j) =>
                                        j === ri
                                          ? { ...r, operator: e.target.value }
                                          : r
                                      ),
                                    }
                                  : g
                              )
                            )
                          }
                        >
                          {OPERATORS.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>

                        <input
                          className="form-input"
                          placeholder="Value"
                          value={rule.value}
                          style={{ minWidth: 120 }}
                          onChange={(e) =>
                            setRuleGroups((gs) =>
                              gs.map((g, i) =>
                                i === gi
                                  ? {
                                      ...g,
                                      rules: g.rules.map((r, j) =>
                                        j === ri
                                          ? { ...r, value: e.target.value }
                                          : r
                                      ),
                                    }
                                  : g
                              )
                            )
                          }
                        />

                        <input
                          className="form-input"
                          placeholder="Metric tag"
                          value={rule.tag}
                          style={{ width: 120 }}
                          title="Events failing this rule will be labeled with this tag on the Triggers dashboard"
                          onChange={(e) =>
                            setRuleGroups((gs) =>
                              gs.map((g, i) =>
                                i === gi
                                  ? {
                                      ...g,
                                      rules: g.rules.map((r, j) =>
                                        j === ri
                                          ? { ...r, tag: e.target.value }
                                          : r
                                      ),
                                    }
                                  : g
                              )
                            )
                          }
                        />

                        <button
                          className="btn btn-tertiary btn-destructive"
                          style={{ padding: "6px 8px", fontSize: 16 }}
                          title="Remove rule"
                          onClick={() =>
                            setRuleGroups((gs) =>
                              gs.map((g, i) =>
                                i === gi
                                  ? {
                                      ...g,
                                      rules: g.rules.filter(
                                        (_, j) => j !== ri
                                      ),
                                    }
                                  : g
                              )
                            )
                          }
                        >
                          &minus;
                        </button>
                      </div>
                    ))}

                    <div style={{ marginTop: 8, marginLeft: 48 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: 12 }}
                        onClick={() =>
                          setRuleGroups((gs) =>
                            gs.map((g, i) =>
                              i === gi
                                ? {
                                    ...g,
                                    rules: [
                                      ...g.rules,
                                      {
                                        id: nextId("rule"),
                                        field: "",
                                        operator: "eq",
                                        value: "",
                                        tag: "",
                                      },
                                    ],
                                  }
                                : g
                            )
                          )
                        }
                      >
                        + Add Rule
                      </button>
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setRuleGroups((gs) => [
                        ...gs,
                        {
                          id: nextId("grp"),
                          combinator: "and",
                          rules: [
                            {
                              id: nextId("rule"),
                              field: "",
                              operator: "eq",
                              value: "",
                              tag: "",
                            },
                          ],
                        },
                      ])
                    }
                  >
                    + Add Group
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── Output Configuration ─── */}
          <div className="bui-box tier-selection-appear">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              Output Configuration
            </div>
            <p className="text-muted mb-16">
              Configure output data to be available to the message consumer.
              Output fields can be mapped onto email, push notification, or SMS
              content, or used to create eligibility rules.
            </p>

            {outputFields.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {outputFields.map((of, i) => (
                  <div
                    key={of.id}
                    className="rule-row"
                    style={{ background: "var(--color-gray-50)" }}
                  >
                    <select
                      className="form-select"
                      value={of.field}
                      style={{ minWidth: 200 }}
                      onChange={(e) =>
                        setOutputFields((fs) =>
                          fs.map((f, j) =>
                            j === i ? { ...f, field: e.target.value } : f
                          )
                        )
                      }
                    >
                      <option value="">Select topic and field</option>
                      {inputTopic &&
                        (TOPIC_FIELDS[inputTopic] || []).map((f) => (
                          <option key={f} value={`${inputTopic}.${f}`}>
                            {inputTopic}.{f}
                          </option>
                        ))}
                    </select>

                    <input
                      className="form-input"
                      placeholder="Property Name"
                      value={of.propertyName}
                      style={{ minWidth: 200 }}
                      onChange={(e) =>
                        setOutputFields((fs) =>
                          fs.map((f, j) =>
                            j === i
                              ? { ...f, propertyName: e.target.value }
                              : f
                          )
                        )
                      }
                    />

                    <button
                      className="btn btn-tertiary btn-destructive"
                      style={{ padding: "6px 8px", fontSize: 16 }}
                      title="Remove field"
                      onClick={() =>
                        setOutputFields((fs) =>
                          fs.filter((_, j) => j !== i)
                        )
                      }
                    >
                      &minus;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary"
                disabled={!inputTopic}
                onClick={() =>
                  setOutputFields((fs) => [
                    ...fs,
                    { id: nextId("out"), field: "", propertyName: "" },
                  ])
                }
              >
                + Add Field
              </button>
              <button
                className="btn btn-secondary"
                disabled={!inputTopic}
                title="Add an advanced field with custom JSON configuration"
                onClick={() =>
                  setOutputFields((fs) => [
                    ...fs,
                    { id: nextId("out"), field: "", propertyName: "" },
                  ])
                }
              >
                + Add Advanced Field
              </button>
            </div>

            {/* UUID */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                UUID
                <span
                  title="UUID uniquely identifies each message using fields from the output payload. Used for deduplication when duplicate events are produced at source."
                  style={{
                    cursor: "help",
                    color: "var(--color-gray-300)",
                    fontSize: 14,
                  }}
                >
                  &#9432;
                </span>
              </div>
              <p className="text-muted" style={{ marginBottom: 8 }}>
                Select output fields to compose the unique message identifier.
              </p>

              <select
                className="form-select"
                multiple
                value={uuidFields}
                style={{ minHeight: 60 }}
                onChange={(e) =>
                  setUuidFields(
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
              >
                {outputFields
                  .filter((f) => f.propertyName)
                  .map((f) => (
                    <option key={f.id} value={f.propertyName}>
                      {f.propertyName}
                    </option>
                  ))}
              </select>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  marginTop: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={reuseUuid}
                  onChange={() => setReuseUuid(!reuseUuid)}
                />
                The field is already in standard UUID format (e.g.,
                12345678-abcd-1234-abcd-123456789abc)
              </label>
            </div>
          </div>

          {/* Section divider back to campaign config */}
          <div className="section-divider tier-selection-appear">
            <div className="section-divider-line" />
            <div className="section-divider-label">
              Campaign Configuration
            </div>
            <div className="section-divider-line" />
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════
           CAMPAIGN CONFIGURATION (always shown when type is selected)
           ═══════════════════════════════════════════════════════════════ */}

      {messageType && (
        <>
          {/* ─── Send Configuration ─── */}
          <div className="bui-box">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              Send Configuration
            </div>

            {messageType === "non_marketing" && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                Non-marketing messages are published to the test pipeline first.
                Once approved, traffic type and pipeline will be updated by the
                Platform team.
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 16,
              }}
            >
              <div className="form-group">
                <label className="form-label">Pipeline</label>
                <select
                  className="form-select"
                  value={
                    isTransactional ? "transactional_priority" : pipeline
                  }
                  onChange={(e) => setPipeline(e.target.value)}
                  disabled={isTransactional}
                >
                  <option value="">Select pipeline...</option>
                  <option value="scheduled_daily_emk">
                    Scheduled: Daily EMK
                  </option>
                  <option value="scheduled_daily_emk_test">
                    Scheduled: Daily EMK Test
                  </option>
                  {isTransactional && (
                    <option value="transactional_priority">
                      Transactional Priority (auto-linked)
                    </option>
                  )}
                </select>
                {isTransactional && (
                  <div
                    className="text-muted"
                    style={{ marginTop: 4, fontSize: 12 }}
                  >
                    Pipeline is automatically set for transactional messages.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Sender Profile</label>
                <select className="form-select">
                  <option>Default Sender</option>
                  <option>Booking.com</option>
                  <option>Booking.com Payments</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 16,
              }}
            >
              <div className="form-group">
                <label className="form-label">Activation Type</label>
                <select
                  className="form-select"
                  value={activationType}
                  onChange={(e) => setActivationType(e.target.value)}
                >
                  <option value="">Select type...</option>
                  <option value="manual">Manual</option>
                  <option value="single_day">
                    Scheduled for Single Day
                  </option>
                  <option value="multi_day">
                    Scheduled for Multiple Days
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Activation Dates</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="form-input" type="date" />
                  <span
                    style={{
                      alignSelf: "center",
                      color: "var(--color-gray-500)",
                    }}
                  >
                    to
                  </span>
                  <input className="form-input" type="date" />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Base Content ─── */}
          <div className="bui-box">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              Base Content
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div className="form-group">
                <label className="form-label">Content Tracking Label</label>
                <input
                  className="form-input"
                  placeholder="e.g., booking_conf_v1"
                  value={contentTrackingLabel}
                  onChange={(e) => setContentTrackingLabel(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message Category</label>
                <select
                  className="form-select"
                  value={messageCategory}
                  onChange={(e) => setMessageCategory(e.target.value)}
                >
                  <option value="">Select category...</option>
                  <option>booking</option>
                  <option>payment</option>
                  <option>identity</option>
                  <option>promotional</option>
                  <option>informational</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Content ID</label>
              <input
                className="form-input"
                placeholder="Select content..."
              />
            </div>
          </div>

          {/* ─── Eligibility Rules ─── */}
          <div className="bui-box">
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Eligibility Rules
              <span
                title="Define rules to filter which users are eligible to receive this message."
                style={{
                  cursor: "help",
                  color: "var(--color-gray-300)",
                  fontSize: 14,
                }}
              >
                &#9432;
              </span>
            </div>
            <p className="text-muted mb-16">
              Define audience eligibility criteria for this message.
            </p>

            {eligibilityRules.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {eligibilityRules.map((rule, i) => (
                  <div
                    key={rule.id}
                    className="rule-row"
                    style={{ background: "var(--color-gray-50)" }}
                  >
                    <select
                      className="form-select"
                      value={rule.field}
                      style={{ minWidth: 160 }}
                      onChange={(e) =>
                        setEligibilityRules((rs) =>
                          rs.map((r, j) =>
                            j === i ? { ...r, field: e.target.value } : r
                          )
                        )
                      }
                    >
                      <option value="">Select field...</option>
                      <option value="country">Country</option>
                      <option value="language">Language</option>
                      <option value="genius_level">Genius Level</option>
                      <option value="booking_count">Booking Count</option>
                      <option value="last_booking_date">
                        Last Booking Date
                      </option>
                      <option value="device_type">Device Type</option>
                      <option value="subscription_status">
                        Subscription Status
                      </option>
                    </select>

                    <select
                      className="form-select"
                      value={rule.operator}
                      style={{ minWidth: 120 }}
                      onChange={(e) =>
                        setEligibilityRules((rs) =>
                          rs.map((r, j) =>
                            j === i
                              ? { ...r, operator: e.target.value }
                              : r
                          )
                        )
                      }
                    >
                      <option value="eq">Equals</option>
                      <option value="ne">Not equals</option>
                      <option value="gt">Greater than</option>
                      <option value="lt">Less than</option>
                      <option value="in">In</option>
                    </select>

                    <input
                      className="form-input"
                      placeholder="Value"
                      value={rule.value}
                      onChange={(e) =>
                        setEligibilityRules((rs) =>
                          rs.map((r, j) =>
                            j === i ? { ...r, value: e.target.value } : r
                          )
                        )
                      }
                    />

                    <button
                      className="btn btn-tertiary btn-destructive"
                      style={{ padding: "6px 8px", fontSize: 16 }}
                      onClick={() =>
                        setEligibilityRules((rs) =>
                          rs.filter((_, j) => j !== i)
                        )
                      }
                    >
                      &minus;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setEligibilityRules((rs) => [
                    ...rs,
                    {
                      id: Date.now(),
                      field: "",
                      operator: "eq",
                      value: "",
                    },
                  ])
                }
              >
                + Add Rule
              </button>
              <button className="btn btn-secondary">Import Audience</button>
            </div>
          </div>

          {/* ─── Experiment ─── */}
          <div className="bui-box">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              Experiment
            </div>

            {!experimentEnabled ? (
              <div
                style={{
                  padding: 24,
                  border: "1px dashed var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                }}
              >
                <p className="text-muted" style={{ marginBottom: 12 }}>
                  No experiment configured. Set up an A/B test to compare
                  content variants.
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setExperimentEnabled(true)}
                >
                  Setup Experiment
                </button>
              </div>
            ) : (
              <div className="tier-selection-appear">
                <div className="form-group">
                  <label className="form-label">
                    Experiment Tag
                    <span
                      className="text-muted"
                      style={{
                        fontWeight: 400,
                        marginLeft: 8,
                        fontSize: 12,
                      }}
                    >
                      For automatic stage tracking, tag should begin with
                      "emk", "mm_email", or "attr_mm_email"
                    </span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="e.g., emk_booking_conf_experiment"
                    value={experimentTag}
                    onChange={(e) => setExperimentTag(e.target.value)}
                  />
                </div>

                <div
                  style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}
                >
                  Content Variants
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  {Array.from({ length: variantCount }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 16,
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        background: "var(--color-gray-50)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          marginBottom: 12,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        Variant {i + 1}
                        {variantCount > 2 && (
                          <button
                            className="btn btn-tertiary btn-destructive"
                            style={{ padding: "2px 6px", fontSize: 12 }}
                            onClick={() => setVariantCount((c) => c - 1)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div
                        className="form-group"
                        style={{ marginBottom: 8 }}
                      >
                        <label className="form-label">Content ID</label>
                        <input
                          className="form-input"
                          placeholder="Select content..."
                        />
                      </div>
                      <div
                        className="form-group"
                        style={{ marginBottom: 0 }}
                      >
                        <label className="form-label">Tracking Label</label>
                        <input
                          className="form-input"
                          placeholder={`variant_${i + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setVariantCount((c) => c + 1)}
                  >
                    + Add Variant
                  </button>
                  <button
                    className="btn btn-secondary btn-destructive"
                    onClick={() => {
                      setExperimentEnabled(false);
                      setExperimentTag("");
                      setVariantCount(2);
                    }}
                  >
                    Remove Experiment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── Reporting Settings ─── */}
          <div className="bui-box">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              Reporting Settings
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div className="form-group">
                <label className="form-label">Affiliate ID</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g., 123456"
                  value={affiliateId}
                  onChange={(e) => setAffiliateId(e.target.value)}
                />
                <div
                  className="text-muted"
                  style={{ marginTop: 4, fontSize: 12 }}
                >
                  Required to publish. Used for reporting attribution.
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Parent Affiliate ID</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g., 654321"
                  value={parentAffiliateId}
                  onChange={(e) => setParentAffiliateId(e.target.value)}
                />
                <div
                  className="text-muted"
                  style={{ marginTop: 4, fontSize: 12 }}
                >
                  Required to publish.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Bottom Save ─── */}
      <div className="btn-group">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/messages")}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-large"
          disabled={!name || !messageType}
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* ═══ Non-marketing purpose modal (3 questions) ═══ */}
      {showPurposeModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 640 }}>
            <div className="modal-title">Change Message Type</div>
            <div className="modal-subtitle">
              The default type for a message is Marketing, changing it requires
              you to answer the following questions
            </div>

            {Object.entries(PURPOSE_QUESTIONS).map(([key, question]) => (
              <div key={key} className="question-block">
                <div className="question-text">{question}</div>
                <div className="question-radios">
                  <label>
                    <input
                      type="radio"
                      name={`purpose-${key}`}
                      value="yes"
                      checked={purposeResponses[question] === "yes"}
                      onChange={() =>
                        setPurposeResponses((r) => ({
                          ...r,
                          [question]: "yes",
                        }))
                      }
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`purpose-${key}`}
                      value="no"
                      checked={purposeResponses[question] === "no"}
                      onChange={() =>
                        setPurposeResponses((r) => ({
                          ...r,
                          [question]: "no",
                        }))
                      }
                    />
                    No
                  </label>
                </div>
              </div>
            ))}

            {purposeDecision?.purpose === "marketing" && (
              <div className="alert alert-warning">
                <div className="alert-title">
                  This is a Marketing message
                </div>
                If you believe your message should not be categorised as
                Marketing, reach out to #targeting-support.
              </div>
            )}

            {purposeDecision?.purpose === "non_marketing" && (
              <div className="alert alert-info">
                <div className="alert-title">
                  This is a Non-marketing message
                </div>
                Subscription categories will apply. Marketing holdout does not
                apply.
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handlePurposeModalCancel}
              >
                Keep as Marketing
              </button>
              <button
                className="btn btn-primary"
                disabled={purposeDecision?.purpose !== "non_marketing"}
                onClick={handlePurposeModalConfirm}
              >
                Change to Non-marketing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Transactional validation modal (10 questions) ═══ */}
      {showTxModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 680, maxHeight: "90vh" }}>
            <div className="modal-title">Transactional Validation</div>
            <div className="modal-subtitle">
              Answer the following questions to validate that this message
              qualifies as transactional. The questionnaire determines the
              classification.
            </div>

            <ClassificationQuestionnaire
              mode="inline"
              onChange={(c) => setClassification(c)}
            />

            {classification && (
              <div style={{ marginTop: 16 }}>
                {classification.subPurpose === "transactional" && (
                    <div
                      className="alert"
                      style={{
                        background: "var(--color-green-100)",
                        borderLeft: "4px solid var(--color-green-600)",
                        color: "var(--color-green-600)",
                      }}
                    >
                      This message has been validated as transactional. It will
                      be routed through the priority transactional pipeline,
                      bypassing Janeway.
                    </div>
                  )}

                {classification.purpose === "marketing" && (
                  <div className="alert alert-warning">
                    <div className="alert-title">
                      Does not qualify as Transactional
                    </div>
                    Based on your answers, this message is classified as{" "}
                    <strong>Marketing</strong>. It does not meet the criteria
                    for transactional delivery.
                  </div>
                )}

                {classification.purpose === "non_marketing" &&
                  !classification.subPurpose && (
                    <div className="alert alert-info">
                      <div className="alert-title">
                        Non-Marketing but not Transactional
                      </div>
                      This message is non-marketing but does not meet all
                      transactional criteria.
                    </div>
                  )}
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowTxModal(false);
                  setClassification(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!isTransactionalConfirmed}
                onClick={() => {
                  setMessageType("transactional");
                  setShowTxModal(false);
                }}
              >
                Confirm as Transactional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
