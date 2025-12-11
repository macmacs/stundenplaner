// ========================================
// Stundenplan Formatter - Browser Version
// ========================================

// Global State
let parsedData = null;
let subjectMappings = getDefaultMappings();
let customSubjects = loadCustomSubjects();
let cellOverrides = {}; // key: "rowIdx-cellIdx", value: { subject, room }

// Load custom subjects and merge with defaults
function initializeSubjectMappings() {
    subjectMappings = { ...getDefaultMappings(), ...customSubjects };
}

// Default subject mappings
function getDefaultMappings() {
    return {
        'DSU': { name: 'Sport', color: '#548235', textColor: 'white', pattern: ['DSU', 'SW/', 'SM/', '/SW', '/SM', 'SKD'] },
        'F': { name: 'Französisch', color: '#305496', textColor: 'white', pattern: ['F/', '/F', 'F', 'F/L', 'L/F'] },
        'L': { name: 'Latein', color: '#305496', textColor: 'white', pattern: ['L/', '/L', 'L', 'F/L', 'L/F'] },
        'M': { name: 'Mathematik', color: '#8EA9DB', textColor: 'white', pattern: ['M', 'M/', 'M_', '/M'] },
        'G': { name: 'Geschichte', color: '#000000', textColor: 'white', pattern: ['G', 'G/', 'G_'] },
        'E': { name: 'Englisch', color: '#FFC000', textColor: 'white', pattern: ['E', 'E/', 'E_', '/E', 'E_INT'] },
        'D': { name: 'Deutsch', color: '#E74748', textColor: 'white', pattern: ['D', 'D/', 'D_', '/D', 'D_INT'] },
        'NUT': { name: 'Naturwissenschaft', color: '#00B050', textColor: 'white', pattern: ['NUT', 'NWT', 'NWA'] },
        'GEO': { name: 'Geographie', color: '#C65911', textColor: 'white', pattern: ['GEO'] },
        'STD': { name: 'Klassenstunde', color: '#D9D9D9', textColor: 'black', pattern: ['STD'] },
        'KU': { name: 'Kunst', color: '#7030A0', textColor: 'white', pattern: ['KU', 'KU/'] },
        'MU': { name: 'Musik', color: '#F45FED', textColor: 'white', pattern: ['MU', 'MU/'] },
        'EV': { name: 'Religion/Ethik', color: '#E7E6E6', textColor: 'black', pattern: ['EV', 'ETH', 'K/', '/K'] }
    };
}

// LocalStorage functions
function loadCustomSubjects() {
    const saved = localStorage.getItem('customSubjects');
    return saved ? JSON.parse(saved) : {};
}

function saveCustomSubjects() {
    localStorage.setItem('customSubjects', JSON.stringify(customSubjects));
}

// ========================================
// File Upload Handling
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeSubjectMappings();
    setupEventListeners();
});

function setupEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
            processFile(file);
        }
    });
    
    // File picker
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    });
    
    // Subject manager actions
    document.getElementById('addSubjectBtn').addEventListener('click', addNewSubject);
    document.getElementById('exportConfig').addEventListener('click', exportConfig);
    document.getElementById('importConfig').addEventListener('click', () => {
        document.getElementById('configFileInput').click();
    });
    document.getElementById('configFileInput').addEventListener('change', importConfig);
    document.getElementById('resetConfig').addEventListener('click', resetConfig);
    
    // Preview actions
    document.getElementById('printBtn').addEventListener('click', () => window.print());
}

function processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const htmlContent = e.target.result;
        parseHTML(htmlContent);
    };
    reader.readAsText(file);
}

// ========================================
// HTML Parsing
// ========================================

function parseHTML(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Extract class name
    const className = extractClassName(doc);
    
    // Find timetable
    const table = doc.querySelector('table.table-condensed.table-bordered');
    if (!table) {
        alert('Keine Stundenplan-Tabelle gefunden!');
        return;
    }
    
    // Extract rows
    const rows = [];
    const trs = table.querySelectorAll('tr');
    
    trs.forEach((tr) => {
        const row = [];
        const cells = tr.querySelectorAll('td, th');
        
        cells.forEach(cell => {
            const tag = cell.tagName.toLowerCase();
            const content = cell.innerHTML;
            row.push({ tag, content });
        });
        
        if (row.length > 0) {
            rows.push(row);
        }
    });
    
    parsedData = {
        className,
        rows
    };
    
    // Discover subjects
    const subjects = discoverSubjects(rows);
    
    // Show UI sections
    document.getElementById('subjectManager').style.display = 'block';
    document.getElementById('previewSection').style.display = 'block';
    
    // Render subject manager
    renderSubjectManager(subjects);
    
    // Render preview
    renderPreview();
}

function extractClassName(doc) {
    const match = doc.body.textContent.match(/Stundenplan der Klasse (\w+)/);
    return match ? match[1] : 'Klasse';
}

function discoverSubjects(rows) {
    const subjects = new Set();
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        // Skip first cell (time)
        for (let j = 1; j < row.length; j++) {
            const cell = row[j];
            const { subject } = parseCellContent(cell.content);
            if (subject) {
                subjects.add(subject.toUpperCase().trim());
            }
        }
    }
    
    return Array.from(subjects);
}

// ========================================
// Subject Classification
// ========================================

function getSubjectMapping(subjectText) {
    if (!subjectText || subjectText.trim() === '') {
        return null;
    }
    
    const subject = subjectText.toUpperCase().trim();
    
    // Check custom subjects first (exact match)
    if (customSubjects[subject]) {
        return { key: subject, ...customSubjects[subject] };
    }
    
    // First pass: Check for exact matches in default mappings
    for (const [key, mapping] of Object.entries(subjectMappings)) {
        if (mapping.pattern) {
            for (const pattern of mapping.pattern) {
                if (subject === pattern) {
                    return { key, ...mapping };
                }
            }
        }
    }
    
    // Second pass: Check for pattern matches (must be word boundary or separator)
    // Sort by pattern length (longest first) to match most specific first
    const sortedMappings = Object.entries(subjectMappings).sort((a, b) => {
        const maxLenA = Math.max(...(a[1].pattern || []).map(p => p.length));
        const maxLenB = Math.max(...(b[1].pattern || []).map(p => p.length));
        return maxLenB - maxLenA;
    });
    
    for (const [key, mapping] of sortedMappings) {
        if (mapping.pattern) {
            for (const pattern of mapping.pattern) {
                // Check if pattern matches at word boundaries
                if (subject.startsWith(pattern + '/') || 
                    subject.startsWith(pattern + '_') ||
                    subject.endsWith('/' + pattern) ||
                    subject.includes('/' + pattern + '/')) {
                    return { key, ...mapping };
                }
            }
        }
    }
    
    return null;
}

// ========================================
// Cell Content Parsing
// ========================================

function parseCellContent(htmlContent) {
    if (!htmlContent || htmlContent === '&nbsp;') {
        return { subject: '', room: '' };
    }
    
    // Remove HTML tags except br
    const text = htmlContent.replace(/<br\s*\/?>/gi, '|||');
    const cleanText = text.replace(/<[^>]+>/g, '');
    const unescaped = decodeHTMLEntities(cleanText);
    
    const parts = unescaped.split('|||');
    
    if (parts.length >= 2) {
        let subject = parts[0].trim();
        const room = parts[1].trim();
        
        // Clean subject name (remove DSU suffixes)
        subject = cleanSubjectName(subject);
        
        return { subject, room };
    } else if (parts.length === 1) {
        let subject = parts[0].trim();
        subject = cleanSubjectName(subject);
        return { subject, room: '' };
    }
    
    return { subject: '', room: '' };
}

function cleanSubjectName(subject) {
    if (!subject) return subject;
    
    // Remove DSU suffixes
    subject = subject.replace(/DSU_[A-Za-z_]+/g, 'DSU');
    // Replace multiple DSU with single
    subject = subject.replace(/DSU(\/DSU)+/g, 'DSU');
    
    return subject;
}

function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

// ========================================
// Subject Manager UI
// ========================================

function renderSubjectManager(discoveredSubjects) {
    const knownContainer = document.getElementById('knownSubjects');
    const unknownContainer = document.getElementById('unknownSubjects');
    const unknownSection = document.getElementById('unknownSection');
    
    knownContainer.innerHTML = '';
    unknownContainer.innerHTML = '';
    
    const known = [];
    const unknown = [];
    
    discoveredSubjects.forEach(subject => {
        const mapping = getSubjectMapping(subject);
        if (mapping) {
            known.push({ subject, mapping });
        } else {
            unknown.push(subject);
        }
    });
    
    // Render known subjects
    known.forEach(({ subject, mapping }) => {
        const item = createSubjectItem(subject, mapping, false);
        knownContainer.appendChild(item);
    });
    
    // Render unknown subjects
    if (unknown.length > 0) {
        unknownSection.style.display = 'block';
        unknown.forEach(subject => {
            const item = createUnknownSubjectItem(subject);
            unknownContainer.appendChild(item);
        });
    } else {
        unknownSection.style.display = 'none';
    }
}

function createSubjectItem(subject, mapping, canDelete) {
    const div = document.createElement('div');
    div.className = 'subject-item';
    div.dataset.subject = subject;
    
    // Use displayAs if available, otherwise use subject
    const displayAbbr = mapping.displayAs || subject;
    
    div.innerHTML = `
        <div class="subject-preview" style="background-color: ${mapping.color}; color: ${mapping.textColor};">
            ${displayAbbr}
        </div>
        <div class="subject-info">
            <div class="subject-abbr" contenteditable="true" data-subject="${subject}"
                 style="cursor: text; padding: 2px 4px; border-radius: 3px; font-weight: 600;"
                 title="Klicken zum Bearbeiten">${displayAbbr}</div>
            <div class="subject-name">${mapping.name}</div>
        </div>
        <div class="subject-controls">
            <input type="color" class="color-picker-btn" value="${mapping.color}" data-subject="${subject}">
            ${canDelete ? '<button class="delete-btn" data-subject="' + subject + '">×</button>' : ''}
        </div>
    `;
    
    // Color picker event
    const colorPicker = div.querySelector('.color-picker-btn');
    colorPicker.addEventListener('change', (e) => {
        updateSubjectColor(subject, e.target.value);
    });
    
    // Subject abbreviation editing
    const abbrField = div.querySelector('.subject-abbr');
    
    // Highlight on focus
    abbrField.addEventListener('focus', function() {
        this.style.background = '#fff3cd';
        this.style.outline = '2px solid #667eea';
    });
    
    // Save on blur
    abbrField.addEventListener('blur', function() {
        this.style.background = '';
        this.style.outline = '';
        const newAbbr = this.textContent.trim().toUpperCase();
        if (newAbbr && newAbbr !== subject) {
            updateSubjectAbbreviation(subject, newAbbr);
        } else if (!newAbbr) {
            // Revert if empty
            this.textContent = subject;
        }
    });
    
    // Save on Enter key
    abbrField.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });
    
    // Delete button event
    if (canDelete) {
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteCustomSubject(subject);
        });
    }
    
    return div;
}

function createUnknownSubjectItem(subject) {
    const div = document.createElement('div');
    div.className = 'subject-item';
    div.style.background = '#fff3cd';
    div.style.borderColor = '#ffc107';
    
    div.innerHTML = `
        <div class="subject-preview" style="background-color: #ffffff; color: #000000; border: 2px solid #ffc107;">
            ${subject}
        </div>
        <div class="subject-info">
            <div class="subject-abbr">${subject}</div>
            <div class="subject-name">Unbekannt</div>
        </div>
        <div class="subject-controls">
            <input type="color" class="color-picker-btn" value="#808080" data-subject="${subject}">
            <button class="btn-primary" onclick="assignSubjectColor('${subject}', this.previousElementSibling.value)" style="padding: 8px 16px; font-size: 0.85rem;">
                Zuweisen
            </button>
        </div>
    `;
    
    return div;
}

window.assignSubjectColor = function(subject, color) {
    customSubjects[subject] = {
        name: subject,
        color: color,
        textColor: getContrastColor(color),
        pattern: [subject]
    };
    saveCustomSubjects();
    initializeSubjectMappings();
    
    // Refresh UI
    const subjects = discoverSubjects(parsedData.rows);
    renderSubjectManager(subjects);
    renderPreview();
};

function updateSubjectColor(subject, color) {
    // Update in custom subjects
    if (!customSubjects[subject]) {
        // Create new custom subject based on default
        const mapping = getSubjectMapping(subject);
        customSubjects[subject] = {
            name: mapping.name,
            color: color,
            textColor: mapping.textColor,
            pattern: mapping.pattern || [subject]
        };
    } else {
        customSubjects[subject].color = color;
    }
    
    saveCustomSubjects();
    initializeSubjectMappings();
    
    // Update preview
    renderPreview();
}


function updateSubjectAbbreviation(oldAbbr, newAbbr) {
    // Check if same
    if (oldAbbr === newAbbr) return;
    
    // Get the old subject's data
    const oldMapping = getSubjectMapping(oldAbbr);
    
    // Check if target already exists as a different subject
    const existingMapping = getSubjectMapping(newAbbr);
    if (existingMapping && existingMapping.key !== oldMapping.key) {
        // User wants to remap oldAbbr to use the existingMapping
        customSubjects[oldAbbr] = {
            name: existingMapping.name,
            color: existingMapping.color,
            textColor: existingMapping.textColor,
            pattern: [oldAbbr],
            displayAs: newAbbr  // Display override
        };
    } else {
        // Create/update custom subject with new display
        customSubjects[oldAbbr] = {
            name: oldMapping.name,
            color: oldMapping.color,
            textColor: oldMapping.textColor,
            pattern: [oldAbbr],
            displayAs: newAbbr  // Display override
        };
    }
    
    saveCustomSubjects();
    initializeSubjectMappings();
    
    // Refresh UI
    const subjects = discoverSubjects(parsedData.rows);
    renderSubjectManager(subjects);
    renderPreview();
}

function getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance using the relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // For bright colors, use white text
    // For dark colors, use black text
    return luminance > 0.4 ? 'white' : 'black';
}

// ========================================
// Add Custom Subject
// ========================================

function addNewSubject() {
    const abbr = document.getElementById('newSubjectAbbr').value.trim().toUpperCase();
    const name = document.getElementById('newSubjectName').value.trim();
    const color = document.getElementById('newSubjectColor').value;
    const textColor = document.getElementById('newSubjectTextColor').value;
    
    if (!abbr || !name) {
        alert('Bitte Abkürzung und Name eingeben!');
        return;
    }
    
    customSubjects[abbr] = {
        name,
        color,
        textColor,
        pattern: [abbr]
    };
    
    saveCustomSubjects();
    initializeSubjectMappings();
    
    // Clear form
    document.getElementById('newSubjectAbbr').value = '';
    document.getElementById('newSubjectName').value = '';
    document.getElementById('newSubjectColor').value = '#00B050';
    document.getElementById('newSubjectTextColor').value = 'white';
    
    // Refresh UI
    if (parsedData) {
        const subjects = discoverSubjects(parsedData.rows);
        renderSubjectManager(subjects);
        renderPreview();
    }
}

function deleteCustomSubject(subject) {
    if (confirm(`Fach "${subject}" wirklich löschen?`)) {
        delete customSubjects[subject];
        saveCustomSubjects();
        initializeSubjectMappings();
        
        if (parsedData) {
            const subjects = discoverSubjects(parsedData.rows);
            renderSubjectManager(subjects);
            renderPreview();
        }
    }
}

// ========================================
// Config Import/Export
// ========================================

function exportConfig() {
    const config = {
        version: '1.0',
        customSubjects: customSubjects
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stundenplan-config.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importConfig(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const config = JSON.parse(event.target.result);
            if (config.customSubjects) {
                customSubjects = config.customSubjects;
                saveCustomSubjects();
                initializeSubjectMappings();
                
                if (parsedData) {
                    const subjects = discoverSubjects(parsedData.rows);
                    renderSubjectManager(subjects);
                    renderPreview();
                }
                
                alert('Konfiguration erfolgreich importiert!');
            }
        } catch {
            alert('Fehler beim Importieren der Konfiguration!');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
}

function resetConfig() {
    if (confirm('Alle Anpassungen zurücksetzen?')) {
        customSubjects = {};
        saveCustomSubjects();
        initializeSubjectMappings();
        
        if (parsedData) {
            const subjects = discoverSubjects(parsedData.rows);
            renderSubjectManager(subjects);
            renderPreview();
        }
    }
}

// ========================================
// Preview Rendering
// ========================================

function renderPreview() {
    if (!parsedData) return;

    const container = document.getElementById('previewContainer');
    const html = generateTimetableHTML(parsedData.rows, parsedData.className);

    container.innerHTML = html;

    // Inject dynamic CSS for subject colors
    injectDynamicCSS();

    // Make lesson cells clickable
    addCellClickListeners();
}

// ========================================
// Cell Click-to-Edit
// ========================================

function addCellClickListeners() {
    document.querySelectorAll('#previewContainer .lesson-cell').forEach(cell => {
        cell.addEventListener('click', () => openCellEditor(cell));
    });
}

function openCellEditor(cell) {
    const rowIdx = parseInt(cell.dataset.row);
    const cellIdx = parseInt(cell.dataset.col);
    const key = `${rowIdx}-${cellIdx}`;

    const override = cellOverrides[key];
    const originalCell = parsedData.rows[rowIdx][cellIdx];
    const { subject: origSubject, room: origRoom } = parseCellContent(originalCell.content);

    const currentSubject = override !== undefined ? override.subject : origSubject;
    const currentRoom = override !== undefined ? override.room : origRoom;

    // Populate datalist with all known subject abbreviations
    const datalist = document.getElementById('subjectSuggestions');
    datalist.innerHTML = '';
    Object.entries(subjectMappings).forEach(([abbr, mapping]) => {
        const option = document.createElement('option');
        option.value = abbr;
        option.label = mapping.name;
        datalist.appendChild(option);
    });

    document.getElementById('cellEditorSubject').value = currentSubject;
    document.getElementById('cellEditorRoom').value = currentRoom;

    const modal = document.getElementById('cellEditorModal');
    modal.dataset.rowIdx = rowIdx;
    modal.dataset.cellIdx = cellIdx;
    modal.style.display = 'flex';

    document.getElementById('cellEditorSubject').focus();
}

window.saveCellEdit = function() {
    const modal = document.getElementById('cellEditorModal');
    const rowIdx = parseInt(modal.dataset.rowIdx);
    const cellIdx = parseInt(modal.dataset.cellIdx);
    const key = `${rowIdx}-${cellIdx}`;

    const newSubject = document.getElementById('cellEditorSubject').value.trim().toUpperCase();
    const newRoom = document.getElementById('cellEditorRoom').value.trim();

    cellOverrides[key] = { subject: newSubject, room: newRoom };

    closeCellEditor();
    renderPreview();
};

function closeCellEditor() {
    document.getElementById('cellEditorModal').style.display = 'none';
}

// Close modal on overlay click or Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCellEditor();
});

function generateTimetableHTML(rows, className) {
    let html = `<h1>Stundenplan Klasse ${className}</h1>\n<table class="timetable">\n`;
    
    rows.forEach((row, rowIdx) => {
        if (rowIdx === 0) {
            html += '    <thead>\n        <tr>\n';
            row.forEach(cell => {
                if (cell.tag === 'th') {
                    const cleanContent = cell.content.replace(/<[^>]+>/g, '');
                    const decoded = decodeHTMLEntities(cleanContent);
                    html += `            <th>${decoded}</th>\n`;
                }
            });
            html += '        </tr>\n    </thead>\n    <tbody>\n';
        } else {
            html += '        <tr>\n';
            
            row.forEach((cell, cellIdx) => {
                const cleanContent = cell.content.replace(/<[^>]+>/g, '');
                const decoded = decodeHTMLEntities(cleanContent);
                
                if (cellIdx === 0) {
                    // Time cell
                    const periodMatch = decoded.match(/(\d+)\.\s*(\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2})/);
                    if (periodMatch) {
                        const periodNum = periodMatch[1];
                        const timeRange = periodMatch[2];
                        html += `            <td class="time-cell"><div class="period">${periodNum}.</div><div class="time">${timeRange}</div></td>\n`;
                    } else {
                        html += `            <td class="time-cell">${decoded}</td>\n`;
                    }
                } else {
                    // Lesson cell
                    const cellKey = `${rowIdx}-${cellIdx}`;
                    const override = cellOverrides[cellKey];
                    let subject, room;
                    if (override !== undefined) {
                        subject = override.subject;
                        room = override.room;
                    } else {
                        const parsed = parseCellContent(cell.content);
                        subject = parsed.subject;
                        room = parsed.room;
                    }

                    const mapping = getSubjectMapping(subject);
                    const cssClass = mapping ? mapping.key.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'empty';

                    // Use displayAs if available, otherwise use original subject
                    const subjectDisplay = mapping && mapping.displayAs ? mapping.displayAs : (subject || '&nbsp;');
                    const roomDisplay = room || '&nbsp;';

                    html += `            <td class="lesson-cell subject-${cssClass}" data-row="${rowIdx}" data-col="${cellIdx}">\n`;
                    html += `                <div class="subject-name">${subjectDisplay}</div>\n`;
                    html += `                <div class="room-name">${roomDisplay}</div>\n`;
                    html += `            </td>\n`;
                }
            });
            
            html += '        </tr>\n';
        }
    });
    
    html += '    </tbody>\n</table>';
    
    return html;
}

function injectDynamicCSS() {
    // Remove existing dynamic style
    const existing = document.getElementById('dynamicSubjectStyles');
    if (existing) {
        existing.remove();
    }
    
    // Create new style element
    const style = document.createElement('style');
    style.id = 'dynamicSubjectStyles';
    
    let css = '';
    
    // Add all subject mappings
    Object.entries(subjectMappings).forEach(([key, mapping]) => {
        const className = key.toLowerCase().replace(/[^a-z0-9]/g, '-');
        css += `.lesson-cell.subject-${className} { background-color: ${mapping.color}; color: ${mapping.textColor}; }\n`;
    });
    
    // Add custom subjects
    Object.entries(customSubjects).forEach(([key, mapping]) => {
        const className = key.toLowerCase().replace(/[^a-z0-9]/g, '-');
        css += `.lesson-cell.subject-${className} { background-color: ${mapping.color}; color: ${mapping.textColor}; }\n`;
    });
    
    style.textContent = css;
    document.head.appendChild(style);
}

// ========================================
// Download Functionality
// ========================================

window.downloadHTML = function() {
    if (!parsedData) return;
    
    const html = generateCompleteHTML(parsedData.rows, parsedData.className);
    
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stundenplan_${parsedData.className}.html`;
    a.click();
    URL.revokeObjectURL(url);
}

function generateCompleteHTML(rows, className) {
    let css = getCSSContent();
    
    // Add dynamic subject colors
    Object.entries(subjectMappings).forEach(([key, mapping]) => {
        const className = key.toLowerCase().replace(/[^a-z0-9]/g, '-');
        css += `.lesson-cell.subject-${className} { background-color: ${mapping.color}; color: ${mapping.textColor}; }\n`;
    });
    
    Object.entries(customSubjects).forEach(([key, mapping]) => {
        const className = key.toLowerCase().replace(/[^a-z0-9]/g, '-');
        css += `.lesson-cell.subject-${className} { background-color: ${mapping.color}; color: ${mapping.textColor}; }\n`;
    });
    
    const timetableHTML = generateTimetableHTML(rows, className);
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Stundenplan ${className}</title>
    <style>
${css}
    </style>
</head>
<body style="font-family: Calibri, sans-serif; background-color: #ffffff; margin: 20px;">
${timetableHTML}
</body>
</html>`;
}

function getCSSContent() {
    return `
table.timetable {
    border-collapse: collapse;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    table-layout: fixed;
}

table.timetable th, table.timetable td {
    border: 1pt solid #000000;
    text-align: center;
    vertical-align: middle;
    white-space: normal;
    word-wrap: break-word;
}

table.timetable thead tr th {
    font-size: 18pt;
    font-weight: bold;
    background-color: #ffffff;
    padding: 15px 8px;
    color: #000000;
}

table.timetable .time-cell {
    font-size: 18pt;
    font-weight: bold;
    width: 120px;
    background-color: #ffffff;
    padding: 10px 5px;
    color: #000000;
}

table.timetable .time-cell .period {
    font-size: 18pt;
    font-weight: bold;
    margin-bottom: 5px;
}

table.timetable .time-cell .time {
    font-size: 12pt;
    font-weight: normal;
}

table.timetable .lesson-cell {
    padding: 0;
    height: 70px;
}

table.timetable .lesson-cell .subject-name {
    font-size: 14pt;
    font-weight: bold;
    padding: 12px 8px 5px 8px;
}

table.timetable .lesson-cell .room-name {
    font-size: 12pt;
    font-weight: normal;
    padding: 5px 8px 12px 8px;
}

h1 {
    text-align: center;
    font-family: Calibri, sans-serif;
    font-size: 24pt;
    margin: 20px 0 10px 0;
}

@page {
    size: A4 portrait;
    margin: 15mm;
}

@media print {
    body { margin: 0; padding: 0; }
    h1 { font-size: 12pt; margin: 3mm 0 2mm 0; }
    table.timetable {
        width: 100%;
        max-width: 100%;
        font-size: 7pt;
        page-break-inside: avoid;
    }
    table.timetable thead tr th {
        font-size: 8pt;
        padding: 2mm 1mm;
    }
    table.timetable .time-cell {
        font-size: 7pt;
        padding: 1mm 0.5mm;
        width: 15mm;
    }
    table.timetable .time-cell .period {
        font-size: 8pt;
        margin-bottom: 0.5mm;
    }
    table.timetable .time-cell .time {
        font-size: 6pt;
    }
    table.timetable .lesson-cell {
        height: auto;
    }
    table.timetable .lesson-cell .subject-name {
        font-size: 8pt;
        padding: 1mm 0.5mm 0.5mm 0.5mm;
    }
    table.timetable .lesson-cell .room-name {
        font-size: 7pt;
        padding: 0.5mm 0.5mm 1mm 0.5mm;
    }
}
`;
}
