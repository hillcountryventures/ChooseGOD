/**
 * Journey PDF Export
 * 
 * Generates a beautiful PDF document of the user's spiritual journey.
 */

import { SpiritualMoment, MomentType } from '../types';
import { MOMENT_ICONS } from '../components/journey/constants';

/**
 * Generate HTML for PDF export of spiritual journey moments.
 */
export function generateJourneyPDF(moments: SpiritualMoment[]): string {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMomentIcon = (type: MomentType): string => {
    const icons: Record<MomentType, string> = {
      journal: '📖',
      prayer: '🙏',
      devotional: '☀️',
      gratitude: '✨',
      confession: '💧',
      memory_practice: '💡',
      obedience_step: '✅',
      lectio: '🌿',
      examen: '🌙',
      answered_prayer: '🏆',
    };
    return icons[type] || '📝';
  };

  const getMomentLabel = (type: MomentType): string => {
    const config = MOMENT_ICONS[type];
    return config?.label || type;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=Inter:wght@400;500;600&display=swap');

          * { box-sizing: border-box; }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0a0f;
            color: #e4e4e7;
            padding: 48px;
            margin: 0;
            line-height: 1.6;
          }

          .header {
            text-align: center;
            margin-bottom: 48px;
            padding-bottom: 32px;
            border-bottom: 1px solid #27272a;
          }

          .logo {
            font-size: 14px;
            letter-spacing: 2px;
            color: #6366f1;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          h1 {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 36px;
            font-weight: 600;
            color: #fafafa;
            margin: 16px 0 8px;
          }

          .subtitle {
            color: #71717a;
            font-size: 14px;
          }

          .stats {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-top: 24px;
          }

          .stat {
            text-align: center;
          }

          .stat-number {
            font-size: 28px;
            font-weight: 600;
            color: #6366f1;
          }

          .stat-label {
            font-size: 12px;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .entry {
            background: #18181b;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            border: 1px solid #27272a;
            page-break-inside: avoid;
          }

          .entry-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #27272a;
          }

          .entry-icon {
            font-size: 20px;
          }

          .entry-type {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6366f1;
          }

          .entry-date {
            margin-left: auto;
            font-size: 12px;
            color: #71717a;
          }

          .entry-content {
            font-size: 15px;
            line-height: 1.7;
            color: #d4d4d8;
            white-space: pre-wrap;
          }

          .entry-verse {
            margin-top: 16px;
            padding: 12px 16px;
            background: rgba(99, 102, 241, 0.1);
            border-left: 3px solid #6366f1;
            border-radius: 0 8px 8px 0;
          }

          .verse-ref {
            font-size: 12px;
            font-weight: 600;
            color: #6366f1;
            margin-bottom: 4px;
          }

          .verse-text {
            font-family: 'Crimson Pro', Georgia, serif;
            font-style: italic;
            font-size: 14px;
            color: #a1a1aa;
          }

          .themes {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 16px;
          }

          .theme-tag {
            background: rgba(99, 102, 241, 0.15);
            color: #818cf8;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }

          .footer {
            margin-top: 48px;
            text-align: center;
            padding-top: 24px;
            border-top: 1px solid #27272a;
            color: #52525b;
            font-size: 12px;
          }

          .footer a {
            color: #6366f1;
            text-decoration: none;
          }

          @media print {
            body { background: #0a0a0f; }
            .entry { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ChooseGOD</div>
          <h1>My Spiritual Journey</h1>
          <p class="subtitle">A record of God's faithfulness in my life</p>

          <div class="stats">
            <div class="stat">
              <div class="stat-number">${moments.length}</div>
              <div class="stat-label">Moments</div>
            </div>
            <div class="stat">
              <div class="stat-number">${moments.filter(m => m.momentType === 'prayer').length}</div>
              <div class="stat-label">Prayers</div>
            </div>
            <div class="stat">
              <div class="stat-number">${moments.filter(m => m.linkedVerses && m.linkedVerses.length > 0).length}</div>
              <div class="stat-label">Scriptures</div>
            </div>
          </div>
        </div>

        ${moments.map(moment => `
          <div class="entry">
            <div class="entry-header">
              <span class="entry-icon">${getMomentIcon(moment.momentType)}</span>
              <span class="entry-type">${getMomentLabel(moment.momentType)}</span>
              <span class="entry-date">${formatDate(moment.createdAt)}</span>
            </div>

            <div class="entry-content">${moment.content}</div>

            ${moment.linkedVerses && moment.linkedVerses.length > 0 ? `
              <div class="entry-verse">
                <div class="verse-ref">${moment.linkedVerses[0].book} ${moment.linkedVerses[0].chapter}:${moment.linkedVerses[0].verse}</div>
                <div class="verse-text">"${moment.linkedVerses[0].text}"</div>
              </div>
            ` : ''}

            ${moment.themes && moment.themes.length > 0 ? `
              <div class="themes">
                ${moment.themes.map(t => `<span class="theme-tag">#${t}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}

        <div class="footer">
          <p>Generated with ChooseGOD</p>
          <p>"We are not God, only helping others find HIM"</p>
        </div>
      </body>
    </html>
  `;
}
