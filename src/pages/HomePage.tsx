import { Link } from "react-router-dom";
import { LazyCodeBlock } from "../components/CodeBlock.lazy";
import { startHereRoute } from "../lib/content";

const INSTALL = `bun add @falai/agent`;

const FIRST_CALL = `const r = await agent.turn({ sessionId: "demo", message: "hi" });
console.log(r.messages[0]?.text); // something like "Hi! What should I call you?"`;

const QUICKSTART = `import { falai, GeminiProvider } from "@falai/agent";

const f = falai().fields({
  name: { type: "string", ask: "Ask for the person's name. Do not sound like a form." },
});

const agent = f.agent({
  name: "Ana",
  provider: new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY ?? "", model: "gemini-2.5-flash" }),
  flows: [
    f.flow({
      id: "welcome",
      name: "Welcome",
      on: [{ message: [] }],
      steps: [
        { id: "name", collect: ["name"] },
        { id: "help", prompt: "Thank them by name and ask how you can help." },
      ],
    }),
  ],
});

const r = await agent.turn({ sessionId: "demo", message: "hi" });
console.log(r.messages[0]?.text);`;

const FEATURES = [
  {
    title: "Flows with steps",
    body: "A flow is a trigger plus an ordered list of steps. A step talks, sends fixed text, runs your code, waits or branches.",
  },
  {
    title: "Fields declared once",
    body: "Say what each piece of data is and how to ask for it. The user can answer in any order, and a step is skipped when its data is already known.",
  },
  {
    title: "At most two model calls per turn",
    body: "One call understands the message. One call writes the reply. Every result reports llmCalls, so you can test the budget.",
  },
  {
    title: "One call, everything to do",
    body: "agent.turn() takes a message, a wake-up, an event or a start. It returns the messages to send and the wake-ups to schedule. It never sends, sleeps or saves.",
  },
  {
    title: "You own the storage",
    body: "A Store has load and save. Memory, Postgres, Prisma, Redis, Mongo, SQLite and OpenSearch stores come with the package.",
  },
  {
    title: "Flows as JSON",
    body: "A FlowSpec is a flow stored as JSON. fromSpec turns it into a flow, so a flow written in an editor or a chat is the same object as one written in TypeScript.",
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
          Define flows, steps and tools in TypeScript. The AI is called only to understand what
          the customer wrote and to write the reply. Your code decides the rest.
        </p>
        <div className="landing__actions">
          <Link to={startHereRoute} className="btn btn--primary">
            Get started
          </Link>
          <Link to="/docs" className="btn btn--ghost">
            Browse docs
          </Link>
          <Link to="/docs/migration/v3-to-v4" className="btn btn--ghost">
            Coming from 3.x?
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
          <p>Install the package, then run one turn. The agent behind that call is below.</p>
        </div>
        <LazyCodeBlock code={INSTALL} language="bash" filename="terminal" />
        <LazyCodeBlock code={FIRST_CALL} language="typescript" filename="turn.ts" />
        <LazyCodeBlock code={QUICKSTART} language="typescript" filename="ana.ts" />
      </section>

      <section className="landing__features">
        <div className="landing__section-head">
          <h2>Why @falai/agent</h2>
          <p>
            Version 4 has one model: a flow starts when something happens, then runs its steps.
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
        <p>The tutorial builds one agent in five short pages.</p>
        <div className="landing__actions">
          <Link to={startHereRoute} className="btn btn--primary">
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
