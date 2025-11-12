document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    const filtersContainer = document.getElementById('category-filters');
    let allTalksData = [];
    let allCategories = new Set();

    fetch('/api/schedule')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(scheduleData => {
            allTalksData = scheduleData;
            renderSchedule(scheduleData);
            extractAndRenderCategories(scheduleData);
        })
        .catch(error => {
            scheduleContainer.innerHTML = `<div class="schedule-item">
                <p style="color: red;">Could not load schedule. Please try refreshing the page.</p>
                <p style="color: #666;">${error}</p>
            </div>`;
        });

    function renderSchedule(schedule) {
        scheduleContainer.innerHTML = ''; // Clear loading message
        schedule.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('schedule-item', item.type);
            
            let categoriesHTML = '';
            if (item.category) {
                categoriesHTML = `<div class="item-categories">
                    ${item.category.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                </div>`;
            }

            let speakersHTML = '';
            if (item.speakers) {
                speakersHTML = `<div class="item-speakers">By: ${item.speakers.join(', ')}</div>`;
            }

            itemElement.innerHTML = `
                <div class="item-header">
                    <div>
                        <h3 class="item-title">${item.title}</h3>
                        ${speakersHTML}
                    </div>
                    <div class="item-time">${item.startTime} - ${item.endTime}</div>
                </div>
                <div class="item-body">
                    ${item.description ? `<p>${item.description}</p>` : ''}
                    ${categoriesHTML}
                </div>
            `;
            
            // Add data attribute for filtering
            if(item.category) {
                itemElement.dataset.categories = item.category.join(',');
            }

            scheduleContainer.appendChild(itemElement);
        });
    }

    function extractAndRenderCategories(schedule) {
        schedule.forEach(item => {
            if (item.type === 'talk' && item.category) {
                item.category.forEach(cat => allCategories.add(cat));
            }
        });

        filtersContainer.innerHTML = '<button class="filter-btn active" data-category="all">All</button>';
        allCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.category = cat;
            btn.textContent = cat;
            filtersContainer.appendChild(btn);
        });
    }

    filtersContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const selectedCategory = e.target.dataset.category;

            // Update active button
            filtersContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');

            // Filter schedule items
            const items = scheduleContainer.querySelectorAll('.schedule-item');
            items.forEach(item => {
                if (item.classList.contains('talk')) {
                    const itemCategories = item.dataset.categories ? item.dataset.categories.split(',') : [];
                    if (selectedCategory === 'all' || itemCategories.includes(selectedCategory)) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                }
            });
        }
    });
});
