document.addEventListener("DOMContentLoaded", function () {
    const calendarDiv = document.getElementById("calendar");
    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    
    function generateCalendar(year) {
        for (let i = 0; i < 12; i++) {
            const monthDiv = document.createElement("div");
            monthDiv.classList.add("month");

            const monthTitle = document.createElement("h2");
            monthTitle.textContent = `${months[i]} ${year}`;
            monthDiv.appendChild(monthTitle);

            const daysDiv = document.createElement("div");
            daysDiv.classList.add("days");

            const daysInMonth = new Date(year, i + 1, 0).getDate(); // Get total days in the month

            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = document.createElement("div");
                dayDiv.classList.add("day");
                dayDiv.textContent = day;
                daysDiv.appendChild(dayDiv);
            }

            monthDiv.appendChild(daysDiv);
            calendarDiv.appendChild(monthDiv);
        }
    }

    generateCalendar(2025);
});
