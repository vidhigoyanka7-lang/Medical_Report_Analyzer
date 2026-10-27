import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown.jsx — shows AI text (which uses **bold**, lists, headings) as normal,
 * readable text instead of raw symbols. Styled with the same Tailwind look as the app.
 */
const components = {
  h1: (p) => <h3 className="text-base font-extrabold text-navy mt-4 mb-1.5 first:mt-0" {...p} />,
  h2: (p) => <h3 className="text-sm font-extrabold text-navy mt-4 mb-1.5 first:mt-0" {...p} />,
  h3: (p) => <h4 className="text-sm font-bold text-navy mt-3 mb-1" {...p} />,
  p:  (p) => <p className="mb-2 last:mb-0" {...p} />,
  ul: (p) => <ul className="list-disc pl-5 mb-2 space-y-1" {...p} />,
  ol: (p) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...p} />,
  strong: (p) => <strong className="font-bold text-navy" {...p} />,
  hr: () => <hr className="my-3 border-slate-200" />,
  a: (p) => <a className="text-royal font-semibold hover:underline break-words" target="_blank" rel="noreferrer" {...p} />,
  table: (p) => <div className="overflow-x-auto mb-2"><table className="text-xs border-collapse" {...p} /></div>,
  th: (p) => <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-bold" {...p} />,
  td: (p) => <td className="border border-slate-200 px-2 py-1" {...p} />,
};

export default function Markdown({ text }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{text || ""}</ReactMarkdown>;
}
