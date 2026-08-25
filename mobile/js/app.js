// GymLog Mobile - Core Application Logic

// Global State
let appState = {
  workouts: [],
  bodyweight: [],
  benchPRs: [],
  theme: 'dark'
};

let currentView = 'calendar';
let activeDate = new Date();
let selectedWorkoutDate = null;
let currentExerciseFilter = '';
let deferredInstallPrompt = null;

// Split Config
const SPLIT_CONFIG = {
  push: { label: 'Push', color: 'var(--workout-push)', badgeClass: 'badge-push' },
  pull: { label: 'Pull', color: 'var(--workout-pull)', badgeClass: 'badge-pull' },
  legs: { label: 'Legs', color: 'var(--workout-legs)', badgeClass: 'badge-legs' },
  upper: { label: 'Upper', color: 'var(--workout-upper)', badgeClass: 'badge-upper' },
  lower: { label: 'Lower', color: 'var(--workout-lower)', badgeClass: 'badge-lower' },
  abs: { label: 'Abs', color: 'var(--workout-abs)', badgeClass: 'badge-abs' },
  arms: { label: 'Arms & Delts', color: 'var(--workout-arms)', badgeClass: 'badge-arms' },
  rest: { label: 'Rest', color: 'var(--workout-rest)', badgeClass: 'badge-rest' }
};

/**
 * Haptic Vibration Feedback Helper
 */
function triggerHaptic(type = 'light') {
  if (!('vibrate' in navigator)) return;
  try {
    switch (type) {
      case 'light': navigator.vibrate(10); break;
      case 'medium': navigator.vibrate(25); break;
      case 'success': navigator.vibrate([15, 30, 20]); break;
      case 'warning': navigator.vibrate([30, 40, 30]); break;
      case 'error': navigator.vibrate([50, 50, 50]); break;
    }
  } catch (e) {
    // Ignore vibration errors
  }
}

/**
 * Toast Banner Helper
 */
function showToast(message, type = 'normal') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'danger' ? 'toast-danger' : ''}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}

/**
 * State Persistence
 */
function loadState() {
  try {
    const saved = localStorage.getItem('gymLogState');
    if (saved) {
      const parsed = JSON.parse(saved);
      appState = {
        workouts: parsed.workouts || [],
        bodyweight: parsed.bodyweight || [],
        benchPRs: parsed.benchPRs || [],
        theme: parsed.theme || 'dark'
      };
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }

  // Apply saved theme
  if (appState.theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

function saveState() {
  try {
    localStorage.setItem('gymLogState', JSON.stringify(appState));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

/**
 * Navigation & Tab Switching
 */
function switchTab(viewName) {
  triggerHaptic('light');
  currentView = viewName;
  window.location.hash = '#' + viewName;

  // Update bottom nav active classes
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Toggle views
  document.querySelectorAll('.view-section').forEach(section => {
    if (section.id === `view-${viewName}`) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });

  // Render view-specific content
  if (viewName === 'calendar') {
    renderMobileCalendar();
  } else if (viewName === 'progress') {
    renderMobileProgress();
  } else if (viewName === 'weight') {
    renderMobileWeight();
  } else if (viewName === 'bench') {
    renderMobileBench();
  } else if (viewName === 'settings') {
    renderMobileSettings();
  }

  // Scroll to top
  window.scrollTo(0, 0);
  if (window.lucide) lucide.createIcons();
}

/**
 * Mobile Calendar View Logic
 */
function renderMobileCalendar() {
  const monthTitle = document.getElementById('cal-month-title');
  const calGrid = document.getElementById('cal-days-grid');
  if (!monthTitle || !calGrid) return;

  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  monthTitle.textContent = `${monthNames[month]} ${year}`;

  calGrid.innerHTML = '';

  // Get first day of month (0 = Sunday, 1 = Monday)
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const cell = document.createElement('div');
    cell.className = 'cal-cell other-month';
    cell.innerHTML = `<span class="cal-cell-date">${dayNum}</span>`;
    calGrid.appendChild(cell);
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const workout = appState.workouts.find(w => w.date === dateStr);
    const isToday = dateStr === todayStr;

    const cell = document.createElement('div');
    cell.className = `cal-cell ${isToday ? 'today' : ''}`;
    cell.setAttribute('data-date', dateStr);

    let badgeHtml = '';
    if (workout && workout.split) {
      const splitInfo = SPLIT_CONFIG[workout.split.toLowerCase()] || { label: workout.split, badgeClass: 'badge-push' };
      const shortLabel = workout.split.toLowerCase() === 'arms' ? 'A & D' : splitInfo.label;
      badgeHtml = `<div class="cal-split-badge ${splitInfo.badgeClass}">${shortLabel}</div>`;
    }

    cell.innerHTML = `
      <span class="cal-cell-date">${d}</span>
      ${badgeHtml}
    `;

    cell.onclick = () => openDayLogSheet(dateStr);
    calGrid.appendChild(cell);
  }

  updateStreakCounter();
  renderMonthSummaryStats(year, month);
  if (window.lucide) lucide.createIcons();
}

function prevMonth() {
  triggerHaptic('light');
  activeDate.setMonth(activeDate.getMonth() - 1);
  renderMobileCalendar();
}

function nextMonth() {
  triggerHaptic('light');
  activeDate.setMonth(activeDate.getMonth() + 1);
  renderMobileCalendar();
}

function updateStreakCounter() {
  const streakEl = document.getElementById('streak-count');
  if (!streakEl) return;

  // Compute active workout streak
  const workoutDates = new Set(appState.workouts.filter(w => w.split !== 'rest').map(w => w.date));
  let streak = 0;
  let curr = new Date();

  // Check if today or yesterday was logged
  const todayStr = curr.toISOString().split('T')[0];
  curr.setDate(curr.getDate() - 1);
  const yesterdayStr = curr.toISOString().split('T')[0];

  if (!workoutDates.has(todayStr) && !workoutDates.has(yesterdayStr)) {
    streakEl.textContent = '0';
    return;
  }

  curr = new Date();
  if (!workoutDates.has(todayStr)) {
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const dStr = curr.toISOString().split('T')[0];
    if (workoutDates.has(dStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  streakEl.textContent = `${streak}`;
}

function renderMonthSummaryStats(year, month) {
  const monthWorkouts = appState.workouts.filter(w => {
    if (!w.date) return false;
    const parts = w.date.split('-');
    return parseInt(parts[0], 10) === year && parseInt(parts[1], 10) === (month + 1);
  });

  const totalSessions = monthWorkouts.filter(w => w.split !== 'rest').length;
  let totalVolume = 0;
  let totalSets = 0;

  monthWorkouts.forEach(w => {
    (w.exercises || []).forEach(ex => {
      (ex.sets || []).forEach(s => {
        const wt = parseFloat(s.weight) || 0;
        const rp = parseFloat(s.reps) || 0;
        totalVolume += (wt * rp);
        totalSets++;
      });
    });
  });

  const countEl = document.getElementById('month-stat-sessions');
  const volEl = document.getElementById('month-stat-volume');
  const setsEl = document.getElementById('month-stat-sets');

  if (countEl) countEl.textContent = `${totalSessions}`;
  if (volEl) volEl.textContent = totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k lbs` : `${totalVolume} lbs`;
  if (setsEl) setsEl.textContent = `${totalSets}`;
}

/**
 * Day Workout Logging Bottom Sheet
 */
function openDayLogSheet(dateStr) {
  triggerHaptic('medium');
  selectedWorkoutDate = dateStr;

  const sheet = document.getElementById('sheet-workout-log');
  const titleEl = document.getElementById('sheet-log-date-title');
  const splitContainer = document.getElementById('split-chips-container');
  const exercisesContainer = document.getElementById('log-exercises-container');
  const notesInput = document.getElementById('log-workout-notes');
  const durationInput = document.getElementById('log-workout-duration');
  const rpeInput = document.getElementById('log-workout-rpe');
  const deleteBtn = document.getElementById('btn-delete-workout');

  if (!sheet) return;

  // Format date display
  const dateObj = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  titleEl.textContent = dateObj.toLocaleDateString('en-US', options);

  // Existing workout check
  const workout = appState.workouts.find(w => w.date === dateStr);

  // Render split selector chips
  splitContainer.innerHTML = '';
  Object.keys(SPLIT_CONFIG).forEach(key => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip ${workout && workout.split === key ? 'active' : ''}`;
    chip.textContent = SPLIT_CONFIG[key].label;
    chip.onclick = () => {
      triggerHaptic('light');
      splitContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    };
    chip.setAttribute('data-split', key);
    splitContainer.appendChild(chip);
  });

  // Populate fields
  if (notesInput) notesInput.value = workout?.notes || '';
  if (durationInput) durationInput.value = workout?.duration || '';
  if (rpeInput) rpeInput.value = workout?.rpe || '8';

  // Populate exercises
  exercisesContainer.innerHTML = '';
  if (workout && workout.exercises && workout.exercises.length > 0) {
    workout.exercises.forEach(ex => addExerciseToLog(ex.name, ex.sets));
  } else {
    // Start with 1 empty exercise card
    addExerciseToLog('', [{ weight: '', reps: '' }]);
  }

  // Delete button visibility
  if (deleteBtn) {
    deleteBtn.style.display = workout ? 'block' : 'none';
  }

  openSheet('sheet-workout-log');
  if (window.lucide) lucide.createIcons();
}

function addExerciseToLog(name = '', sets = [{ weight: '', reps: '' }]) {
  const container = document.getElementById('log-exercises-container');
  if (!container) return;

  const exIndex = container.children.length;
  const card = document.createElement('div');
  card.className = 'exercise-card';
  card.innerHTML = `
    <div class="flex items-center justify-between gap-2" style="margin-bottom: 0.5rem;">
      <input type="text" class="mobile-input ex-name-input" placeholder="Exercise Name (e.g. Bench Press)" value="${name}">
      <button type="button" class="set-delete-btn" onclick="this.closest('.exercise-card').remove(); triggerHaptic('light');" title="Remove Exercise">
        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
      </button>
    </div>
    <div class="sets-list"></div>
    <button type="button" class="btn" style="margin-top: 0.5rem; font-size: 0.8rem; padding: 0.4rem 0.75rem; background: var(--surface-offset); border-radius: var(--radius-sm); color: var(--primary); font-weight: 700;" onclick="addSetToExerciseCard(this.closest('.exercise-card'))">
      + Add Set
    </button>
  `;

  const setsList = card.querySelector('.sets-list');
  sets.forEach((set, sIdx) => {
    const setRow = createSetRow(sIdx + 1, set.weight, set.reps);
    setsList.appendChild(setRow);
  });

  container.appendChild(card);
  if (window.lucide) lucide.createIcons();
}

function createSetRow(setNum, weight = '', reps = '') {
  const row = document.createElement('div');
  row.className = 'set-row';
  row.innerHTML = `
    <span class="set-num">${setNum}</span>
    <input type="number" class="set-input set-weight" placeholder="lbs" value="${weight}">
    <input type="number" class="set-input set-reps" placeholder="reps" value="${reps}">
    <button type="button" class="set-delete-btn" onclick="removeSetRow(this)">
      <i data-lucide="x" style="width: 16px; height: 16px;"></i>
    </button>
  `;
  return row;
}

function addSetToExerciseCard(cardEl) {
  triggerHaptic('light');
  const setsList = cardEl.querySelector('.sets-list');
  const newSetNum = setsList.children.length + 1;
  
  // Inherit weight from previous set if present
  let lastWeight = '';
  if (setsList.children.length > 0) {
    const prevRow = setsList.children[setsList.children.length - 1];
    lastWeight = prevRow.querySelector('.set-weight').value;
  }

  const newRow = createSetRow(newSetNum, lastWeight, '');
  setsList.appendChild(newRow);
  if (window.lucide) lucide.createIcons();

  // Focus new reps input
  const repsInput = newRow.querySelector('.set-reps');
  if (repsInput) repsInput.focus();
}

function removeSetRow(btnEl) {
  triggerHaptic('light');
  const row = btnEl.closest('.set-row');
  const setsList = row.parentElement;
  row.remove();
  
  // Re-index set numbers
  setsList.querySelectorAll('.set-row').forEach((r, idx) => {
    r.querySelector('.set-num').textContent = `${idx + 1}`;
  });
}

function saveWorkoutLog() {
  if (!selectedWorkoutDate) return;

  const splitActive = document.querySelector('#split-chips-container .chip.active');
  const selectedSplit = splitActive ? splitActive.getAttribute('data-split') : 'push';

  const durationInput = document.getElementById('log-workout-duration');
  const rpeInput = document.getElementById('log-workout-rpe');
  const notesInput = document.getElementById('log-workout-notes');

  const exercises = [];
  document.querySelectorAll('#log-exercises-container .exercise-card').forEach(card => {
    const name = card.querySelector('.ex-name-input').value.trim();
    if (!name) return;

    const sets = [];
    card.querySelectorAll('.set-row').forEach(row => {
      const wt = row.querySelector('.set-weight').value;
      const rp = row.querySelector('.set-reps').value;
      if (wt !== '' || rp !== '') {
        sets.push({ weight: wt, reps: rp });
      }
    });

    if (sets.length > 0) {
      exercises.push({ name, sets });
    }
  });

  // Find or create workout entry
  const existingIdx = appState.workouts.findIndex(w => w.date === selectedWorkoutDate);
  const workoutData = {
    id: existingIdx >= 0 ? appState.workouts[existingIdx].id : 'w_' + Date.now(),
    date: selectedWorkoutDate,
    split: selectedSplit,
    duration: durationInput ? parseInt(durationInput.value, 10) || null : null,
    rpe: rpeInput ? parseInt(rpeInput.value, 10) || 8 : 8,
    notes: notesInput ? notesInput.value.trim() : '',
    exercises: exercises
  };

  if (existingIdx >= 0) {
    appState.workouts[existingIdx] = workoutData;
  } else {
    appState.workouts.push(workoutData);
  }

  saveState();
  triggerHaptic('success');
  showToast('Workout saved successfully! 🏋️‍♂️', 'success');
  closeSheet('sheet-workout-log');
  renderMobileCalendar();
}

function deleteCurrentWorkout() {
  if (!selectedWorkoutDate) return;
  if (!confirm('Are you sure you want to delete this workout log?')) return;

  appState.workouts = appState.workouts.filter(w => w.date !== selectedWorkoutDate);
  saveState();
  triggerHaptic('warning');
  showToast('Workout deleted', 'danger');
  closeSheet('sheet-workout-log');
  renderMobileCalendar();
}

/**
 * Smart Quick Paste Note Parser
 */
function openNoteParserModal() {
  triggerHaptic('light');
  const input = document.getElementById('quick-paste-input');
  if (input) input.value = '';
  openSheet('sheet-note-parser');
}

function parseAndInsertNotes() {
  const input = document.getElementById('quick-paste-input');
  if (!input || !input.value.trim()) return;

  const rawText = input.value.trim();
  const parsedExercises = parseRawWorkoutText(rawText);

  if (parsedExercises.length === 0) {
    showToast('Could not detect exercises. Check format!', 'danger');
    return;
  }

  // Add parsed exercises into current log sheet
  const container = document.getElementById('log-exercises-container');
  if (container) {
    // If only 1 empty exercise card existed, remove it
    if (container.children.length === 1 && !container.querySelector('.ex-name-input').value.trim()) {
      container.innerHTML = '';
    }

    parsedExercises.forEach(ex => {
      addExerciseToLog(ex.name, ex.sets);
    });
  }

  triggerHaptic('success');
  showToast(`Parsed ${parsedExercises.length} exercises! ✨`, 'success');
  closeSheet('sheet-note-parser');
}

function parseRawWorkoutText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const results = [];

  lines.forEach(line => {
    // Match "Exercise Name: 135x10, 145x8" or "Bench 225 5, 225 5"
    let colonSplit = line.split(':');
    let exName = '';
    let setsText = '';

    if (colonSplit.length >= 2) {
      exName = colonSplit[0].trim();
      setsText = colonSplit.slice(1).join(':').trim();
    } else {
      // Find where numbers start
      const firstNumMatch = line.match(/\d/);
      if (firstNumMatch) {
        const idx = firstNumMatch.index;
        exName = line.slice(0, idx).trim();
        setsText = line.slice(idx).trim();
      } else {
        exName = line;
      }
    }

    if (!exName) exName = 'Exercise';

    // Parse sets in format "135x10", "145*8", "150 x 6", "135 10", "225x5x3"
    const sets = [];
    const setTokens = setsText.split(/[,;\n]+/).map(t => t.trim()).filter(t => t.length > 0);

    setTokens.forEach(token => {
      // Check 225x5x3 (weight x reps x sets)
      const tripleMatch = token.match(/^(\d+(?:\.\d+)?)\s*[xX*]\s*(\d+)\s*[xX*]\s*(\d+)$/);
      if (tripleMatch) {
        const wt = tripleMatch[1];
        const rp = tripleMatch[2];
        const count = parseInt(tripleMatch[3], 10);
        for (let i = 0; i < count; i++) {
          sets.push({ weight: wt, reps: rp });
        }
        return;
      }

      // Check standard "135x10" or "135 * 10" or "135 10"
      const pairMatch = token.match(/^(\d+(?:\.\d+)?)\s*(?:[xX*]|\s+)\s*(\d+)$/);
      if (pairMatch) {
        sets.push({ weight: pairMatch[1], reps: pairMatch[2] });
        return;
      }

      // Bodyweight reps only (e.g. "12" or "15 reps")
      const repsOnlyMatch = token.match(/^(\d+)\s*(?:reps)?$/i);
      if (repsOnlyMatch) {
        sets.push({ weight: '0', reps: repsOnlyMatch[1] });
      }
    });

    if (sets.length === 0) {
      sets.push({ weight: '', reps: '' });
    }

    results.push({ name: exName, sets });
  });

  return results;
}

/**
 * Mobile Progress & Analytics View
 */
function renderMobileProgress() {
  const selectEl = document.getElementById('progress-exercise-select');
  if (!selectEl) return;

  // Extract all distinct exercises
  const exSet = new Set();
  appState.workouts.forEach(w => {
    (w.exercises || []).forEach(ex => {
      if (ex.name && ex.name.trim()) {
        exSet.add(ex.name.trim());
      }
    });
  });

  const exercises = Array.from(exSet).sort();
  selectEl.innerHTML = '';

  if (exercises.length === 0) {
    selectEl.innerHTML = '<option value="">No exercises logged yet</option>';
    document.getElementById('progress-stat-1rm').textContent = '0 lbs';
    document.getElementById('progress-stat-maxwt').textContent = '0 lbs';
    document.getElementById('progress-stat-vol').textContent = '0 lbs';
    return;
  }

  exercises.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (name === currentExerciseFilter || (!currentExerciseFilter && opt === selectEl.firstChild)) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });

  currentExerciseFilter = selectEl.value;
  updateExerciseAnalytics(currentExerciseFilter);
}

function updateExerciseAnalytics(exerciseName) {
  if (!exerciseName) return;
  currentExerciseFilter = exerciseName;

  const history = [];
  let maxWeight = 0;
  let max1RM = 0;
  let totalVolume = 0;

  // Sort workouts chronologically
  const sortedWorkouts = [...appState.workouts].sort((a, b) => (a.date > b.date ? 1 : -1));

  sortedWorkouts.forEach(w => {
    const foundEx = (w.exercises || []).find(e => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
    if (foundEx && foundEx.sets && foundEx.sets.length > 0) {
      let dayMax1RM = 0;
      let dayMaxWt = 0;
      let dayVol = 0;

      foundEx.sets.forEach(s => {
        const wt = parseFloat(s.weight) || 0;
        const rp = parseFloat(s.reps) || 0;
        if (wt > 0 && rp > 0) {
          const est1RM = Math.round(wt * (1 + rp / 30));
          if (est1RM > dayMax1RM) dayMax1RM = est1RM;
          if (wt > dayMaxWt) dayMaxWt = wt;
          dayVol += (wt * rp);
        }
      });

      if (dayMax1RM > max1RM) max1RM = dayMax1RM;
      if (dayMaxWt > maxWeight) maxWeight = dayMaxWt;
      totalVolume += dayVol;

      if (dayMax1RM > 0) {
        history.push({
          date: w.date.slice(5), // MM-DD
          fullDate: w.date,
          est1RM: dayMax1RM,
          maxWt: dayMaxWt,
          volume: dayVol,
          sets: foundEx.sets
        });
      }
    }
  });

  // Update stat cards
  const est1rmEl = document.getElementById('progress-stat-1rm');
  const maxwtEl = document.getElementById('progress-stat-maxwt');
  const volEl = document.getElementById('progress-stat-vol');

  if (est1rmEl) est1rmEl.textContent = `${max1RM} lbs`;
  if (maxwtEl) maxwtEl.textContent = `${maxWeight} lbs`;
  if (volEl) volEl.textContent = totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k lbs` : `${totalVolume} lbs`;

  // Render chart
  const labels = history.map(h => h.date);
  const dataPoints = history.map(h => h.est1RM);
  renderMobileProgressChart('chart-progress', labels, dataPoints, 'Est. 1RM (lbs)');

  // Render history list
  const historyList = document.getElementById('progress-history-list');
  if (historyList) {
    historyList.innerHTML = '';
    history.slice().reverse().forEach(h => {
      const item = document.createElement('div');
      item.className = 'mobile-card';
      item.style.marginBottom = '0.5rem';
      item.style.padding = '0.75rem';

      const setsStr = h.sets.map(s => `${s.weight}×${s.reps}`).join('  •  ');
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-primary">${h.fullDate}</span>
          <span class="stat-label">1RM: <b>${h.est1RM} lbs</b></span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.35rem;">
          ${setsStr}
        </div>
      `;
      historyList.appendChild(item);
    });
  }
}

/**
 * Mobile Bodyweight View Logic
 */
function renderMobileWeight() {
  const historyList = document.getElementById('weight-history-list');
  const currentWeightEl = document.getElementById('weight-stat-current');
  const trendWeightEl = document.getElementById('weight-stat-trend');
  const inputEl = document.getElementById('input-today-weight');

  const sorted = [...appState.bodyweight].sort((a, b) => (a.date > b.date ? 1 : -1));

  if (sorted.length > 0) {
    const latest = sorted[sorted.length - 1];
    if (currentWeightEl) currentWeightEl.textContent = `${latest.weight} lbs`;
    if (inputEl && !inputEl.value) inputEl.value = latest.weight;
  } else {
    if (currentWeightEl) currentWeightEl.textContent = '-- lbs';
  }

  // Calculate Linear Regression Trendline
  const labels = sorted.map(e => e.date.slice(5));
  const rawWeights = sorted.map(e => parseFloat(e.weight));
  const trendline = calculateTrendline(rawWeights);

  if (trendline.length > 0 && trendWeightEl) {
    trendWeightEl.textContent = `${trendline[trendline.length - 1].toFixed(1)} lbs`;
  }

  renderMobileWeightChart('chart-weight', labels, rawWeights, trendline);

  // Render recent logs
  if (historyList) {
    historyList.innerHTML = '';
    sorted.slice().reverse().forEach(entry => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between mobile-card';
      row.style.marginBottom = '0.5rem';
      row.style.padding = '0.75rem 1rem';
      row.innerHTML = `
        <span class="font-bold">${entry.date}</span>
        <div class="flex items-center gap-3">
          <span class="text-primary font-bold">${entry.weight} lbs</span>
          <button class="set-delete-btn" onclick="deleteWeightEntry('${entry.id}')">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      `;
      historyList.appendChild(row);
    });
  }
  if (window.lucide) lucide.createIcons();
}

function calculateTrendline(data) {
  const n = data.length;
  if (n <= 1) return data;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += (i * data[i]);
    sumXX += (i * i);
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map((_, i) => Math.round((slope * i + intercept) * 10) / 10);
}

function stepWeightInput(delta) {
  triggerHaptic('light');
  const input = document.getElementById('input-today-weight');
  if (!input) return;
  const current = parseFloat(input.value) || 160;
  input.value = (Math.round((current + delta) * 10) / 10).toFixed(1);
}

function logTodayWeight() {
  const input = document.getElementById('input-today-weight');
  if (!input || !input.value) return;

  const wt = parseFloat(input.value);
  if (isNaN(wt) || wt <= 0) {
    showToast('Please enter a valid weight', 'danger');
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const existingIdx = appState.bodyweight.findIndex(b => b.date === todayStr);

  if (existingIdx >= 0) {
    appState.bodyweight[existingIdx].weight = wt;
  } else {
    appState.bodyweight.push({ id: 'bw_' + Date.now(), date: todayStr, weight: wt });
  }

  saveState();
  triggerHaptic('success');
  showToast('Bodyweight logged! ⚖️', 'success');
  renderMobileWeight();
}

function deleteWeightEntry(id) {
  appState.bodyweight = appState.bodyweight.filter(b => b.id !== id);
  saveState();
  triggerHaptic('warning');
  renderMobileWeight();
}

/**
 * Mobile Bench PR View Logic
 */
function renderMobileBench() {
  const sorted = [...appState.benchPRs].sort((a, b) => (a.date > b.date ? 1 : -1));
  const currentPREl = document.getElementById('bench-stat-current');
  const est1rmEl = document.getElementById('bench-stat-1rm');
  const historyList = document.getElementById('bench-history-list');

  let maxPR = 0;
  let max1RM = 0;

  sorted.forEach(pr => {
    const wt = parseFloat(pr.weight) || 0;
    const rp = parseFloat(pr.reps) || 1;
    const e1rm = Math.round(wt * (1 + rp / 30));
    if (wt > maxPR) maxPR = wt;
    if (e1rm > max1RM) max1RM = e1rm;
  });

  if (currentPREl) currentPREl.textContent = maxPR > 0 ? `${maxPR} lbs` : '-- lbs';
  if (est1rmEl) est1rmEl.textContent = max1RM > 0 ? `${max1RM} lbs` : '-- lbs';

  const labels = sorted.map(p => p.date.slice(5));
  const weights = sorted.map(p => parseFloat(p.weight));
  const ests = sorted.map(p => Math.round(parseFloat(p.weight) * (1 + (parseFloat(p.reps) || 1) / 30)));

  renderMobileBenchChart('chart-bench', labels, weights, ests);

  if (historyList) {
    historyList.innerHTML = '';
    sorted.slice().reverse().forEach(pr => {
      const card = document.createElement('div');
      card.className = 'mobile-card';
      card.style.marginBottom = '0.5rem';
      card.style.padding = '0.75rem 1rem';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold">${pr.date}</span>
          <span class="stat-label">RPE: <b>${pr.rpe || 10}</b></span>
        </div>
        <div class="flex items-center justify-between" style="margin-top: 0.35rem;">
          <span class="text-primary font-bold" style="font-size: 1.1rem;">${pr.weight} lbs × ${pr.reps} reps</span>
          <button class="set-delete-btn" onclick="deleteBenchPREntry('${pr.id}')">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
        ${pr.notes ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.3rem;">"${pr.notes}"</div>` : ''}
      `;
      historyList.appendChild(card);
    });
  }
  if (window.lucide) lucide.createIcons();
}

function openAddBenchPRSheet() {
  triggerHaptic('medium');
  const dateInput = document.getElementById('input-bench-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  openSheet('sheet-bench-pr');
}

function saveBenchPR() {
  const dateInput = document.getElementById('input-bench-date');
  const wtInput = document.getElementById('input-bench-weight');
  const repsInput = document.getElementById('input-bench-reps');
  const rpeInput = document.getElementById('input-bench-rpe');
  const notesInput = document.getElementById('input-bench-notes');

  const wt = parseFloat(wtInput?.value);
  const reps = parseInt(repsInput?.value, 10) || 1;
  const date = dateInput?.value || new Date().toISOString().split('T')[0];

  if (!wt || wt <= 0) {
    showToast('Please enter bench weight', 'danger');
    return;
  }

  appState.benchPRs.push({
    id: 'pr_' + Date.now(),
    date,
    weight: wt,
    reps,
    rpe: parseInt(rpeInput?.value, 10) || 10,
    notes: notesInput?.value.trim() || ''
  });

  saveState();
  triggerHaptic('success');
  showToast('Bench PR logged! 🏆', 'success');
  closeSheet('sheet-bench-pr');
  renderMobileBench();
}

function deleteBenchPREntry(id) {
  appState.benchPRs = appState.benchPRs.filter(p => p.id !== id);
  saveState();
  triggerHaptic('warning');
  renderMobileBench();
}

/**
 * Mobile Settings & Backup View
 */
function renderMobileSettings() {
  const driveStatus = document.getElementById('gdrive-sync-status-mobile');
  const token = localStorage.getItem('gymlog_gdrive_token');
  const email = localStorage.getItem('gymlog_gdrive_user_email');

  if (driveStatus) {
    if (token) {
      driveStatus.innerHTML = `<span style="color: var(--primary);">● Connected</span> as <b>${email || 'Google User'}</b>`;
    } else {
      driveStatus.innerHTML = `<span style="color: var(--text-muted);">○ Not connected</span>`;
    }
  }
}

function toggleMobileTheme() {
  triggerHaptic('light');
  const isLight = document.body.classList.toggle('light-theme');
  appState.theme = isLight ? 'light' : 'dark';
  saveState();
  showToast(isLight ? 'Light Theme enabled ☀️' : 'Dark Theme enabled 🌙');
}

function exportJSONBackup() {
  triggerHaptic('medium');
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `gymlog_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('JSON Backup downloaded! 💾', 'success');
}

function importJSONBackup(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.workouts || imported.bodyweight || imported.benchPRs) {
        appState = {
          workouts: imported.workouts || [],
          bodyweight: imported.bodyweight || [],
          benchPRs: imported.benchPRs || [],
          theme: imported.theme || appState.theme
        };
        saveState();
        triggerHaptic('success');
        showToast('Backup imported successfully! ✨', 'success');
        switchTab('calendar');
      } else {
        showToast('Invalid GymLog backup format', 'danger');
      }
    } catch (err) {
      showToast('Error reading JSON file', 'danger');
    }
  };
  reader.readAsText(file);
}

/**
 * Bottom Sheet Open / Close Helpers
 */
function openSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (sheet) {
    sheet.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (sheet) {
    sheet.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Global sheet backdrop click listener
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('sheet-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/**
 * Mobile Search Modal / Command Palette
 */
function openSearchSheet() {
  triggerHaptic('light');
  const input = document.getElementById('mobile-search-input');
  if (input) {
    input.value = '';
    performMobileSearch('');
  }
  openSheet('sheet-search');
  setTimeout(() => input?.focus(), 150);
}

function performMobileSearch(query) {
  const resultsContainer = document.getElementById('search-results-list');
  if (!resultsContainer) return;

  const q = query.trim().toLowerCase();
  resultsContainer.innerHTML = '';

  if (!q) {
    resultsContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0; font-size: 0.85rem;">
        Type an exercise, split, or note to search...
      </div>
    `;
    return;
  }

  // Search in workouts
  const matchingWorkouts = appState.workouts.filter(w => {
    if (w.split && w.split.toLowerCase().includes(q)) return true;
    if (w.notes && w.notes.toLowerCase().includes(q)) return true;
    return (w.exercises || []).some(ex => ex.name.toLowerCase().includes(q));
  });

  if (matchingWorkouts.length === 0) {
    resultsContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0; font-size: 0.85rem;">
        No matching workouts found for "${query}"
      </div>
    `;
    return;
  }

  matchingWorkouts.forEach(w => {
    const card = document.createElement('div');
    card.className = 'mobile-card';
    card.style.marginBottom = '0.5rem';
    card.style.padding = '0.75rem 1rem';
    card.onclick = () => {
      closeSheet('sheet-search');
      openDayLogSheet(w.date);
    };

    const exList = (w.exercises || []).map(e => e.name).join(', ') || 'No exercises listed';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-bold">${w.date}</span>
        <span class="cal-split-badge badge-${w.split || 'push'}" style="width: auto; padding: 0.2rem 0.5rem;">${w.split}</span>
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.35rem;" class="truncate">
        ${exList}
      </div>
    `;
    resultsContainer.appendChild(card);
  });
}

/**
 * PWA Installation Prompt Handler
 */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.classList.remove('hidden');
});

function triggerPWAInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('GymLog App Installed! 🎉', 'success');
      }
      deferredInstallPrompt = null;
    });
  } else {
    // Open iOS / general install guide sheet
    openSheet('sheet-install-guide');
  }
}

/**
 * Service Worker Registration
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.log('GymLog Mobile ServiceWorker registered:', reg.scope);
    }).catch((err) => {
      console.warn('GymLog Mobile ServiceWorker registration failed:', err);
    });
  });
}

/**
 * Initial App Boot
 */
window.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Route handling
  const hash = window.location.hash.replace('#', '') || 'calendar';
  switchTab(hash);

  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '') || 'calendar';
    if (newHash !== currentView) {
      switchTab(newHash);
    }
  });

  if (window.lucide) lucide.createIcons();
});
