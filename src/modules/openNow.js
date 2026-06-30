// Live "open now / closed" badge, computed against Israel wall-clock so it is
// correct for visitors in any timezone. Also highlights today's row in the hours list.
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
// minutes from midnight: [open, close]; Saturday closes at 24:00 (1440 = midnight)
const SCHEDULE = {
  0: [510, 1350], 1: [510, 1350], 2: [510, 1350], 3: [510, 1350], 4: [510, 1350],
  5: [510, 1020], 6: [1200, 1440],
};

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (m) => `${pad(Math.floor((m % 1440) / 60))}:${pad(m % 60)}`;

function israelNow() {
  const now = new Date();
  const il = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  return { day: il.getDay(), mins: il.getHours() * 60 + il.getMinutes() };
}

function nextOpening(day, mins) {
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const slot = SCHEDULE[d];
    if (!slot) continue;
    if (i === 0 && mins < slot[0]) return { when: 'היום', time: slot[0] };
    if (i > 0) return { when: i === 1 ? 'מחר' : `יום ${DAYS[d]}`, time: slot[0] };
  }
  return null;
}

export function initOpenNow() {
  const badge = document.querySelector('[data-open-now]');
  const label = document.querySelector('[data-open-label]');
  const { day, mins } = israelNow();

  // highlight today's row
  document.querySelectorAll('.hours li[data-day]').forEach((li) => {
    const days = li.getAttribute('data-day').split(',').map(Number);
    if (days.includes(day)) li.classList.add('is-today');
  });

  if (!badge || !label) return;
  const slot = SCHEDULE[day];
  const open = slot && mins >= slot[0] && mins < slot[1];

  if (open) {
    badge.classList.add('is-open');
    label.textContent = `פתוח עכשיו · נסגר ב־${hhmm(slot[1])}`;
  } else {
    badge.classList.add('is-closed');
    const nxt = nextOpening(day, mins);
    label.textContent = nxt ? `סגור כעת · נפתח ${nxt.when} ב־${hhmm(nxt.time)}` : 'סגור כעת';
  }
}
