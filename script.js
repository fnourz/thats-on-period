const calendar = document.getElementById("calendar");
const clearMonthButton = document.getElementById("clearMonth");
const helperText = document.getElementById("helperText");
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
  localStorage.setItem("periodDates", JSON.stringify(dates));
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
  renderCalendar();
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

renderCalendar();
