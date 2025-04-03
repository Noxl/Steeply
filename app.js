/**
 * Tea Steeping Guide - Main Application JavaScript
 * 
 * This file contains all the functionality for the Tea Steeping Guide application,
 * including searching, filtering, and display of tea information.
 */

// ======================================================================
// DOM ELEMENTS
// ======================================================================
const filterType = document.getElementById('filter-type');
const categoryFilter = document.getElementById('category-filter');
const regionFilter = document.getElementById('region-filter');
const categorySelect = document.getElementById('category');
const regionSelect = document.getElementById('region');
const teaTypeContainer = document.getElementById('tea-type-container');
const teaTypeSelect = document.getElementById('tea-type');
const brewingMethodSelect = document.getElementById('brewing-method');
const measurementUnitSelect = document.getElementById('measurement-unit');
const waterUnitSelect = document.getElementById('water-unit');
const vesselSizeInput = document.getElementById('vessel-size');
const vesselUnitSpan = document.getElementById('vessel-unit');
const teaResultsContainer = document.getElementById('tea-results');
const modal = document.getElementById('tea-modal');
const closeButton = document.querySelector('.close-button');
const modalContent = document.getElementById('modal-content');
const teaSearchInput = document.getElementById('tea-search');
const searchButton = document.getElementById('search-button');

// ======================================================================
// CONSTANTS
// ======================================================================
// Constants for unit conversion
const TEASPOON_TO_GRAM = 2;   // Approximation: 1 teaspoon ≈ 2g of tea leaves
const ML_TO_OZ = 0.033814;    // 1 ml ≈ 0.033814 fl oz

// ======================================================================
// APPLICATION STATE
// ======================================================================
let currentFilterType = 'category';
let currentCategory = '';
let currentRegion = '';
let currentTeaType = '';
let currentBrewingMethod = 'gongfu';
let currentMeasurementUnit = 'grams';
let currentWaterUnit = 'ml';
let currentVesselSize = 100;
let currentSearchQuery = '';

// ======================================================================
// INITIALIZATION FUNCTIONS
// ======================================================================

/**
 * Initialize the application
 */
function init() {
    populateFilters();
    setupEventListeners();
    updateResults();
}

/**
 * Populate filter dropdowns from the database
 */
function populateFilters() {
    // Extract unique categories and regions
    const categories = [...new Set(teaDatabase.teaDatabase.map(tea => tea.category))];
    const regions = [...new Set(teaDatabase.teaDatabase.map(tea => tea.region))];
    
    // Sort alphabetically
    categories.sort();
    regions.sort();
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    // Add regions to dropdown
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
}

/**
 * Set up event listeners for all interactive elements
 */
function setupEventListeners() {
    // Search functionality
    searchButton.addEventListener('click', () => {
        currentSearchQuery = teaSearchInput.value.trim().toLowerCase();
        updateResults();
    });
    
    // Real-time search as you type
    teaSearchInput.addEventListener('input', () => {
        currentSearchQuery = teaSearchInput.value.trim().toLowerCase();
        updateResults();
    });
    
    // Search on Enter key
    teaSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            currentSearchQuery = teaSearchInput.value.trim().toLowerCase();
            updateResults();
        }
    });
    
    // Filter type change
    filterType.addEventListener('change', () => {
        currentFilterType = filterType.value;
        
        if (currentFilterType === 'category') {
            categoryFilter.style.display = 'block';
            regionFilter.style.display = 'none';
            teaTypeContainer.style.display = currentCategory ? 'block' : 'none';
        } else {
            categoryFilter.style.display = 'none';
            regionFilter.style.display = 'block';
            teaTypeContainer.style.display = currentRegion ? 'block' : 'none';
        }
        
        resetSearch();
        updateResults();
    });
    
    // Category selection
    categorySelect.addEventListener('change', () => {
        currentCategory = categorySelect.value;
        
        // Clear tea type selection
        teaTypeSelect.innerHTML = '<option value="">All Types</option>';
        currentTeaType = '';
        
        if (currentCategory) {
            // Show tea type filter and populate it
            teaTypeContainer.style.display = 'block';
            
            // Get tea types for selected category
            const teaTypes = teaDatabase.teaDatabase
                .filter(tea => tea.category === currentCategory)
                .map(tea => tea.type);
            
            // Sort and add to dropdown
            teaTypes.sort();
            teaTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                teaTypeSelect.appendChild(option);
            });
        } else {
            teaTypeContainer.style.display = 'none';
        }
        
        resetSearch();
        updateResults();
    });
    
    // Region selection
    regionSelect.addEventListener('change', () => {
        currentRegion = regionSelect.value;
        
        // Clear tea type selection
        teaTypeSelect.innerHTML = '<option value="">All Types</option>';
        currentTeaType = '';
        
        if (currentRegion) {
            // Show tea type filter and populate it
            teaTypeContainer.style.display = 'block';
            
            // Get tea types for selected region
            const teaTypes = teaDatabase.teaDatabase
                .filter(tea => tea.region === currentRegion)
                .map(tea => tea.type);
            
            // Sort and add to dropdown
            teaTypes.sort();
            teaTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                teaTypeSelect.appendChild(option);
            });
        } else {
            teaTypeContainer.style.display = 'none';
        }
        
        resetSearch();
        updateResults();
    });
    
    // Tea type selection
    teaTypeSelect.addEventListener('change', () => {
        currentTeaType = teaTypeSelect.value;
        resetSearch();
        updateResults();
    });
    
    // Brewing method change
    brewingMethodSelect.addEventListener('change', () => {
        currentBrewingMethod = brewingMethodSelect.value;
        updateResults();
    });
    
    // Modal close button
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ======================================================================
// SEARCH AND FILTER FUNCTIONS
// ======================================================================

/**
 * Reset search input and query
 */
function resetSearch() {
    teaSearchInput.value = '';
    currentSearchQuery = '';
}

/**
 * Normalize text for advanced searching
 * @param {string} text - The text to normalize
 * @return {string} Normalized text
 */
function normalizeText(text) {
    if (!text) return '';
    
    // First normalize accented characters to their base form (e.g., ï → i)
    let normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Then apply our other normalizations
    normalized = normalized
        .toLowerCase()
        .replace(/['']/g, '') // Remove apostrophes
        .replace(/[-–—]/g, ' ') // Replace hyphens with spaces
        .replace(/[.,;:!?()[\]{}|/\\]/g, '') // Remove most punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim(); // Remove leading/trailing whitespace
    
    return normalized;
}

/**
 * Remove all spaces from text for connected word matching
 * @param {string} text - The text to process
 * @return {string} Text with all spaces removed
 */
function removeSpaces(text) {
    return text.replace(/\s+/g, '');
}

/**
 * Filter and display tea results
 */
function updateResults() {
    // Apply filters
    let filteredTeas;
    
    // First filter by category or region
    if (currentFilterType === 'category') {
        filteredTeas = teaDatabase.teaDatabase.filter(tea => {
            if (currentCategory && tea.category !== currentCategory) return false;
            if (currentTeaType && tea.type !== currentTeaType) return false;
            return true;
        });
    } else {
        filteredTeas = teaDatabase.teaDatabase.filter(tea => {
            if (currentRegion && tea.region !== currentRegion) return false;
            if (currentTeaType && tea.type !== currentTeaType) return false;
            return true;
        });
    }
    
    // Then apply search filter if there's a search query
    if (currentSearchQuery) {
        // Normalize the search query
        const normalizedQuery = normalizeText(currentSearchQuery);
        const noSpacesQuery = removeSpaces(normalizedQuery);
        
        // Split the query into words for better partial matching
        const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
        
        // Filter teas based on normalized text and multiple fields
        filteredTeas = filteredTeas.filter(tea => {
            // Normalize all searchable fields
            const normalizedType = normalizeText(tea.type);
            const noSpacesType = removeSpaces(normalizedType);
            
            const normalizedDescription = normalizeText(tea.description);
            const normalizedFlavor = normalizeText(tea.flavorProfile);
            const normalizedRegion = normalizeText(tea.region);
            const normalizedCategory = normalizeText(tea.category);
            
            // Check if the no-spaces version matches
            if (noSpacesQuery.length > 2 && noSpacesType.includes(noSpacesQuery)) {
                return true;
            }
            
            // Check if any of the query words appear in any of the fields
            return queryWords.some(word => 
                normalizedType.includes(word) || 
                normalizedDescription.includes(word) || 
                normalizedFlavor.includes(word) || 
                normalizedRegion.includes(word) || 
                normalizedCategory.includes(word)
            );
        });
    }
    
    // Display results
    displayResults(filteredTeas);
}

/**
 * Highlight search matches in text
 * @param {string} text - The original text
 * @param {string} query - The search query
 * @return {string} Text with highlighted matches
 */
function highlightMatches(text, query) {
    if (!query) return text;
    
    // Normalize the query but keep track of the original text
    const normalizedQuery = normalizeText(query);
    const noSpacesQuery = removeSpaces(normalizedQuery);
    
    // Create a copy for highlighting
    let highlightedText = text;
    
    // Try to highlight the no-spaces version first for cases like "baimudan" → "Bai Mu Dan"
    if (noSpacesQuery.length > 2) {
        const normalizedText = normalizeText(text);
        const noSpacesText = removeSpaces(normalizedText);
        
        // If we find a match in the no-spaces version
        if (noSpacesText.includes(noSpacesQuery)) {
            // This is a bit more complex because we need to find the position in the original text
            // For simplicity, we'll highlight each word that appears in the text
            const textWords = normalizedText.split(' ');
            textWords.forEach(word => {
                if (word.length > 1 && noSpacesQuery.includes(word)) {
                    const pattern = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    highlightedText = highlightedText.replace(pattern, '<span class="highlight-match">$1</span>');
                }
            });
            return highlightedText;
        }
    }
    
    // Split into words for better highlighting
    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
    
    // Create regex patterns for each word, escaping special regex characters
    const patterns = queryWords.map(word => 
        new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    );
    
    // Apply each pattern to highlight all matching words
    patterns.forEach(pattern => {
        highlightedText = highlightedText.replace(pattern, '<span class="highlight-match">$1</span>');
    });
    
    return highlightedText;
}

// ======================================================================
// DISPLAY FUNCTIONS
// ======================================================================

/**
 * Display tea results with smoother animation
 * @param {Array} teas - Array of tea objects to display
 */
function displayResults(teas) {
    // Directly render results without fade-out for a smoother experience
    renderResults(teas);
}

/**
 * Render tea results with entrance animation
 * @param {Array} teas - Array of tea objects to display
 */
function renderResults(teas) {
    // Clear the container
    teaResultsContainer.innerHTML = '';
    
    if (teas.length === 0) {
        // No results message
        teaResultsContainer.innerHTML = `
            <div class="no-results">
                <p>No teas found matching your criteria. Try adjusting your filters or search query.</p>
            </div>
        `;
        return;
    }
    
    // Create tea cards with animation
    teas.forEach((tea, index) => {
        const teaCard = document.createElement('div');
        
        // Add special brewing class if normalBrewing is not 1
        const isSpecialBrewing = tea.normalBrewing !== 1;
        teaCard.className = isSpecialBrewing ? 'tea-card special-brewing' : 'tea-card';
        teaCard.dataset.tea = tea.type; // Store tea type for modal
        
        // Limit the max index for animation to avoid too much staggering
        const animationIndex = Math.min(index, 14);
        teaCard.style.setProperty('--card-index', animationIndex + 1);
        
        // Get region flag emoji
        const regionFlag = getRegionImage(tea.region);
        
        // Process brewing info for cards
        let brewingInfo;
        
        if (isSpecialBrewing) {
            // For special brewing teas, show a note about special instructions
            brewingInfo = `<div class="brewing-preview special">
                <span class="brewing-highlight">Special Brewing:</span>
                <span>This tea requires special brewing instructions. Click for details.</span>
            </div>`;
        } else {
            // For standard brewing, show gongfu and western info
            const gongfuInfo = getBrewingInfoForCard(tea, 'gongfu');
            const westernInfo = getBrewingInfoForCard(tea, 'western');
            
            brewingInfo = `
                <div class="brewing-preview gongfu">
                    <span class="brewing-highlight">Gong Fu Brewing:</span>
                    <span>${gongfuInfo}</span>
                </div>
                
                <div class="brewing-preview western">
                    <span class="brewing-highlight">Western Brewing:</span>
                    <span>${westernInfo}</span>
                </div>
            `;
        }
        
        // Highlight search matches if there's a search query
        let teaName = tea.type;
        let englishType = tea.englishType || '';
        let teaDescription = tea.description;
        let flavorProfile = tea.flavorProfile;
        let regionName = tea.region;
        
        if (currentSearchQuery) {
            teaName = highlightMatches(teaName, currentSearchQuery);
            if (englishType) {
                englishType = highlightMatches(englishType, currentSearchQuery);
            }
            teaDescription = highlightMatches(teaDescription, currentSearchQuery);
            flavorProfile = highlightMatches(flavorProfile, currentSearchQuery);
            regionName = highlightMatches(regionName, currentSearchQuery);
        }

        // Create brewing indicator based on normalBrewing value
        const brewingIndicator = isSpecialBrewing ? 
            `<div class="brewing-indicator special">Special Brewing</div>` : 
            `<div class="brewing-indicator normal">Standard Brewing</div>`;
            
        // Simplified info for the card
        teaCard.innerHTML = `
            <div class="tea-image" style="background-image: url('${tea.imageUrl}')">
                <div class="tea-category-badge ${tea.category.replace(/ /g, '-')}">${tea.category}</div>
                ${brewingIndicator}
            </div>
            <div class="tea-content">
                <h3>${teaName}</h3>
                ${englishType ? `<div class="tea-english-name">${englishType}</div>` : ''}
                
                <!-- Tea Description -->
                <p class="tea-description">${teaDescription}</p>
                
                <!-- Region info -->
                <div class="tea-region">
                    <span class="region-flag">${regionFlag}</span>
                    ${regionName}
                </div>
                
                <!-- Flavor Profile -->
                <p class="flavor-profile">Flavor profile: ${flavorProfile}</p>
                
                <!-- Brewing Methods Section -->
                <div class="card-brewing-methods">
                    ${brewingInfo}
                </div>
                
                <div class="view-details">View Detailed Steeping Guide</div>
            </div>
        `;
        
        // Add click event to open modal with animation
        teaCard.addEventListener('click', (e) => {
            // Add clicked class for animation
            teaCard.classList.add('clicked');
            
            // Wait for animation to complete before opening modal
            setTimeout(() => {
                openTeaModal(tea);
                
                // Remove the class after animation is done
                setTimeout(() => {
                    teaCard.classList.remove('clicked');
                }, 500);
            }, 300);
        });
        
        teaResultsContainer.appendChild(teaCard);
    });
    
    // Avoid automatic scrolling which can be jarring
    // Only scroll if the user is far away from the results
    if (window.scrollY > teaResultsContainer.offsetTop + 300) {
        setTimeout(() => {
            window.scrollTo({
                top: teaResultsContainer.offsetTop - 100,
                behavior: 'smooth'
            });
        }, 100);
    }
}

/**
 * Get region flag emoji based on the tea's origin
 * @param {string} region - The tea's region
 * @return {string} Flag emoji for the region
 */
function getRegionImage(region) {
    // Convert region to lowercase for easier matching
    const regionLower = region.toLowerCase();
    
    // Create emoji flag based on country
    let flag = "🌍"; // Default world emoji
    
    if (regionLower.includes("china")) {
        flag = "🇨🇳";
    } else if (regionLower.includes("japan")) {
        flag = "🇯🇵";
    } else if (regionLower.includes("india")) {
        flag = "🇮🇳";
    } else if (regionLower.includes("taiwan")) {
        flag = "🇹🇼";
    } else if (regionLower.includes("sri lanka")) {
        flag = "🇱🇰";
    } else if (regionLower.includes("kenya")) {
        flag = "🇰🇪";
    } else if (regionLower.includes("south africa")) {
        flag = "🇿🇦";
    } else if (regionLower.includes("morocco")) {
        flag = "🇲🇦";
    } else if (regionLower.includes("new zealand")) {
        flag = "🇳🇿";
    } else if (regionLower.includes("nepal")) {
        flag = "🇳🇵";
    } else if (regionLower.includes("rwanda")) {
        flag = "🇷🇼";
    } else if (regionLower.includes("malawi")) {
        flag = "🇲🇼";
    }
    
    return flag;
}

/**
 * Get brewing info for a specific method
 * @param {Object} tea - Tea object
 * @param {string} method - Brewing method ('gongfu' or 'western')
 * @return {string} Formatted brewing information
 */
function getBrewingInfoForCard(tea, method) {
    if (method === 'gongfu') {
        // Process leaf ratio for Gong Fu
        const ratio = tea.leafRatio.split('/');
        let leafAmount = parseFloat(ratio[0]);
        let waterAmount = parseFloat(ratio[1]);
        
        // Format the simplified output with bullet points
        return `• ${leafAmount}g / ${waterAmount}ml\n• ${tea.waterTemperature}`;
    } else {
        // Western brewing - with error handling
        if (!tea.westernSteeping) {
            return `• Information not available\n• ${tea.waterTemperature}`;
        }
        
        try {
            // Parse Western steeping info
            const westernParts = tea.westernSteeping.split(', ');
            if (westernParts.length < 3) {
                throw new Error('Unexpected format');
            }
            
            const leafPart = westernParts[0]; // e.g., "2g per 240ml"
            const tempPart = westernParts[2]; // e.g., "80-85°C"
            
            // Extract leaf amount and standard water volume
            const leafMatch = leafPart.match(/(\d+\.?\d*)g per (\d+)ml/);
            if (!leafMatch) {
                throw new Error('Cannot parse leaf ratio');
            }
            
            const leafAmount = parseFloat(leafMatch[1]);
            const standardWater = parseFloat(leafMatch[2]);
            
            // Format the simplified output with bullet points
            return `• ${leafAmount}g / ${standardWater}ml\n• ${tempPart}`;
        } catch (error) {
            // Fallback to raw data or default format if parsing fails
            return `• ${tea.westernSteeping || 'Information not available'}\n• ${tea.waterTemperature}`;
        }
    }
}

// ======================================================================
// MODAL FUNCTIONS
// ======================================================================

/**
 * Open the tea detail modal
 * @param {Object} tea - Tea object to display in the modal
 */
function openTeaModal(tea) {
    // First check if this is a special brewing tea
    const isNormalBrewing = tea.normalBrewing === 1;
    
    // Create modal content based on tea brewing type
    let modalHtml = `
        <div class="tea-detail-header">
            <div class="tea-detail-image" style="background-image: url('${tea.imageUrl}')"></div>
            <div class="tea-detail-title">
                <h2>${tea.type}</h2>
                ${tea.englishType ? `<div class="tea-english-name">${tea.englishType}</div>` : ''}
                
                <!-- Tea Description -->
                <p class="tea-detail-description">${tea.description}</p>
                
                <!-- Tea Metadata: Category, Region, and Flavor Profile -->
                <div class="tea-metadata">
                    <div class="tea-metadata-left">
                        <div class="tea-detail-category ${tea.category.replace(/ /g, '-')}">${tea.category}</div>
                        <div class="tea-detail-region">${tea.region}</div>
                    </div>
                    <div class="tea-metadata-right">
                        <div class="tea-detail-flavor">
                            <span class="flavor-label">Flavor Profile:</span> ${tea.flavorProfile}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Tea Cultivars - NEW ADDITION -->
                ${tea.cultivars ? `
                <div class="tea-cultivars">
                    <span class="cultivars-label">Known Cultivars:</span> ${tea.cultivars}
                </div>
                ` : ''}
    `;
    
    // Add commentary section if available
    if (tea.commentary && tea.commentary.trim() !== '') {
        const commentaryText = tea.commentary;
        const shortCommentary = commentaryText.length > 150 ? 
            commentaryText.substring(0, 150) + '...' : 
            commentaryText;
        
        modalHtml += `
            <div class="tea-commentary-section">
                <h3>Tea History & Culture</h3>
                <div class="tea-commentary-content">
                    <p class="commentary-preview">${shortCommentary}</p>
                    <div class="commentary-full" style="display: none;">${commentaryText}</div>
                    ${commentaryText.length > 150 ? 
                        '<button class="commentary-toggle">Read more</button>' : ''}
                </div>
            </div>
        `;
    }
    
    if (isNormalBrewing) {
        // NORMAL BREWING: Display standard brewing controls and information
        
        // Parse the leaf ratio for display
        const ratio = tea.leafRatio.split('/');
        const leafAmount = parseFloat(ratio[0]);
        const waterAmount = parseFloat(ratio[1]);
        const formattedLeafRatio = `${leafAmount}g / ${waterAmount}ml`;
        
        // For Western brewing - with error handling
        let westernLeafAmount = leafAmount; // Default to gongfu values
        let westernWaterAmount = waterAmount;
        let westernTimePart = "Not available";
        
        if (tea.westernSteeping) {
            try {
                const westernParts = tea.westernSteeping.split(', ');
                if (westernParts.length >= 2) {
                    const leafPart = westernParts[0]; // e.g., "2g per 240ml"
                    westernTimePart = westernParts[1]; // e.g., "2-3 minutes"
                    
                    const leafMatch = leafPart.match(/(\d+\.?\d*)g per (\d+)ml/);
                    if (leafMatch) {
                        westernLeafAmount = parseFloat(leafMatch[1]);
                        westernWaterAmount = parseFloat(leafMatch[2]);
                    }
                }
            } catch (error) {
                console.error("Error parsing western steeping info:", error);
                // Keep default values from gongfu method
            }
        }
        
        // Add standard brewing controls and information
        modalHtml += `
            <div class="tea-info-section">
                <div class="brewing-controls">
                    <!-- Toggle row with brewing method and unit system toggles -->
                    <div class="toggle-container-row">
                        <!-- Brewing method toggle (left) -->
                        <div class="brewing-toggle-container" style="margin-right: auto;">
                            <div class="brewing-toggle">
                                <input type="checkbox" id="brewing-toggle">
                                <label for="brewing-toggle">
                                    <span class="toggle-option gongfu active">Gong Fu</span>
                                    <span class="toggle-option western">Western</span>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Unit system toggle (right) -->
                        <div class="brewing-toggle-container" style="margin-left: auto;">
                            <div class="brewing-toggle unit-toggle">
                                <input type="checkbox" id="unit-system-toggle">
                                <label for="unit-system-toggle">
                                    <span class="toggle-option metric active">Metric</span>
                                    <span class="toggle-option imperial">Imperial</span>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Input row with vessel size and spoon checkbox -->
                    <div class="input-container-row">
                        <!-- Vessel size input -->
                        <div class="vessel-input-container">
                            <label for="modal-vessel-input">Vessel Size:</label>
                            <div class="vessel-input-wrapper">
                                <input type="number" id="modal-vessel-input" value="100" min="10" max="1000">
                                <span id="modal-vessel-unit">ml</span>
                            </div>
                        </div>
                        
                        <!-- Spoon checkbox -->
                        <div class="spoon-container">
                            <input type="checkbox" id="spoon-checkbox" style="display: none;">
                            <label for="spoon-checkbox" class="spoon-label">
                                <i class="fas fa-utensil-spoon"></i>
                                Use Spoon Measure
                            </label>
                        </div>
                    </div>
                </div>
                
                <h3 id="brewing-method-title">Gong Fu Cha Brewing Guide</h3>
                
                <div class="tea-info-grid">
                    <div class="tea-info-item">
                        <div class="tea-info-label">Leaf Ratio</div>
                        <div class="tea-info-value" id="leaf-ratio-display">${formattedLeafRatio}</div>
                    </div>
                    <div class="tea-info-item">
                        <div class="tea-info-label">For Your Vessel</div>
                        <div class="tea-info-value" id="calculated-amount"></div>
                    </div>
                    <div class="tea-info-item">
                        <div class="tea-info-label">Water Temperature</div>
                        <div class="tea-info-value">${tea.waterTemperature}</div>
                    </div>
                </div>
        `;
        
        // Process Gong Fu steeping times
        const steepingTimesStr = tea.gongFuSteepingTimes || "Information not available";
        let individualTimes = [];
        let additionalInstructions = null;
        
        // First, check if we have an "additional steep" instruction
        const additionalMatch = steepingTimesStr.match(/(\+[\d-]+s\s+each\s+additional\s+steep.*)/i);
        
        let processableString = steepingTimesStr;
        if (additionalMatch) {
            // Store the additional instructions and remove from the string we'll process
            additionalInstructions = additionalMatch[0];
            processableString = steepingTimesStr.replace(additionalMatch[0], '').trim();
        }
        
        // Process the remaining string to extract individual steeping times
        if (processableString.includes(',')) {
            // If comma-separated, split by commas
            individualTimes = processableString.split(',').map(s => s.trim());
        } else {
            // If space-separated, look for patterns like "10s", "15s", etc.
            const timeMatches = processableString.match(/\b\d+s\b/g);
            if (timeMatches) {
                individualTimes = timeMatches;
            } else {
                // Fallback: just use the whole string
                individualTimes = [processableString];
            }
        }
        
        // Create both steeping instruction sections, we'll toggle visibility with JS
        modalHtml += `
            <div class="steeping-instructions-container">
                <!-- Gong Fu instructions -->
                <div class="steeping-instructions gongfu active">
                    <h4>Steeping Times for Multiple Infusions</h4>
                    <div class="steeping-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Infusion</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        // Add rows for individual times
        individualTimes.forEach((time, index) => {
            modalHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${time}</td>
                </tr>
            `;
        });
        
        // Add the additional instructions if present
        if (additionalInstructions) {
            modalHtml += `
                <tr>
                    <td>Additional</td>
                    <td>${additionalInstructions}</td>
                </tr>
            `;
        }
        
        modalHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Western instructions -->
            <div class="steeping-instructions western">
                <h4>Western Style Brewing</h4>
                <div class="steeping-step">
                    <div class="step-number">1</div>
                    <div class="step-instructions">
                        <strong>Steep for:</strong> ${westernTimePart}
                    </div>
                </div>
                <p class="steeping-note">Note: Western style brewing typically uses a lower leaf-to-water ratio and longer steeping times than Gong Fu Cha. You may get 2-3 infusions from most teas using this method.</p>
            </div>
        </div>
        `;
    } else {
        // SPECIAL BREWING: Display only the brewing commentary
        const brewingCommentary = tea.brewingCommentary || "Special brewing instructions not available";
        
        modalHtml += `
            <div class="tea-info-section">
                <h3>Special Brewing Instructions</h3>
                
                <div class="special-brewing-container">
                    <div class="special-brewing-instructions">
                        <p>${brewingCommentary}</p>
                    </div>
                    
                    <div class="tea-info-grid">
                        <div class="tea-info-item">
                            <div class="tea-info-label">Water Temperature</div>
                            <div class="tea-info-value">${tea.waterTemperature}</div>
                        </div>
                        <div class="tea-info-item">
                            <div class="tea-info-label">Potential Infusions</div>
                            <div class="tea-info-value">${tea.potentialInfusions}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Set modal content and display
    document.getElementById('modal-content').innerHTML = modalHtml;
    document.getElementById('tea-modal').style.display = 'block';
    
    // Set up modal interactivity for normal brewing teas
    if (isNormalBrewing) {
        setupModalControls(tea);
    }
    
    // Set up commentary toggle if it exists
    const commentaryToggle = document.querySelector('.commentary-toggle');
    if (commentaryToggle) {
        commentaryToggle.addEventListener('click', function() {
            const preview = document.querySelector('.commentary-preview');
            const full = document.querySelector('.commentary-full');
            
            if (preview.style.display !== 'none') {
                preview.style.display = 'none';
                full.style.display = 'block';
                this.textContent = 'Read less';
            } else {
                preview.style.display = 'block';
                full.style.display = 'none';
                this.textContent = 'Read more';
            }
        });
    }
}

/**
 * Set up interactive controls in the tea modal
 * @param {Object} tea - Tea object being displayed
 */
function setupModalControls(tea) {
    // Get references to modal elements
    const brewingToggle = document.getElementById('brewing-toggle');
    const vesselInput = document.getElementById('modal-vessel-input');
    const methodTitle = document.getElementById('brewing-method-title');
    const leafRatioDisplay = document.getElementById('leaf-ratio-display');
    const calculatedAmount = document.getElementById('calculated-amount');
    const unitSystemToggle = document.getElementById('unit-system-toggle');
    const spoonCheckbox = document.getElementById('spoon-checkbox');
    const vesselUnitSpan = document.getElementById('modal-vessel-unit');
    
    // Application state for units
    let currentBrewingMethod = brewingToggle.checked ? 'western' : 'gongfu';
    let currentUnitSystem = unitSystemToggle.checked ? 'imperial' : 'metric';
    let useSpoon = spoonCheckbox.checked;
    
    // Constants for unit conversion
    const TEASPOON_TO_GRAM = 2;   // Approximation: 1 teaspoon ≈ 2g of tea leaves
    const ML_TO_OZ = 0.033814;    // 1 ml ≈ 0.033814 fl oz
    const GRAM_TO_OZ = 0.035274;  // 1 g ≈ 0.035274 oz
    
    // Calculate and update the tea amount based on vessel size and selected units
    function updateCalculatedAmount() {
        // Get the current vessel size from the input
        let vesselSize = parseFloat(vesselInput.value) || 100;
        
        // Figure out if we're using Gong Fu or Western brewing
        const isGongfu = currentBrewingMethod === 'gongfu';
        
        // Extract the leaf to water ratio from the tea
        let leafAmount, waterAmount;
        
        if (isGongfu) {
            // Use Gong Fu ratio
            const ratio = tea.leafRatio.split('/');
            leafAmount = parseFloat(ratio[0]);
            waterAmount = parseFloat(ratio[1]);
        } else {
            // Try to use Western ratio if available
            let westernRatioFound = false;
            
            if (tea.westernSteeping) {
                try {
                    const westernParts = tea.westernSteeping.split(', ');
                    const leafPart = westernParts[0]; // e.g., "2g per 240ml"
                    const leafMatch = leafPart.match(/(\d+\.?\d*)g per (\d+)ml/);
                    
                    if (leafMatch) {
                        leafAmount = parseFloat(leafMatch[1]);
                        waterAmount = parseFloat(leafMatch[2]);
                        westernRatioFound = true;
                    }
                } catch (error) {
                    console.error("Failed to parse western ratio:", error);
                    westernRatioFound = false;
                }
            }
            
            // Fall back to Gong Fu ratio if needed
            if (!westernRatioFound) {
                const ratio = tea.leafRatio.split('/');
                leafAmount = parseFloat(ratio[0]);
                waterAmount = parseFloat(ratio[1]);
            }
        }
        
        // Handle unit conversions
        let vesselSizeInMl = vesselSize;
        let vesselText, teaAmountValue, teaAmountText;
        
        if (currentUnitSystem === 'imperial') {
            // For imperial, input is in fluid ounces
            vesselSizeInMl = vesselSize / ML_TO_OZ;
            vesselText = `${vesselSize.toFixed(1)} fl oz`;
        } else {
            // For metric, input is already in ml
            vesselText = `${Math.round(vesselSizeInMl)} ml`;
        }
        
        // Calculate proportionally how much tea to use (in grams)
        let teaAmountInGrams = (leafAmount * vesselSizeInMl) / waterAmount;
        
        // Format the output based on user preferences
        if (useSpoon) {
            // Convert to teaspoons
            const teaspoons = teaAmountInGrams / TEASPOON_TO_GRAM;
            teaAmountText = `${teaspoons.toFixed(1)} tsp`;
        } else if (currentUnitSystem === 'imperial') {
            // Convert grams to ounces
            const ounces = teaAmountInGrams * GRAM_TO_OZ;
            teaAmountText = `${ounces.toFixed(2)} oz`;
        } else {
            // Use grams
            teaAmountText = `${teaAmountInGrams.toFixed(1)} g`;
        }
        
        // Update the display
        calculatedAmount.textContent = `${teaAmountText} of tea for ${vesselText}`;
        
        // Update vessel unit display
        vesselUnitSpan.textContent = currentUnitSystem === 'imperial' ? 'fl oz' : 'ml';
    }
    
    // Function to update brewing method display
    function updateBrewingMethod() {
        currentBrewingMethod = brewingToggle.checked ? 'western' : 'gongfu';
        
        // Update the title
        methodTitle.textContent = `${currentBrewingMethod === 'gongfu' ? 'Gong Fu Cha' : 'Western Style'} Brewing Guide`;
        
        // Update leaf ratio display
        if (currentBrewingMethod === 'gongfu') {
            const ratio = tea.leafRatio.split('/');
            const leafAmount = parseFloat(ratio[0]);
            const waterAmount = parseFloat(ratio[1]);
            
            if (currentUnitSystem === 'imperial') {
                const leafOz = (leafAmount * GRAM_TO_OZ).toFixed(2);
                const waterOz = (waterAmount * ML_TO_OZ).toFixed(1);
                leafRatioDisplay.textContent = `${leafOz} oz / ${waterOz} fl oz`;
            } else {
                leafRatioDisplay.textContent = `${leafAmount}g / ${waterAmount}ml`;
            }
        } else {
            // Western brewing - with error handling
            try {
                const westernParts = tea.westernSteeping.split(', ');
                const leafPart = westernParts[0]; // e.g., "2g per 240ml"
                const leafMatch = leafPart.match(/(\d+\.?\d*)g per (\d+)ml/);
                
                if (leafMatch) {
                    const westernLeafAmount = parseFloat(leafMatch[1]);
                    const westernWaterAmount = parseFloat(leafMatch[2]);
                    
                    if (currentUnitSystem === 'imperial') {
                        const leafOz = (westernLeafAmount * GRAM_TO_OZ).toFixed(2);
                        const waterOz = (westernWaterAmount * ML_TO_OZ).toFixed(1);
                        leafRatioDisplay.textContent = `${leafOz} oz / ${waterOz} fl oz`;
                    } else {
                        leafRatioDisplay.textContent = `${westernLeafAmount}g / ${westernWaterAmount}ml`;
                    }
                } else {
                    // Use gongfu ratio as fallback
                    const ratio = tea.leafRatio.split('/');
                    const leafAmount = parseFloat(ratio[0]);
                    const waterAmount = parseFloat(ratio[1]);
                    
                    if (currentUnitSystem === 'imperial') {
                        const leafOz = (leafAmount * GRAM_TO_OZ).toFixed(2);
                        const waterOz = (waterAmount * ML_TO_OZ).toFixed(1);
                        leafRatioDisplay.textContent = `${leafOz} oz / ${waterOz} fl oz`;
                    } else {
                        leafRatioDisplay.textContent = `${leafAmount}g / ${waterAmount}ml`;
                    }
                }
            } catch (error) {
                // Use gongfu ratio as fallback
                const ratio = tea.leafRatio.split('/');
                const leafAmount = parseFloat(ratio[0]);
                const waterAmount = parseFloat(ratio[1]);
                
                if (currentUnitSystem === 'imperial') {
                    const leafOz = (leafAmount * GRAM_TO_OZ).toFixed(2);
                    const waterOz = (waterAmount * ML_TO_OZ).toFixed(1);
                    leafRatioDisplay.textContent = `${leafOz} oz / ${waterOz} fl oz`;
                } else {
                    leafRatioDisplay.textContent = `${leafAmount}g / ${waterAmount}ml`;
                }
            }
        }
        
        // Toggle classes for the instructions
        document.querySelectorAll('.steeping-instructions').forEach(el => {
            el.classList.remove('active');
            if ((el.classList.contains('gongfu') && currentBrewingMethod === 'gongfu') || 
                (el.classList.contains('western') && currentBrewingMethod === 'western')) {
                el.classList.add('active');
            }
        });
        
        // Toggle active class for the toggle labels
        document.querySelectorAll('.brewing-toggle .toggle-option').forEach(el => {
            el.classList.remove('active');
            if ((el.classList.contains('gongfu') && currentBrewingMethod === 'gongfu') || 
                (el.classList.contains('western') && currentBrewingMethod === 'western')) {
                el.classList.add('active');
            }
        });
        
        // Update calculated amount
        updateCalculatedAmount();
    }
    
    // Function to update unit system display
    function updateUnitSystem() {
        currentUnitSystem = unitSystemToggle.checked ? 'imperial' : 'metric';
        
        // Convert vessel size value when unit system changes
        const currentValue = parseFloat(vesselInput.value) || 100;
        
        if (currentUnitSystem === 'imperial') {
            // Convert from ml to fl oz
            vesselInput.value = (currentValue * ML_TO_OZ).toFixed(1);
        } else {
            // Convert from fl oz to ml
            vesselInput.value = Math.round(currentValue / ML_TO_OZ);
        }
        
        // Update vessel unit display
        vesselUnitSpan.textContent = currentUnitSystem === 'imperial' ? 'fl oz' : 'ml';
        
        // Toggle active class for the unit system toggle labels
        document.querySelectorAll('.unit-toggle .toggle-option').forEach(el => {
            el.classList.remove('active');
            if ((el.classList.contains('metric') && currentUnitSystem === 'metric') || 
                (el.classList.contains('imperial') && currentUnitSystem === 'imperial')) {
                el.classList.add('active');
            }
        });
        
        // Update leaf ratio display and calculated amount
        updateBrewingMethod(); // This will also call updateCalculatedAmount()
    }
    
    // Function to update spoon preference
    function updateSpoonPreference() {
        useSpoon = spoonCheckbox.checked;
        updateCalculatedAmount();
    }
    
    // Add event listeners for the toggle and vessel size
    brewingToggle.addEventListener('change', updateBrewingMethod);
    vesselInput.addEventListener('input', updateCalculatedAmount);
    unitSystemToggle.addEventListener('change', updateUnitSystem);
    spoonCheckbox.addEventListener('change', updateSpoonPreference);
    
    // Initialize the calculated amount
    updateCalculatedAmount();
}

// ======================================================================
// APPLICATION INITIALIZATION
// ======================================================================

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);