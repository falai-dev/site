import { Link } from "react-router-dom";

const QUICKSTART = `import { Agent, OpenAIProvider } from "@falai/agent";

const agent = new Agent({
  name: "Booking Bot",
  provider: new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});

agent.route("book")
  .collect({
    hotel: { type: "string" },
    guests: { type: "number" },
    date: { type: "string", format: "date" },
  })
  .then(async ({ data }) => {
    return \`Booked \${data.hotel} for \${data.guests} on \${data.date}.\`;
  });

await agent.send("Book Grand Hotel for 2 next Friday");`;

const FEATURES = [
  {
    title: "Schema-driven extraction",
    body: "Define data contracts once. The model fills them — predictably, with validation built in.",
  },
  {
    title: "Routes you can reason about",
    body: "Conversations move through typed steps. Skip what's already known, run only what's missing.",
  },
  {
    title: "Pluggable providers",
    body: "OpenAI, Anthropic, Gemini, OpenRouter. Swap models without rewriting your flows.",
  },
  {
    title: "Tools with structure",
    body: "Tool calls run through your code with metadata, validation, and lifecycle hooks.",
  },
  {
    title: "Optional persistence",
    body: "Sessions survive restarts. Bring your DB or use a built-in adapter.",
  },
  {
    title: "TypeScript-first",
    body: "Generic Agent<TContext, TData> with full inference. No untyped escape hatches.",
  },
];

export function HomePage() {
  return (
    <div className="landing">
      <section className="landing__hero">
        <span className="landing__eyebrow">@falai/agent</span>
        <h1 className="landing__title">
          Type-safe AI agents
          <br />
          that act like code.
        </h1>
        <p className="landing__lede">
          A conversational state engine where the model understands and your code stays in
          control. Schema-driven, predictable, production-ready.
        </p>
        <div className="landing__actions">
          <Link to="/docs/guides/getting-started" className="btn btn--primary">
            Get started
          </Link>
          <Link to="/docs" className="btn btn--ghost">
            Browse docs
          </Link>
          <a
            className="btn btn--ghost"
            href="https://github.com/gusnips/falai"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </section>

      <section className="landing__quickstart">
        <div className="landing__section-head">
          <h2>Quick start</h2>
          <p>One agent, one route, one extraction. That's the whole thing.</p>
        </div>
        <div className="quickstart-card">
          <div className="quickstart-card__header">
            <span className="quickstart-card__dot" />
            <span className="quickstart-card__dot" />
            <span className="quickstart-card__dot" />
            <span className="quickstart-card__file">agent.ts</span>
          </div>
          <pre className="quickstart-card__code">
            <code>{QUICKSTART}</code>
          </pre>
        </div>
      </section>

      <section className="landing__features">
        <div className="landing__section-head">
          <h2>Why @falai/agent</h2>
          <p>
            Existing solutions are either too unpredictable to ship or too heavy to use. We
            picked the middle.
          </p>
        </div>
        <ul className="feature-grid">
          {FEATURES.map((f) => (
            <li key={f.title} className="feature-card">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing__cta">
        <h2>Ready to build?</h2>
        <p>The getting-started guide takes about ten minutes.</p>
        <div className="landing__actions">
          <Link to="/docs/guides/getting-started" className="btn btn--primary">
            Read the guide
          </Link>
          <Link to="/examples" className="btn btn--ghost">
            See examples
          </Link>
        </div>
      </section>
    </div>
  );
}
