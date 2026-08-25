// GymLog Mobile - Touch & Screen-Optimized Chart.js Helpers

let progressChartInstance = null;
let weightChartInstance = null;
let benchChartInstance = null;

const CHART_COLORS = {
  primary: '#4ade80',
  primaryAlpha: 'rgba(74, 222, 128, 0.15)',
  secondary: '#60a5fa',
  accent: '#fbbf24',
  textMuted: '#9ca3af',
  gridColor: 'rgba(255, 255, 255, 0.06)',
};

/**
 * Render Progress Chart on Mobile
 */
function renderMobileProgressChart(canvasId, labels, dataPoints, metricLabel = 'Est. 1RM (lbs)') {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (progressChartInstance) {
    progressChartInstance.destroy();
  }

  progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: metricLabel,
        data: dataPoints,
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primaryAlpha,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: CHART_COLORS.primary,
        pointBorderColor: '#09090b',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1c1c21',
          titleColor: '#f4f4f5',
          bodyColor: '#4ade80',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (ctx) => `${metricLabel}: ${ctx.parsed.y}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: CHART_COLORS.gridColor },
          ticks: {
            color: CHART_COLORS.textMuted,
            font: { size: 10, family: 'Satoshi' },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6
          }
        },
        y: {
          grid: { color: CHART_COLORS.gridColor },
          ticks: {
            color: CHART_COLORS.textMuted,
            font: { size: 10, family: 'Satoshi' }
          }
        }
      }
    }
  });
}

/**
 * Render Bodyweight & Trendline Chart on Mobile
 */
function renderMobileWeightChart(canvasId, labels, rawWeights, trendlinePoints) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (weightChartInstance) {
    weightChartInstance.destroy();
  }

  weightChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Weight (lbs)',
          data: rawWeights,
          borderColor: CHART_COLORS.secondary,
          backgroundColor: 'rgba(96, 165, 250, 0.12)',
          borderWidth: 2,
          fill: true,
          tension: 0.2,
          pointRadius: 3.5,
          pointBackgroundColor: CHART_COLORS.secondary
        },
        {
          label: 'Trendline',
          data: trendlinePoints,
          borderColor: CHART_COLORS.primary,
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: CHART_COLORS.textMuted,
            font: { size: 11, family: 'Satoshi' },
            boxWidth: 12,
            boxHeight: 12
          }
        },
        tooltip: {
          backgroundColor: '#1c1c21',
          titleColor: '#f4f4f5',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { color: CHART_COLORS.gridColor },
          ticks: {
            color: CHART_COLORS.textMuted,
            font: { size: 10 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 5
          }
        },
        y: {
          grid: { color: CHART_COLORS.gridColor },
          ticks: { color: CHART_COLORS.textMuted, font: { size: 10 } }
        }
      }
    }
  });
}

/**
 * Render Bench PR History Chart on Mobile
 */
function renderMobileBenchChart(canvasId, labels, prWeights, est1RMs) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (benchChartInstance) {
    benchChartInstance.destroy();
  }

  benchChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'PR Weight',
          data: prWeights,
          borderColor: CHART_COLORS.accent,
          backgroundColor: 'rgba(251, 191, 36, 0.15)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointBackgroundColor: CHART_COLORS.accent
        },
        {
          label: 'Est. 1RM',
          data: est1RMs,
          borderColor: CHART_COLORS.primary,
          borderWidth: 2,
          borderDash: [4, 4],
          fill: false,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: CHART_COLORS.textMuted,
            font: { size: 11, family: 'Satoshi' },
            boxWidth: 10,
            boxHeight: 10
          }
        },
        tooltip: {
          backgroundColor: '#1c1c21',
          titleColor: '#f4f4f5',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { color: CHART_COLORS.gridColor },
          ticks: { color: CHART_COLORS.textMuted, font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 5 }
        },
        y: {
          grid: { color: CHART_COLORS.gridColor },
          ticks: { color: CHART_COLORS.textMuted, font: { size: 10 } }
        }
      }
    }
  });
}
