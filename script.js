const calendar = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");
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
      const isMarked = togglePeriodDate(key);
      dayButton.classList.toggle("is-period", isMarked);
      dayButton.setAttribute("aria-pressed", String(isMarked));
    });

    calendar.appendChild(dayButton);
  }
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

renderCalendar();
