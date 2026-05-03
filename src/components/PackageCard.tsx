import { useState } from 'react';
import type { Cog } from '../types';

function buildInstallSnippet(cog: Cog): string {
  const name = cog.name ?? cog.id;
  const version = cog.version ? `@v${cog.version}` : '';
  const branch = cog.branch ? `#${cog.branch}` : '';
  const location = `git+${cog.repo}.git${version}${branch}`;
  return `[[ballsdex.packages]]\nlocation = "${location}"\npath = "${name}"\nenabled = true`;
}

function getLicenseText(license: Cog['license']): string {
  if (!license) return '';
  if (typeof license === 'string') return license;
  return license.text ?? '';
}

function getAuthorNames(authors: Cog['authors']): string[] {
  if (!authors) return [];
  return authors
    .map(a => (typeof a === 'string' ? a : a.name))
    .filter(Boolean) as string[];
}

export function PackageCard({ cog }: { cog: Cog }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const snippet = buildInstallSnippet(cog);
  const authors = getAuthorNames(cog.authors);
  const license = getLicenseText(cog.license);

  function handleCopy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <article className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-zinc-800 bg-[#1a1a1a] p-5 shadow-md transition-all duration-200 hover:border-zinc-600 hover:bg-[#1f1f1f] hover:shadow-xl">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">
            {cog.name ?? cog.id}
          </h3>
          {cog.version && (
            <span className="mt-0.5 inline-block rounded-full border border-emerald-800/60 bg-emerald-950/60 px-2 font-mono text-xs text-emerald-400">
              v{cog.version}
            </span>
          )}
        </div>
        {cog.repo && (
          <a
            href={cog.repo}
            target="_blank"
            rel="noopener noreferrer"
            title="View repository"
            className="mt-0.5 shrink-0 text-zinc-500 transition-colors hover:text-white group-hover:text-zinc-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>

      {/* Description */}
      <p className="flex-1 text-sm leading-relaxed text-zinc-400">
        {cog.description ?? 'No description provided.'}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        {authors.length > 0 && <span>{authors.join(', ')}</span>}
        {license && (
          <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-zinc-400">
            {license}
          </span>
        )}
      </div>

      {/* Install */}
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Installation
        </button>

        {open && (
          <div className="relative mt-2">
            <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-[#0d0d0d] px-4 py-3 font-mono text-xs leading-relaxed text-zinc-300">
              {snippet}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute right-2 top-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
