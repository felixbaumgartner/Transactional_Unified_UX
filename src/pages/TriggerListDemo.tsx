import { useState } from "react";

interface MockTrigger {
  id: number;
  name: string;
  description: string;
  channel: "email" | "notification" | "sms";
  status: "DRAFT" | "LIVE" | "ARCHIVED" | "TEST";
  createdAt: string;
  updatedAt: string;
  changedBy: string;
}

const mockTriggers: MockTrigger[] = [
  {
    id: 501,
    name: "booking_confirmation_trigger",
    description:
      "Sends booking confirmation email when a new reservation is created",
    channel: "email",
    status: "LIVE",
    createdAt: "1 Feb 2026",
    updatedAt: "8 Mar 2026",
    changedBy: "trip-comms",
  },
  {
    id: 502,
    name: "otp_sms_trigger",
    description: "Sends OTP verification code via SMS",
    channel: "sms",
    status: "LIVE",
    createdAt: "15 Jan 2026",
    updatedAt: "7 Mar 2026",
    changedBy: "identity-team",
  },
  {
    id: 503,
    name: "review_invite_trigger",
    description: "Post-checkout review invitation email",
    channel: "email",
    status: "LIVE",
    createdAt: "20 Feb 2026",
    updatedAt: "6 Mar 2026",
    changedBy: "ugc-team",
  },
  {
    id: 504,
    name: "cart_abandonment_trigger",
    description: "Push notification for abandoned search/cart",
    channel: "notification",
    status: "LIVE",
    createdAt: "10 Feb 2026",
    updatedAt: "5 Mar 2026",
    changedBy: "convert-team",
  },
  {
    id: 505,
    name: "checkin_reminder_trigger",
    description: "Pre-arrival check-in reminder push notification",
    channel: "notification",
    status: "DRAFT",
    createdAt: "28 Feb 2026",
    updatedAt: "4 Mar 2026",
    changedBy: "trip-enrichment",
  },
];

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "LIVE"
      ? "badge badge-live"
      : status === "DRAFT"
        ? "badge badge-draft"
        : status === "ARCHIVED"
          ? "badge badge-archived"
          : "badge badge-callout";
  return <span className={cls}>{status}</span>;
}

function ChannelBadge({ channel }: { channel: string }) {
  const label =
    channel === "email" ? "Email" : channel === "sms" ? "SMS" : "Notifications";
  return <span className="badge badge-outline">{label}</span>;
}

export default function TriggerListDemo() {
  const [filterText, setFilterText] = useState("");
  const [filterChannel, setFilterChannel] = useState("all");
  const [sortField, setSortField] = useState("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = mockTriggers
    .filter((t) => {
      if (
        filterText &&
        !t.name.toLowerCase().includes(filterText.toLowerCase()) &&
        !t.description.toLowerCase().includes(filterText.toLowerCase())
      )
        return false;
      if (filterChannel !== "all" && t.channel !== filterChannel) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "rule_name") return a.name.localeCompare(b.name) * dir;
      return a.id > b.id ? dir : -dir;
    });

  return (
    <div className="app-page">
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">Trigger Rules</h1>
          <p className="page-subtitle">
            Trigger rules are managed as part of transactional campaigns. View
            existing rules below.
          </p>
        </div>
      </div>

      <div className="filter-card">
        <div className="filter-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter</label>
            <input
              className="form-input"
              placeholder="Filter by Name or Description"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Channel</label>
            <select
              className="form-select"
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
            >
              <option value="all">All</option>
              <option value="email">Email</option>
              <option value="notification">Notification</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-card">
        <div className="results-header">
          <div className="results-count">
            {filtered.length}{" "}
            {filtered.length === 1 ? "trigger" : "triggers"} total
          </div>
          <div className="results-sort">
            <span className="results-sort-label">Sort by</span>
            <select
              className="form-select"
              style={{ width: "auto" }}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="rule_name">Name</option>
            </select>
            <button
              className="btn btn-secondary"
              style={{ padding: "6px 10px" }}
              onClick={() =>
                setSortDir((d) => (d === "asc" ? "desc" : "asc"))
              }
            >
              {sortDir === "asc" ? "\u2191" : "\u2193"}
            </button>
          </div>
        </div>

        <div className="results-list">
          {filtered.map((t) => (
            <div key={t.id} className="list-card">
              <div className="list-card-content">
                <div className="list-card-title">
                  <span>{t.name}</span>
                  <ChannelBadge channel={t.channel} />
                  <StatusBadge status={t.status} />
                </div>
                {t.description && (
                  <div className="list-card-subtitle">{t.description}</div>
                )}
                <div className="list-card-meta">
                  <span className="badge badge-media">
                    Created {t.createdAt}
                  </span>
                  <span className="badge badge-media">
                    Updated {t.updatedAt} by {t.changedBy}
                  </span>
                </div>
              </div>
              <div className="list-card-actions">
                <button
                  className="btn btn-tertiary"
                  style={{ fontSize: 12 }}
                  title="Campaigns using this trigger"
                >
                  Campaigns
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
