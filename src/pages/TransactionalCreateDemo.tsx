import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageChannel, CHANNEL_LABELS } from "../constants";

export default function TransactionalCreateDemo() {
  const navigate = useNavigate();

  /* ── Campaign info ── */
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState<MessageChannel>("email");

  /* ── Input Configuration (topic) ── */
  const [inputTopic, setInputTopic] = useState("");

  /* ── Content ── */
  const [contentTrackingLabel, setContentTrackingLabel] = useState("");
  const [messageCategory, setMessageCategory] = useState("");

  /* ── Experiment ── */
  const [experimentEnabled, setExperimentEnabled] = useState(false);
  const [experimentTag, setExperimentTag] = useState("");
  const [variantCount, setVariantCount] = useState(2);

  /* ── Reporting ── */
  const [affiliateId, setAffiliateId] = useState("");
  const [parentAffiliateId, setParentAffiliateId] = useState("");

  /* ── UI ── */
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setToast("Transactional campaign saved successfully!");
    setTimeout(() => setToast(null), 3000);
  }

  /* ── Saved screen ── */
  if (saved) {
    return (
      <div className="app-page">
        <div className="page-header">
          <div className="page-header-main">
            <h1 className="page-title">Transactional Campaign Created</h1>
          </div>
        </div>
        <div className="bui-box" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
          <h2 style={{ marginBottom: 8 }}>Campaign Created</h2>
          <p className="text-muted mb-16">
            "{campaignName}" has been saved as a Transactional campaign.
            Trigger configuration and campaign settings were saved together.
          </p>
          <div
            className="btn-group"
            style={{ justifyContent: "center", marginTop: 24 }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/campaigns")}
            >
              View All Campaigns
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

  /* ══════════════════════════════════════════════════════════════════
     Main form — user was already validated on the questionnaire page
     ══════════════════════════════════════════════════════════════════ */

  return (
    <div className="app-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">New Transactional Campaign</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <span className="badge badge-outline">
              {CHANNEL_LABELS[channel]}
            </span>
            <span className="badge badge-constructive">Transactional</span>
            <span className="badge badge-draft">Draft</span>
          </div>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/campaigns")}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-large"
            disabled={!campaignName}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>

      {/* Validated banner */}
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
      </div>

      {/* ═══ Section 1: Campaign Name ═══ */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Campaign Information
        </div>
        <div className="form-group">
          <label className="form-label">Campaign Name</label>
          <input
            className="form-input"
            placeholder="e.g., booking_confirmation_email"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            maxLength={50}
          />
          <div className="text-muted" style={{ marginTop: 4, fontSize: 12 }}>
            {campaignName.length}/50 chars
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Describe the purpose of this transactional campaign..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* ═══ Section 2: Input Configuration (Topic) ═══ */}
      <div className="bui-box">
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

      </div>

      {/* ═══ Section 3: Content ═══ */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Content
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
              <option>informational</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Content ID</label>
          <input className="form-input" placeholder="Select content..." />
        </div>
      </div>

      {/* ═══ Section 4: Experiment ═══ */}
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
              No experiment configured. Set up an A/B test to compare content
              variants.
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
                  style={{ fontWeight: 400, marginLeft: 8, fontSize: 12 }}
                >
                  For automatic stage tracking, tag should begin with "emk",
                  "mm_email", or "attr_mm_email"
                </span>
              </label>
              <input
                className="form-input"
                placeholder="e.g., emk_booking_conf_experiment"
                value={experimentTag}
                onChange={(e) => setExperimentTag(e.target.value)}
              />
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
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
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label className="form-label">Content ID</label>
                    <input className="form-input" placeholder="Select content..." />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tracking Label</label>
                    <input className="form-input" placeholder={`variant_${i + 1}`} />
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

      {/* ═══ Section 5: Reporting Settings ═══ */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Reporting Settings
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Affiliate ID</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g., 123456"
              value={affiliateId}
              onChange={(e) => setAffiliateId(e.target.value)}
            />
            <div className="text-muted" style={{ marginTop: 4, fontSize: 12 }}>
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
            <div className="text-muted" style={{ marginTop: 4, fontSize: 12 }}>
              Required to publish.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom save */}
      <div className="btn-group">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/campaigns")}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-large"
          disabled={!campaignName}
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
