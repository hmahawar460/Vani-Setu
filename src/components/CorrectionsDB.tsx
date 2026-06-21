import { useCallback, useEffect, useState } from 'react';
import { deleteCorrection, fetchCorrections, subscribeCorrections, type CorrectionEntry } from '../services/corrections';

/**
 * Panel that shows all stored user corrections and lets them delete entries.
 */
export function CorrectionsDB() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<CorrectionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingRaw, setDeletingRaw] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCorrections();
      // Sort by most recently updated
      setEntries(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return subscribeCorrections(load);
  }, [load]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleDelete = async (raw: string) => {
    setDeletingRaw(raw);
    try {
      await deleteCorrection(raw);
      setEntries((prev) => prev.filter((e) => e.raw !== raw));
    } finally {
      setDeletingRaw(null);
    }
  };

  return (
    <div className="corrections-db">
      <button
        type="button"
        className="corrections-db__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
          <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.06 15.96 0 13.36 0c-1.26 0-2.4.49-3.27 1.28L9 2.36 7.91 1.28C7.04.49 5.9 0 4.64 0 2.04 0 0 2.06 0 4.64c0 .48.11.92.18 1.36H0v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
        </svg>
        मेरे सुधार ({entries.length || '…'})
        <span aria-hidden="true">{open ? ' ▲' : ' ▼'}</span>
      </button>

      {open && (
        <div className="corrections-db__panel">
          {loading && <p className="corrections-db__loading">लोड हो रहा है…</p>}

          {!loading && entries.length === 0 && (
            <p className="corrections-db__empty">
              अभी कोई सुधार सहेजा नहीं गया।<br />
              जब आप "सही किया हुआ" वाले टेक्स्ट को सुधारकर सहेजेंगे, वह यहाँ दिखेगा।
            </p>
          )}

          {!loading && entries.length > 0 && (
            <>
              <p className="corrections-db__info">
                ये शब्द/वाक्य अगली बार अपने आप सुधर जाएंगे।
              </p>
              <div className="corrections-db__table-wrap">
                <table className="corrections-db__table">
                  <thead>
                    <tr>
                      <th>गलत / पुराना</th>
                      <th>सही</th>
                      <th>बार</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.raw}>
                        <td lang="hi" className="corrections-db__raw">{entry.raw}</td>
                        <td lang="hi" className="corrections-db__corrected">{entry.corrected}</td>
                        <td className="corrections-db__count">{entry.count}</td>
                        <td>
                          <button
                            type="button"
                            className="corrections-db__delete"
                            onClick={() => handleDelete(entry.raw)}
                            disabled={deletingRaw === entry.raw}
                            aria-label={`"${entry.raw}" हटाएं`}
                            title="हटाएं"
                          >
                            {deletingRaw === entry.raw ? '…' : '✕'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <button type="button" className="corrections-db__refresh" onClick={load}>
            ↻ ताज़ा करें
          </button>
        </div>
      )}
    </div>
  );
}
