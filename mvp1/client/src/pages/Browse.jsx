import { useEffect, useMemo, useState } from "react";

function getInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const initials = words.map((w) => w[0]?.toUpperCase() || "").join("");
  return initials || "U";
}

const AVATAR_COLORS = ["#B5D5C5", "#D5B5B5", "#B5C5D5", "#D5D5B5"];

function getAvatarColor(name, fallbackIndex) {
  const trimmed = String(name || "").trim();
  const first = trimmed[0] ? trimmed[0].toUpperCase() : "";
  const idxFromLetter = first >= "A" && first <= "Z" ? first.charCodeAt(0) - 65 : fallbackIndex;
  const idx = Number.isFinite(idxFromLetter) ? idxFromLetter : fallbackIndex;
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

const ROLE_BADGE = {
  interviewee: { label: "Practitioner", bg: "#C8E6C9" },
  interviewer: { label: "Interviewer", bg: "#B2EBF2" },
  both: { label: "Both", bg: "#E0E0E0" }
};

function parseCommaList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function Browse() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/profiles");
        if (!res.ok) throw new Error("Failed to load profiles");
        const data = await res.json();

        // Sort newest first by created_at (fallback to empty string).
        const sorted = Array.isArray(data)
          ? data
              .slice()
              .sort((a, b) => {
                const ta = Date.parse(String(a.created_at || ""));
                const tb = Date.parse(String(b.created_at || ""));
                const na = Number.isFinite(ta) ? ta : 0;
                const nb = Number.isFinite(tb) ? tb : 0;
                return nb - na;
              })
          : [];

        if (!cancelled) setProfiles(sorted);
      } catch (e) {
        if (!cancelled) setError("Could not load profiles.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfiles();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => profiles, [profiles]);

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>Browse</h1>

      {loading && <p style={styles.loading}>Loading profiles...</p>}
      {!loading && error && <p style={styles.error}>{error}</p>}

      {!loading &&
        !error &&
        cards.map((profile, idx) => {
          const role = profile.role || "";
          const badge = ROLE_BADGE[role] || { label: role || "—", bg: "#E0E0E0" };
          const interviewTypes = parseCommaList(profile.interview_types);
          const topics = parseCommaList(profile.topics);
          const initials = getInitials(profile.name);
          const avatarColor = getAvatarColor(profile.name, idx);
          const calendlyUrl = String(profile.calendly_url || "");

          return (
            <div key={profile.id || idx}>
              <div style={styles.card}>
                <div style={styles.cardRow}>
                  <div style={{ ...styles.avatar, backgroundColor: avatarColor }}>
                    {initials}
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.nameRow}>
                      <div style={styles.name}>{profile.name || "Unnamed"}</div>
                      <span style={{ ...styles.roleBadge, backgroundColor: badge.bg }}>
                        {badge.label}
                      </span>
                    </div>

                    {profile.bio ? (
                      <div style={styles.bio} title={profile.bio}>
                        {profile.bio}
                      </div>
                    ) : null}

                    <div style={styles.tagsRow}>
                      {interviewTypes.map((t) => (
                        <span key={t} style={styles.filledTag}>
                          {t}
                        </span>
                      ))}
                    </div>

                    <div style={styles.chipsRow}>
                      {topics.map((t) => (
                        <span key={t} style={styles.outlineChip}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {calendlyUrl ? (
                      <div style={styles.scheduleWrap}>
                        <button
                          type="button"
                          style={styles.scheduleButton}
                          onClick={() => window.open(calendlyUrl, "_blank", "noopener,noreferrer")}
                        >
                          Schedule →
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {idx < cards.length - 1 ? <div style={styles.divider} /> : null}
            </div>
          );
        })}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F5F3EE",
    padding: "32px 16px",
    boxSizing: "border-box",
    color: "#111111"
  },
  header: {
    margin: "0 0 18px",
    fontSize: "40px",
    fontWeight: 800
  },
  loading: {
    margin: "20px 0",
    color: "#666666"
  },
  error: {
    margin: "20px 0",
    color: "#B00020"
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "14px",
    border: "1px solid #E9E9E9",
    boxShadow: "0 1px 3px rgba(17, 17, 17, 0.08)",
    padding: "18px"
  },
  cardRow: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start"
  },
  avatar: {
    width: "58px",
    height: "58px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "16px",
    whiteSpace: "nowrap"
  },
  cardContent: {
    flex: 1,
    minWidth: 0
  },
  nameRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  name: {
    fontWeight: 800,
    fontSize: "18px"
  },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800
  },
  bio: {
    marginTop: "8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%"
  },
  tagsRow: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  filledTag: {
    backgroundColor: "#111111",
    color: "#FFFFFF",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 800,
    border: "1px solid #111111"
  },
  chipsRow: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  outlineChip: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9D9D9",
    color: "#444444",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 700
  },
  scheduleWrap: {
    marginTop: "14px"
  },
  scheduleButton: {
    width: "fit-content",
    border: "none",
    backgroundColor: "#F5C518",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer"
  },
  divider: {
    height: "1px",
    backgroundColor: "#E9E9E9",
    margin: "18px 0"
  }
};

export default Browse;
