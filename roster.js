// Loads and displays the roster by week, sectioned by team side and position

// Utility: Map positions to team sides
const TEAM_SIDES = {
    'QB': 'Offense', 'RB': 'Offense', 'WR': 'Offense', 'TE': 'Offense', 'OL': 'Offense',
    'K': 'Special Teams', 'P': 'Special Teams', 'LS': 'Special Teams',
    'DL': 'Defense', 'LB': 'Defense', 'DB': 'Defense'
};

// Utility: Order for displaying team sides and positions
const TEAM_SIDE_ORDER = ['Offense', 'Defense', 'Special Teams'];
const POSITION_ORDER = {
    'Offense': ['QB', 'RB', 'WR', 'TE', 'OL'],
    'Defense': ['DL', 'LB', 'DB'],
    'Special Teams': ['K', 'P', 'LS']
};

let rosterData = [];

// Load CSV file and parse it
function loadRosterCSV(callback) {
    fetch('roster_info.csv')
        .then(response => response.text())
        .then(text => {
            const rows = text.trim().split('\n');
            const headers = rows[0].split(',');
            const data = rows.slice(1).map(row => {
                // Handle quoted CSV values
                const values = row.match(/(?:"[^"]*"|[^,])+/g) || row.split(',');
                const obj = {};
                headers.forEach((h, i) => {
                    obj[h.trim()] = values[i] ? values[i].replace(/^"|"$/g, '').trim() : '';
                });
                return obj;
            });
            callback(data);
        });
}

// Populate week dropdown
function populateWeekSelect(weeks) {
    const select = document.getElementById('week-select');
    select.innerHTML = '';
    weeks.forEach(week => {
        const opt = document.createElement('option');
        opt.value = week;
        opt.textContent = week;
        select.appendChild(opt);
    });
}

// Group players by team side and position
function groupRosterBySideAndPosition(roster) {
    const grouped = {};
    TEAM_SIDE_ORDER.forEach(side => grouped[side] = {});
    roster.forEach(player => {
        const pos = player.position;
        const side = TEAM_SIDES[pos] || 'Other';
        if (!grouped[side][pos]) grouped[side][pos] = [];
        grouped[side][pos].push(player);
    });
    return grouped;
}

// Render roster display
function renderRoster(roster) {
    const grouped = groupRosterBySideAndPosition(roster);
    const display = document.getElementById('roster-display');
    display.innerHTML = '';
    TEAM_SIDE_ORDER.forEach(side => {
        if (Object.keys(grouped[side]).length === 0) return;
        const section = document.createElement('div');
        section.className = 'section';
        section.innerHTML = `<h2>${side}</h2>`;
        const positionsDiv = document.createElement('div');
        positionsDiv.className = 'positions';
        (POSITION_ORDER[side] || Object.keys(grouped[side])).forEach(pos => {
            if (!grouped[side][pos]) return;
            const posDiv = document.createElement('div');
            posDiv.className = 'position';
            posDiv.innerHTML = `<h3>${pos}</h3>`;
            const playersDiv = document.createElement('div');
            playersDiv.className = 'players';
            grouped[side][pos].forEach(player => {
                const card = document.createElement('div');
                card.className = 'player-card';
                card.innerHTML = `
                    <img src="${player.headshot_url || 'https://via.placeholder.com/48'}" alt="${player.player_name}">
                    <div class="player-info">
                        <span class="player-name">${player.player_name}</span>
                        <span class="player-meta">#${player.jersey_number} &mdash; ${player.position}</span>
                    </div>
                `;
                playersDiv.appendChild(card);
            });
            posDiv.appendChild(playersDiv);
            positionsDiv.appendChild(posDiv);
        });
        section.appendChild(positionsDiv);
        display.appendChild(section);
    });
}

// Main logic
loadRosterCSV(data => {
    rosterData = data;
    // Get unique weeks
    const weeks = Array.from(new Set(rosterData.map(p => p.week))).sort((a, b) => Number(a) - Number(b));
    populateWeekSelect(weeks);
    // Initial render
    const select = document.getElementById('week-select');
    function updateRoster() {
        const week = select.value;
        const filtered = rosterData.filter(p => p.week === week);
        renderRoster(filtered);
    }
    select.addEventListener('change', updateRoster);
    updateRoster();
});
