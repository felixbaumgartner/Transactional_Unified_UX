import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface MockMessage {
  id: number;
  name: string;
  description: string;
  channel: "email" | "notification" | "sms";
  status: "Draft" | "Published" | "Live" | "Stopped";
  type: "marketing" | "non_marketing" | "transactional";
  pipeline: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

const mockMessages: MockMessage[] = [
  {
    id: 1001,
    name: "booking_confirmation_email",
    description: "Sends booking confirmation when a new reservation is created",
    channel: "email",
    status: "Live",
    type: "transactional",
    pipeline: "Transactional Priority",
    createdAt: "8 Mar 2026",
    updatedAt: "8 Mar 2026",
    updatedBy: "trip-comms",
  },
  {
    id: 1002,
    name: "otp_verification_sms",
    description: "OTP verification code via SMS",
    channel: "sms",
    status: "Live",
    type: "transactional",
    pipeline: "Transactional Priority",
    createdAt: "7 Mar 2026",
    updatedAt: "7 Mar 2026",
    updatedBy: "identity-team",
  },
  {
    id: 1003,
    name: "summer_deals_email",
    description: "Summer promotional deals email blast",
    channel: "email",
    status: "Published",
    type: "marketing",
    pipeline: "Scheduled: Daily EMK",
    createdAt: "5 Mar 2026",
    updatedAt: "5 Mar 2026",
    updatedBy: "engage-team",
  },
  {
    id: 1004,
    name: "payment_receipt_email",
    description: "Payment receipt after successful payment",
    channel: "email",
    status: "Draft",
    type: "transactional",
    pipeline: "Transactional Priority",
    createdAt: "2 Mar 2026",
    updatedAt: "4 Mar 2026",
    updatedBy: "payments-team",
  },
  {
    id: 1005,
    name: "genius_promo_push",
    description: "Genius level promotional push notification",
    channel: "notification",
    status: "Published",
    type: "marketing",
    pipeline: "Scheduled: Daily Notifications",
    createdAt: "3 Mar 2026",
    updatedAt: "3 Mar 2026",
    updatedBy: "genius-team",
  },
  {
    id: 1006,
    name: "checkin_reminder_push",
    description: "Pre-arrival check-in reminder notification",
    channel: "notification",
    status: "Live",
    type: "non_marketing",
    pipeline: "Trigger: checkin_reminder",
    createdAt: "6 Mar 2026",
    updatedAt: "6 Mar 2026",
    updatedBy: "trip-enrichment",
  },
  {
    id: 1007,
    name: "review_request_email",
    description: "Post-checkout review invitation email",
    channel: "email",
    status: "Draft",
    type: "non_marketing",
    pipeline: "Trigger: review_invite",
    createdAt: "4 Mar 2026",
    updatedAt: "4 Mar 2026",
    updatedBy: "ugc-team",
  },
  {
    id: 1008,
    name: "cart_abandonment_push",
    description: "Push notification for abandoned search/cart",
    channel: "notification",
    status: "Live",
    type: "marketing",
    pipeline: "Trigger: cart_abandon",
    createdAt: "10 Feb 2026",
    updatedAt: "5 Mar 2026",
    updatedBy: "convert-team",
  },
];

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Published" || status === "Live"
      ? "badge badge-published"
      : status === "Stopped"
        ? "badge badge-stopped"
        : "badge badge-draft";
  return <span className={cls}>{status}</span>;
}

function TypeBadge({ type }: { type: string }) {
  if (type === "transactional")
    return <span className="badge badge-constructive">Transactional</span>;
  if (type === "non_marketing")
    return <span className="badge badge-outline">Non-marketing</span>;
  return <span className="badge badge-marketing">Marketing</span>;
}

function ChannelBadge({ channel }: { channel: string }) {
  const label =
    channel === "email" ? "Email" : channel === "sms" ? "SMS" : "Notifications";
  return <span className="badge badge-outline">{label}</span>;
}

export default function MessageListDemo() {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState("");
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortField, setSortField] = useState("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = mockMessages
    .filter((m) => {
      if (
        filterText &&
        !m.name.toLowerCase().includes(filterText.toLowerCase()) &&
        !m.description.toLowerCase().includes(filterText.toLowerCase())
      )
        return false;
      if (filterChannel !== "all" && m.channel !== filterChannel) return false;
      if (filterType !== "all" && m.type !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") return a.name.localeCompare(b.name) * dir;
      return a.id > b.id ? dir : -dir;
    });

  return (
    <div className="app-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">All Messages</h1>
          <p className="page-subtitle">
            Unified view of marketing, non-marketing, and transactional messages
          </p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/message/new")}
          >
            + New Message
          </button>
        </div>
      </div>

      {/* Filter card */}
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Message Type</label>
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="marketing">Marketing</option>
              <option value="non_marketing">Non-marketing</option>
              <option value="transactional">Transactional</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-select">
              <option value="all">All</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Live">Live</option>
              <option value="Stopped">Stopped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results card */}
      <div className="results-card">
        <div className="results-header">
          <div className="results-count">
            {filtered.length}{" "}
            {filtered.length === 1 ? "Message" : "Messages"} total
          </div>
          <div className="results-sort">
            <span className="results-sort-label">Sort by</span>
            <select
              className="form-select"
              style={{ width: "auto" }}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="updated_at">Updated Date</option>
              <option value="created_at">Created Date</option>
              <option value="name">Name</option>
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
          {filtered.map((m) => (
            <div key={m.id} className="list-card">
              <div className="list-card-content">
                <div className="list-card-title">
                  <span>{m.name}</span>
                  <TypeBadge type={m.type} />
                  <ChannelBadge channel={m.channel} />
                  <StatusBadge status={m.status} />
                </div>

                {m.description && (
                  <div className="list-card-subtitle">{m.description}</div>
                )}

                <div className="list-card-meta">
                  <span className="badge badge-media">{m.pipeline}</span>
                  <span className="badge badge-media">
                    Created {m.createdAt}
                  </span>
                  <span className="badge badge-media">
                    Updated {m.updatedAt} by {m.updatedBy}
                  </span>
                  <span className="badge badge-media">ID: {m.id}</span>
                </div>
              </div>

              <div className="list-card-actions">
                <button
                  className="btn btn-tertiary"
                  style={{ fontSize: 12 }}
                  title="Clone"
                >
                  Clone
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
