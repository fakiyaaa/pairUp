import { useState } from "react";
import { useNavigate } from "react-router-dom";

const INTERVIEW_TYPES = ["Technical", "Behavioral", "Case Study", "Product"];
const TOPICS = [
  "Data Structures",
  "Algorithms",
  "System Design",
  "Dynamic Programming",
  "Machine Learning",
  "Product Sense",
  "Metrics",
  "Strategy",
  "Market Sizing",
  "Profitability",
  "Go-to-Market",
  "Leadership",
  "Conflict Resolution",
  "React",
  "Node.js",
  "API Design",
  "Python",
  "SQL",
  "Statistics",
  "Brain Teasers"
];

const ROLE_OPTIONS = [
  {
    label: "I want to practice",
    description: "Find interviewers who can run mock sessions for you",
    value: "interviewee"
  },
  {
    label: "I can run interviews",
    description: "Help peers prep by conducting structured mock interviews",
    value: "interviewer"
  },
  {
    label: "Both",
    description: "Give and get - swap roles depending on the session",
    value: "both"
  }
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    role: "",
    interview_types: [],
    topics: [],
    calendly_url: ""
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInArray = (field, value) => {
    setForm((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists ? prev[field].filter((item) => item !== value) : [...prev[field], value]
      };
    });
  };

  const canContinue =
    (step === 1 && form.name.trim() !== "" && form.bio.trim() !== "") ||
    (step === 2 && form.role !== "") ||
    step === 3 ||
    step === 4;

  const submitProfile = async (calendlyUrl) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const id = crypto.randomUUID();
      localStorage.setItem("user_id", id);

      const payload = {
        id,
        name: form.name.trim(),
        bio: form.bio.trim(),
        role: form.role,
        interview_types: form.interview_types.join(","),
        topics: form.topics.join(","),
        calendly_url: calendlyUrl,
        created_at: new Date().toISOString()
      };

      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to create profile");
      }

      navigate("/browse");
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!canContinue || isSubmitting) return;

    if (step < 4) {
      setStep((prev) => prev + 1);
      return;
    }

    submitProfile(form.calendly_url.trim());
  };

  const handleBack = () => {
    if (isSubmitting) return;
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSkip = () => {
    submitProfile("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.stepText}>Step {step} of 4</p>

        {step === 1 && (
          <>
            <h1 style={styles.title}>Tell us about yourself</h1>
            <div style={styles.section}>
              <label style={styles.label} htmlFor="name">
                Your name
              </label>
              <input
                id="name"
                style={styles.input}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div style={styles.section}>
              <label style={styles.label} htmlFor="bio">
                Short bio
              </label>
              <textarea
                id="bio"
                style={styles.textarea}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value.slice(0, 160))}
                placeholder="Write a short bio"
                maxLength={160}
                rows={4}
              />
              <p style={styles.helperText}>{form.bio.length}/160</p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={styles.title}>What&apos;s your role?</h1>
            <div style={styles.stack}>
              {ROLE_OPTIONS.map((option) => {
                const selected = form.role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("role", option.value)}
                    style={{
                      ...styles.selectCard,
                      borderColor: selected ? "#111111" : "#DDDDDD",
                      backgroundColor: selected ? "#FFF7D6" : "#FFFFFF"
                    }}
                  >
                    <span style={styles.selectCardTitle}>{option.label}</span>
                    <span style={styles.selectCardDescription}>{option.description}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={styles.title}>Your preferences</h1>

            <div style={styles.section}>
              <h2 style={styles.subTitle}>Interview types</h2>
              <div style={styles.typeGrid}>
                {INTERVIEW_TYPES.map((type) => {
                  const selected = form.interview_types.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleInArray("interview_types", type)}
                      style={{
                        ...styles.typeButton,
                        backgroundColor: selected ? "#111111" : "#FFFFFF",
                        color: selected ? "#FFFFFF" : "#111111"
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.subTitle}>Topics</h2>
              <div style={styles.chipWrap}>
                {TOPICS.map((topic) => {
                  const selected = form.topics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleInArray("topics", topic)}
                      style={{
                        ...styles.chip,
                        backgroundColor: selected ? "#111111" : "#FFFFFF",
                        color: selected ? "#FFFFFF" : "#444444"
                      }}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 style={styles.title}>Add your scheduling link</h1>
            <div style={styles.section}>
              <label style={styles.label} htmlFor="calendly">
                Calendly or booking link
              </label>
              <input
                id="calendly"
                style={styles.input}
                value={form.calendly_url}
                onChange={(e) => updateField("calendly_url", e.target.value)}
                placeholder="calendly.com/yourname"
              />
            </div>
          </>
        )}

        <div style={styles.footer}>
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            style={{
              ...styles.backButton,
              opacity: step === 1 ? 0.5 : 1,
              cursor: step === 1 ? "not-allowed" : "pointer"
            }}
          >
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue || isSubmitting}
              style={{
                ...styles.primaryButton,
                opacity: !canContinue ? 0.5 : 1,
                cursor: !canContinue ? "not-allowed" : "pointer"
              }}
            >
              Continue
            </button>
          ) : (
            <div style={styles.stepFourActions}>
              <button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting}
                style={styles.completeButton}
              >
                {isSubmitting ? "Saving..." : "Complete setup"}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                style={styles.skipLink}
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F5F3EE",
    padding: "32px 16px",
    display: "flex",
    justifyContent: "center",
    boxSizing: "border-box"
  },
  card: {
    width: "100%",
    maxWidth: "720px",
    backgroundColor: "#F5F3EE",
    color: "#111111",
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  },
  stepText: {
    margin: "0 0 12px",
    color: "#666666",
    fontSize: "14px"
  },
  title: {
    margin: "0 0 20px",
    fontSize: "40px",
    lineHeight: 1.1
  },
  section: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #D9D9D9",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "16px",
    backgroundColor: "#FFFFFF"
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #D9D9D9",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "16px",
    backgroundColor: "#FFFFFF",
    resize: "vertical"
  },
  helperText: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#777777",
    textAlign: "right"
  },
  stack: {
    display: "grid",
    gap: "12px"
  },
  selectCard: {
    border: "1px solid",
    borderRadius: "12px",
    padding: "14px",
    textAlign: "left",
    background: "#FFFFFF",
    cursor: "pointer"
  },
  selectCardTitle: {
    display: "block",
    fontWeight: 700,
    marginBottom: "4px"
  },
  selectCardDescription: {
    color: "#666666"
  },
  subTitle: {
    margin: "0 0 10px",
    fontSize: "22px"
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px"
  },
  typeButton: {
    border: "1px solid #CCCCCC",
    borderRadius: "12px",
    padding: "12px 10px",
    fontSize: "16px",
    cursor: "pointer"
  },
  chipWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  chip: {
    border: "1px solid #CCCCCC",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "14px",
    cursor: "pointer"
  },
  footer: {
    marginTop: "24px",
    display: "flex",
    gap: "12px",
    alignItems: "center"
  },
  backButton: {
    border: "1px solid #D0D0D0",
    backgroundColor: "#EFEFEF",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "16px"
  },
  primaryButton: {
    border: "none",
    backgroundColor: "#F5C518",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "16px",
    color: "#111111",
    fontWeight: 700
  },
  stepFourActions: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px"
  },
  completeButton: {
    width: "100%",
    border: "none",
    backgroundColor: "#F5C518",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "18px",
    fontWeight: 700,
    color: "#111111",
    cursor: "pointer"
  },
  skipLink: {
    border: "none",
    background: "transparent",
    color: "#777777",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "16px"
  }
};

export default Onboarding;
