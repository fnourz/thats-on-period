const calendar = document.getElementById("calendar");
const backupStatus = document.getElementById("backupStatus");
const clearMonthButton = document.getElementById("clearMonth");
const exportHistoryButton = document.getElementById("exportHistory");
const helperText = document.getElementById("helperText");
const importHistoryInput = document.getElementById("importHistory");
const monthLabel = document.getElementById("monthLabel");
const monthSummary = document.getElementById("monthSummary");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const today = new Date();
let visibleYear = today.getFullYear();
let visibleMonth = today.getMonth();

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function currentMonthPrefix() {
  return `${visibleYear}-${String(visibleMonth + 1).padStart(2, "0")}-`;
}

function getSavedDates() {
  return JSON.parse(localStorage.getItem("periodDates") || "[]");
}

function saveDates(dates) {
  const uniqueDates = [...new Set(dates)].sort();
  localStorage.setItem("periodDates", JSON.stringify(uniqueDates));
}

function togglePeriodDate(key) {
  const savedDates = getSavedDates();
  const nextDates = savedDates.includes(key)
    ? savedDates.filter((date) => date !== key)
    : [...savedDates, key];

  saveDates(nextDates);
  return nextDates.includes(key);
}

function clearCurrentMonth() {
  const prefix = currentMonthPrefix();
  const savedDates = getSavedDates();
  saveDates(savedDates.filter((date) => !date.startsWith(prefix)));
  setBackupStatus("Month cleared.");
  renderCalendar();
}

function setBackupStatus(message) {
  backupStatus.textContent = message;
}

function getBackupFileName() {
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  return `period-history-${todayKey}.json`;
}

function exportHistory() {
  const savedDates = getSavedDates();
  const backup = {
    app: "Period.",
    version: 1,
    exportedAt: new Date().toISOString(),
    dates: savedDates
  };
  const file = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const downloadLink = document.createElement("a");

  downloadLink.href = URL.createObjectURL(file);
  downloadLink.download = getBackupFileName();
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);

  setBackupStatus(savedDates.length === 0 ? "Exported an empty backup." : "History exported.");
}

function normalizeImportedDates(importedBackup) {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const importedDates = Array.isArray(importedBackup)
    ? importedBackup
    : importedBackup.dates;

  if (!Array.isArray(importedDates)) {
    throw new Error("Backup file does not include dates.");
  }

  return importedDates.filter((date) => {
    if (typeof date !== "string" || !datePattern.test(date)) {
      return false;
    }

    const [year, month, day] = date.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day);

    return (
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day
    );
  });
}

function importHistory(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    try {
      const importedBackup = JSON.parse(reader.result);
      const importedDates = normalizeImportedDates(importedBackup);
      const savedDates = getSavedDates();

      saveDates([...savedDates, ...importedDates]);
      setBackupStatus(`Imported ${importedDates.length} ${importedDates.length === 1 ? "date" : "dates"}.`);
      renderCalendar();
    } catch (error) {
      setBackupStatus("Import failed. Choose a Period. backup file.");
    } finally {
      importHistoryInput.value = "";
    }
  });

  reader.readAsText(file);
}

function updateMonthDetails(savedDates) {
  const markedThisMonth = savedDates.filter((date) => date.startsWith(currentMonthPrefix()));
  const count = markedThisMonth.length;

  monthSummary.textContent = `${count} ${count === 1 ? "day" : "days"} marked this month`;
  clearMonthButton.disabled = count === 0;
  helperText.textContent = count === 0
    ? "Tap a date to mark your period."
    : "Tap a marked date to remove it.";
}

function applyPeriodRunStyles(firstDay) {
  const markedDays = [...calendar.querySelectorAll(".day.is-period")];

  markedDays.forEach((dayButton) => {
    const day = Number(dayButton.dataset.day);
    const weekday = (firstDay + day - 1) % 7;
    const hasPrevious = weekday !== 0 && calendar.querySelector(`[data-day="${day - 1}"].is-period`);
    const hasNext = weekday !== 6 && calendar.querySelector(`[data-day="${day + 1}"].is-period`);

    dayButton.classList.toggle("is-period-start", !hasPrevious && hasNext);
    dayButton.classList.toggle("is-period-middle", Boolean(hasPrevious && hasNext));
    dayButton.classList.toggle("is-period-end", Boolean(hasPrevious && !hasNext));
  });
}

function renderCalendar() {
  const savedDates = getSavedDates();
  const firstDay = new Date(visibleYear, visibleMonth, 1).getDay();
  const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();

  monthLabel.textContent = `${monthNames[visibleMonth]} ${visibleYear}`;
  calendar.innerHTML = "";

  for (let i = 0; i < firstDay; i += 1) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "day is-empty";
    calendar.appendChild(emptyDay);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(visibleYear, visibleMonth, day);
    const dayButton = document.createElement("button");
    dayButton.className = "day";
    dayButton.type = "button";
    dayButton.textContent = day;
    dayButton.dataset.day = String(day);
    dayButton.setAttribute("aria-label", `Mark ${monthNames[visibleMonth]} ${day}, ${visibleYear}`);

    if (
      day === today.getDate() &&
      visibleMonth === today.getMonth() &&
      visibleYear === today.getFullYear()
    ) {
      dayButton.classList.add("is-today");
    }

    if (savedDates.includes(key)) {
      dayButton.classList.add("is-period");
      dayButton.setAttribute("aria-pressed", "true");
    } else {
      dayButton.setAttribute("aria-pressed", "false");
    }

    dayButton.addEventListener("click", () => {
      togglePeriodDate(key);
      renderCalendar();
    });

    calendar.appendChild(dayButton);
  }

  updateMonthDetails(savedDates);
  applyPeriodRunStyles(firstDay);
}

prevMonthButton.addEventListener("click", () => {
  visibleMonth -= 1;

  if (visibleMonth < 0) {
    visibleMonth = 11;
    visibleYear -= 1;
  }

  renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
  visibleMonth += 1;

  if (visibleMonth > 11) {
    visibleMonth = 0;
    visibleYear += 1;
  }

  renderCalendar();
});

clearMonthButton.addEventListener("click", clearCurrentMonth);
exportHistoryButton.addEventListener("click", exportHistory);
importHistoryInput.addEventListener("change", importHistory);

renderCalendar();
