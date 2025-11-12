document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    const categoryFiltersContainer = document.getElementById('category-filters');
    const speakerSelect = document.getElementById('speaker-select');

    let allTalksData = [];

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
            populateFilters(scheduleData);
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
            
            if(item.type === 'talk') {
                itemElement.dataset.categories = item.category.join(',');
                itemElement.dataset.speakers = item.speakers.join(',');
            }

            scheduleContainer.appendChild(itemElement);
        });
    }

    function populateFilters(schedule) {
        const allCategories = new Set();
        const allSpeakers = new Set();

        schedule.forEach(item => {
            if (item.type === 'talk') {
                item.category?.forEach(cat => allCategories.add(cat));
                item.speakers?.forEach(speaker => allSpeakers.add(speaker));
            }
        });

        categoryFiltersContainer.innerHTML = '<button class="filter-btn active" data-category="all">All Categories</button>';
        allCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.category = cat;
            btn.textContent = cat;
            categoryFiltersContainer.appendChild(btn);
        });

        speakerSelect.innerHTML = '<option value="all">All Speakers</option>';
        allSpeakers.forEach(speaker => {
            const option = document.createElement('option');
            option.value = speaker;
            option.textContent = speaker;
            speakerSelect.appendChild(option);
        });
    }

    function applyFilters() {
        const selectedCategory = categoryFiltersContainer.querySelector('.active').dataset.category;
        const selectedSpeaker = speakerSelect.value;

        const items = scheduleContainer.querySelectorAll('.schedule-item');
        items.forEach(item => {
            if (item.classList.contains('talk')) {
                const itemCategories = item.dataset.categories ? item.dataset.categories.split(',') : [];
                const itemSpeakers = item.dataset.speakers ? item.dataset.speakers.split(',') : [];

                const categoryMatch = selectedCategory === 'all' || itemCategories.includes(selectedCategory);
                const speakerMatch = selectedSpeaker === 'all' || itemSpeakers.includes(selectedSpeaker);

                if (categoryMatch && speakerMatch) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            }
        });
    }

    categoryFiltersContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            categoryFiltersContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            applyFilters();
        }
    });

    speakerSelect.addEventListener('change', applyFilters);
});
