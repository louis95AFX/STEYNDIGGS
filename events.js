/**
 * STEYNDIGGS Events - Database Integrated Version (Media Updated)
 */

 let events = [];
 let currentDate = new Date(2026, 2, 1); 
 const API_URL = 'api.php'; 
 
 // 1. SET YOUR PASSWORD HERE
 const ADMIN_PASSWORD = "Steyn123"; 
 
 // --- DATABASE FUNCTIONS ---
 
 async function fetchEventsFromDB() {
    const grid = document.getElementById('calendarGrid');
    
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
 
        renderCalendar(); 
    } catch (err) {
        console.error("Error fetching events:", err);
        if (grid) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:red; padding:20px;">
                Failed to load events. Please refresh.
            </p>`;
        }
    }
 }
 
async function saveEventToDB(newEvent) {
    // 1. Find the button and save its original state
    const submitBtn = document.querySelector('#eventForm .btn-submit');
    const originalContent = submitBtn ? submitBtn.innerHTML : 'Save Event';

    try {
        // 2. START LOADING: Disable button and show spinner
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Saving...`;
        }

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
        alert("Failed to save. Ensure your database 'image' column is LONGTEXT to handle video data.");
    } finally {
        // 3. UNLOAD: Reset the button regardless of success or failure
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }
}
 async function deleteEventFromDB(id) {
     if (!confirm("Are you sure you want to delete this event?")) return;
     try {
         // Note: For a true DB app, you'd add a fetch(API_URL, {method: 'DELETE'...}) here
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
 
function showEvent(date) {
    const display = document.getElementById('eventDetail');
    
    // Set a fixed min-height immediately to prevent the box from collapsing during the transition
    display.style.minHeight = "500px"; 
    display.style.opacity = '0'; 
    
    setTimeout(() => {
        const dayEvents = events.filter(e => e.date === date);

        if (dayEvents.length > 0) {
            let eventsHtml = dayEvents.map((event, index) => {
                let mediaHtml = '';
                
                if (event.image && event.image.startsWith('data:video/mp4')) {
                    mediaHtml = `
                        <video controls class="flyer-img" style="width: 100%; max-height: 300px; border-radius: 8px; background: #000; object-fit: contain;">
                            <source src="${event.image}" type="video/mp4">
                        </video>`;
                } else if (event.image) {
                    mediaHtml = `<img src="${event.image}" class="flyer-img" alt="Flyer" style="width: 100%; max-height: 300px; border-radius: 8px; object-fit: contain;">`;
                }

                return `
                    <div class="event-slide" style="min-width: 100%; max-width: 100%; scroll-snap-align: center; padding: 0 10px; box-sizing: border-box; overflow: hidden;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 10px;">
                            <h2 style="margin: 0; font-size: 1.2rem; white-space: normal; line-height: 1.2; word-break: break-word; flex: 1;">${event.title}</h2>
                            ${dayEvents.length > 1 ? `<span style="font-size: 0.7rem; background: #eee; padding: 2px 8px; border-radius: 10px; flex-shrink: 0;">${index + 1}/${dayEvents.length}</span>` : ''}
                        </div>
                        
                        <p style="font-size: 0.9rem; color: #555; margin-bottom: 15px; max-height: 100px; overflow-y: auto; line-height: 1.4; scrollbar-width: none;">
                            ${event.desc}
                        </p>
                        
                        <div style="width: 100%; display: flex; justify-content: center;">
                            ${mediaHtml}
                        </div>
                    </div>
                `;
            }).join('');

            display.innerHTML = `
                <span style="color: #ff6b6b; font-weight: bold; font-size: 0.9rem; margin-bottom: 10px; display: block; text-align: center;">${date}</span>
                
                <div class="events-scroll-container" style="
                    display: flex; 
                    overflow-x: auto; 
                    scroll-snap-type: x mandatory; 
                    gap: 10px; 
                    width: 100%;
                    padding-bottom: 15px;
                    scrollbar-width: thin;
                ">
                    ${eventsHtml}
                </div>
                
                ${dayEvents.length > 1 ? `<p style="text-align: center; font-size: 0.75rem; color: #999; margin-top: 5px;">Swipe left/right for more events (${dayEvents.length}) →</p>` : ''}
            `;
        } else {
            display.innerHTML = `
                <div style="height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%;">
                    <i class="fas fa-calendar-times fa-3x" style="color: #ccc; margin-bottom: 15px;"></i>
                    <h3 style="color: #888;">No events for ${date}</h3>
                </div>
            `;
        }
        display.style.opacity = '1';
    }, 200);
}
 // --- EVENT HANDLERS & MODAL ---
 
 const loginModal = document.getElementById('loginModal');
const adminPassInput = document.getElementById('adminPassInput');
const confirmLoginBtn = document.getElementById('confirmLoginBtn');
const cancelLoginBtn = document.getElementById('cancelLoginBtn');

const modal = document.getElementById('eventModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const eventForm = document.getElementById('eventForm');
if (openModalBtn) {
    openModalBtn.onclick = () => {
        // Clear previous input and show login modal
        adminPassInput.value = '';
        loginModal.style.display = 'flex';
        adminPassInput.focus();
    };
}

// Handle Login
confirmLoginBtn.onclick = () => {
    if (adminPassInput.value === ADMIN_PASSWORD) {
        loginModal.style.display = 'none'; // Hide login
        modal.style.display = 'flex';      // Show the Add Event modal
    } else {
        alert("Incorrect password!");
        adminPassInput.value = '';
    }
};

// Allow pressing "Enter" to login
adminPassInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmLoginBtn.click();
});

// Cancel Button
cancelLoginBtn.onclick = () => {
    loginModal.style.display = 'none';
};

// Close login modal if clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target == loginModal) loginModal.style.display = 'none';
});
 
 if (closeModalBtn) closeModalBtn.onclick = () => modal.style.display = 'none';
 window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
 
 eventForm.onsubmit = async (e) => {
     e.preventDefault();
 
     const date = document.getElementById('eventDate').value;
     const title = document.getElementById('eventTitle').value;
     const desc = document.getElementById('eventDesc').value;
     // Updated ID to match the HTML we edited earlier
     const mediaFile = document.getElementById('eventMedia').files[0];
 
     // File size limit (e.g., 15MB) to prevent database crashes/slowness
     if (mediaFile && mediaFile.size > 15 * 1024 * 1024) {
         alert("File is too large! Please select a file under 15MB.");
         return;
     }
 
     const processSubmission = async (mediaData) => {
         await saveEventToDB({ date, title, desc, image: mediaData });
         eventForm.reset();
         modal.style.display = 'none';
     };
 
     if (mediaFile) {
         const reader = new FileReader();
         reader.onload = (e) => processSubmission(e.target.result);
         reader.readAsDataURL(mediaFile);
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