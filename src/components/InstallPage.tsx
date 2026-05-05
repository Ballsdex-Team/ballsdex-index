import { useState } from 'react';

const EXAMPLE_SNIPPET = `[[ballsdex.packages]]
location = "git+https://github.com/author/package.git@main"
path = "package-name"
enabled = true`;

const CONFIG_PATH = 'config/extra.toml';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="absolute right-2 top-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="relative mt-3">
      <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-[#0d0d0d] px-4 py-3 font-mono text-xs leading-relaxed text-zinc-300">
        {children}
      </pre>
      <CopyButton text={children} />
    </div>
  );
}

export function InstallPage() {
  const steps = [
    {
      n: 1,
      title: (
        <>
          Create <Code>{CONFIG_PATH}</Code> if it doesn't exist
        </>
      ),
      body: (
        <>
          In the root of your Ballsdex bot, make sure the{' '}
          <Code>extra/</Code> folder exists and create{' '}
          <Code>config/extra.toml</Code> if it isn't there yet.
          <CodeBlock>{`# config/extra.toml
# Add your packages below`}</CodeBlock>
        </>
      ),
    },
    {
      n: 2,
      title: 'Find the package you want to install',
      body: (
        <>
          Browse the <strong className="text-zinc-200">Packages</strong> tab and
          click <strong className="text-zinc-200">Installation</strong> on the
          card for the package you want. Copy the snippet using the{' '}
          <strong className="text-zinc-200">Copy</strong> button.
        </>
      ),
    },
    {
      n: 3,
      title: (
        <>
          Paste the snippet into <Code>config/extra.toml</Code>
        </>
      ),
      body: (
        <>
          Each package needs one <Code>[[ballsdex.packages]]</Code> block.
          You can add as many as you like — one per package:
          <CodeBlock>{EXAMPLE_SNIPPET}</CodeBlock>
          <p className="mt-3 text-xs text-zinc-500">
            The <Code>location</Code> field is the git URL pinned to a version
            or branch. The <Code>path</Code> field is the Python package name
            from its <Code>pyproject.toml</Code>.
          </p>
        </>
      ),
    },
    {
      n: 4,
      title: 'Restart your bot',
      body: (
        <>
          Save the file and restart Ballsdex. The package will be loaded
          automatically on startup. If something goes wrong, check the bot logs
          — a missing or misnamed <Code>path</Code> is the most common cause.
        </>
      ),
    },
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-white">Installing a Package</h1>
      <p className="mb-10 text-sm text-zinc-400">
        Packages are configured in <Code>config/extra.toml</Code> inside your
        Ballsdex bot directory. Follow the steps below to add one.
      </p>

      <ol className="flex flex-col gap-8">
        {steps.map(step => (
          <li key={step.n} className="flex gap-4">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 font-mono text-xs font-semibold text-zinc-300">
              {step.n}
            </span>
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-zinc-100">{step.title}</p>
              <div className="text-sm leading-relaxed text-zinc-400">{step.body}</div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
