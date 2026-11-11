import { getDetail } from './content';
import { ui } from './i18n';
import type { Lang } from './i18n';

// Expandable detail panel: longer description + key points + the actual lume
// source that produced the demo. Keyed by the API's English name (content.ts).
// showCode=false is used by Overview, whose sample source is always visible.
export default function Detail({ name, lang, showCode = true }: { name: string; lang: Lang; showCode?: boolean }) {
  const d = getDetail(name);
  if (!d) return null;
  const zh = lang === 'zh';
  return (
    <div className="detail">
      <p className="longdesc">{zh ? d.longZh : d.longEn}</p>
      <div className="points-label">{ui.pointsLabel[lang]}</div>
      <ul className="points">
        {(zh ? d.pointsZh : d.pointsEn).map((p, i) => <li key={i}>{p}</li>)}
      </ul>
      {showCode && d.code && (
        <>
          <div className="code-label">{ui.codeLabel[lang]}</div>
          <pre className="code">{d.code}</pre>
        </>
      )}
    </div>
  );
}
