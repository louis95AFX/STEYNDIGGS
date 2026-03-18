/**
 * STEYNDIGGS Events - Database Integrated Version
 */

 let events = [];
 let currentDate = new Date(2026, 2, 1); 
 const API_URL = 'api.php'; 
 
 // 1. SET YOUR PASSWORD HERE
 const ADMIN_PASSWORD = "Steyn123"; 
 
 // --- DATABASE FUNCTIONS ---
 
 async function fetchEventsFromDB() {
    const grid = document.getElementById('calendarGrid');
    
    // 1. Show Loading Icon immediately
    if (grid) {
        grid.innerHTML = `
            <div class="loading-container">
                <div class="loader-icon"></div>
                <p>Fetching events...</p>
            </div>
        `;
    }

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        events = data.map(e => ({
            ...e,
            desc: e.description 
        }));

        // 2. Render the actual calendar (this clears the loader)
        renderCalendar(); 
    } catch (err) {
        console.error("Error fetching events:", err);
        
        // 3. Optional: Show error message in the grid if it fails
        if (grid) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:red; padding:20px;">
                Failed to load events. Please refresh.
            </p>`;
        }
    }
}
 async function saveEventToDB(newEvent) {
     try {
         const response = await fetch(API_URL, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(newEvent)
         });
         
         const result = await response.json();
         
         if (result.status === "success") {
             await fetchEventsFromDB();
             alert('Event added successfully!');
         } else {
             throw new Error(result.message || "Unknown error");
         }
     } catch (err) {
         console.error("Error saving event:", err);
         alert("Failed to save to database. Check if 'image' column is LONGTEXT.");
     }
 }
 
 async function deleteEventFromDB(id) {
     if (!confirm("Are you sure you want to delete this event?")) return;
     try {
         events = events.filter(e => e.id != id);
         renderCalendar();
         document.getElementById('eventDetail').innerHTML = `<h3>Select a date</h3>`;
     } catch (err) {
         console.error("Delete failed:", err);
     }
 }
 
 // --- UI RENDERING LOGIC ---
 
 function renderCalendar() {
     const grid = document.getElementById('calendarGrid');
     const monthDisplay = document.getElementById('monthDisplay');
     if (!grid) return;
     
     grid.innerHTML = '';
     const year = currentDate.getFullYear();
     const month = currentDate.getMonth();
     
     monthDisplay.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
 
     ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
         const el = document.createElement('div');
         el.className = 'day-name';
         el.innerText = day;
         grid.appendChild(el);
     });
 
     const firstDay = new Date(year, month, 1).getDay();
     const daysInMonth = new Date(year, month + 1, 0).getDate();
 
     for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));
 
     for (let i = 1; i <= daysInMonth; i++) {
         const dayEl = document.createElement('div');
         dayEl.className = 'day';
         dayEl.innerText = i;
 
         const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
         const eventMatch = events.find(e => e.date === dateStr);
 
         if (eventMatch) dayEl.classList.add('has-event');
 
         dayEl.onclick = () => {
             document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
             dayEl.classList.add('selected');
             showEvent(dateStr, eventMatch);
         };
         grid.appendChild(dayEl);
     }
 }
 
 function showEvent(date, event) {
     const display = document.getElementById('eventDetail');
     display.style.opacity = '0'; 
     
     setTimeout(() => {
         if (event) {
             const imageHtml = event.image ? `<img src="${event.image}" class="flyer-img" alt="Flyer">` : '';
             display.innerHTML = `
                 <span style="color: #ff6b6b; font-weight: bold; font-size: 0.9rem;">${date}</span>
                 <h2 style="margin: 5px 0; font-size: 1.4rem;">${event.title}</h2>
                 <p style="font-size: 0.95rem; color: #555;">${event.desc}</p>
                 ${imageHtml}
             `;
         } else {
             display.innerHTML = `
                 <i class="fas fa-calendar-times fa-3x" style="color: #ccc; margin-bottom: 15px;"></i>
                 <h3>No events for ${date}</h3>
             `;
         }
         display.style.opacity = '1';
     }, 200);
 }
 
 // --- EVENT HANDLERS & MODAL (MODIFIED FOR PASSWORD) ---
 
 const modal = document.getElementById('eventModal');
 const openModalBtn = document.getElementById('openModalBtn');
 const closeModalBtn = document.getElementById('closeModalBtn');
 const eventForm = document.getElementById('eventForm');
 
 if (openModalBtn) {
     openModalBtn.onclick = () => {
         // 2. THIS IS THE PASSWORD CHECK
         const userInput = prompt("Enter admin password to add events:");
         
         if (userInput === ADMIN_PASSWORD) {
             modal.style.display = 'flex';
         } else if (userInput !== null) {
             alert("Incorrect password. Access denied.");
         }
     };
 }
 
 if (closeModalBtn) closeModalBtn.onclick = () => modal.style.display = 'none';
 
 window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
 
 eventForm.onsubmit = async (e) => {
     e.preventDefault();
 
     const date = document.getElementById('eventDate').value;
     const title = document.getElementById('eventTitle').value;
     const desc = document.getElementById('eventDesc').value;
     const imageFile = document.getElementById('eventImage').files[0];
 
     const processSubmission = async (imgData) => {
         await saveEventToDB({ date, title, desc, image: imgData });
         eventForm.reset();
         modal.style.display = 'none';
     };
 
     if (imageFile) {
         const reader = new FileReader();
         reader.onload = (e) => processSubmission(e.target.result);
         reader.readAsDataURL(imageFile);
     } else {
         await processSubmission(null);
     }
 };
 
 // Navigation
 document.getElementById('prevMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
 document.getElementById('nextMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
 
 // Hamburger Menu
 const mobileMenu = document.getElementById('mobile-menu');
 const navList = document.getElementById('nav-list');
 if (mobileMenu) {
     mobileMenu.onclick = () => {
         mobileMenu.classList.toggle('active');
         navList.classList.toggle('active');
     };
 }
 
 // INITIAL START
 fetchEventsFromDB();
