/**
 * VitalIndia Main Application
 * 
 * This is the main application module that handles:
 * - UI interactions and navigation
 * - Form handling and validation
 * - LocalStorage persistence
 * - View rendering
 * - Progress tracking
 */

// Application State
const AppState = {
    currentView: 'welcome',
    currentStep: 1,
    totalSteps: 8,
    weeklyPlan: null,
    userData: null,
    currentDay: 0,
    currentWeek: 1,
    progressData: null
};

// Storage Keys
const STORAGE_KEYS = {
    USER_DATA: 'vitalindia_user_data',
    WEEKLY_PLAN: 'vitalindia_weekly_plan',
    PROGRESS: 'vitalindia_progress',
    WEIGHT_LOG: 'vitalindia_weight_log',
    SETTINGS: 'vitalindia_settings'
};

/**
 * Initialize the application
 */
async function initApp() {
    try {
        // Load data first
        await VitalData.loadAllData();
        console.log('Data loaded successfully');
        
        // Load saved data from localStorage
        loadSavedData();
        
        // Show appropriate view
        if (AppState.userData && AppState.weeklyPlan) {
            document.getElementById('continueBtn').style.display = 'block';
        }
        
        // Set up event listeners using addEventListener
        const startBtn = document.getElementById('startBtn');
        const continueBtn = document.getElementById('continueBtn');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const form = document.getElementById('onboardingForm');
        
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                showView('onboarding');
                resetOnboarding();
            });
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', function() {
                showView('plan');
                renderWeeklyPlan();
            });
        }
        
        if (nextBtn) nextBtn.addEventListener('click', nextStep);
        if (prevBtn) prevBtn.addEventListener('click', prevStep);
        if (form) form.addEventListener('submit', handleFormSubmit);
        
        // Plan actions
        const exportPdf = document.getElementById('exportPdf');
        const retakeQuiz = document.getElementById('retakeQuiz');
        if (exportPdf) exportPdf.addEventListener('click', exportToPdf);
        if (retakeQuiz) retakeQuiz.addEventListener('click', function() {
            if (confirm('Start a new plan? This will clear your current progress.')) {
                localStorage.clear();
                location.reload();
            }
        });
        
        // Day selector
        document.querySelectorAll('.day-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                selectDay(parseInt(this.dataset.day));
            });
        });
        
        // Modal
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                document.getElementById('completionModal').classList.remove('active');
            });
        }
        
        // Settings
        const editProfile = document.getElementById('editProfile');
        const exportData = document.getElementById('exportData');
        const clearData = document.getElementById('clearData');
        
        if (editProfile) {
            editProfile.addEventListener('click', function() {
                if (confirm('Edit your profile and generate a new plan?')) {
                    showView('onboarding');
                    resetOnboarding();
                    populateFormFromData();
                }
            });
        }
        
        if (exportData) exportData.addEventListener('click', exportUserData);
        if (clearData) {
            clearData.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
                    localStorage.clear();
                    location.reload();
                }
            });
        }
        
        // Progress
        const logWeight = document.getElementById('logWeight');
        if (logWeight) logWeight.addEventListener('click', logWeight);
        
        console.log('App initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showToast('Failed to load application. Please refresh.', 'error');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/**
 * Load saved data from localStorage
 */
function loadSavedData() {
    try {
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        const weeklyPlan = localStorage.getItem(STORAGE_KEYS.WEEKLY_PLAN);
        const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        const weightLog = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOG);
        
        if (userData) {
            AppState.userData = JSON.parse(userData);
        }
        
        if (weeklyPlan) {
            AppState.weeklyPlan = JSON.parse(weeklyPlan);
        }
        
        if (progress) {
            AppState.progressData = JSON.parse(progress);
        }
        
        if (weightLog) {
            AppState.weightLog = JSON.parse(weightLog);
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

/**
 * Save data to localStorage
 */
function saveData() {
    try {
        if (AppState.userData) {
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(AppState.userData));
        }
        
        if (AppState.weeklyPlan) {
            localStorage.setItem(STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(AppState.weeklyPlan));
        }
        
        if (AppState.progressData) {
            localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(AppState.progressData));
        }
        
        if (AppState.weightLog) {
            localStorage.setItem(STORAGE_KEYS.WEIGHT_LOG, JSON.stringify(AppState.weightLog));
        }
    } catch (error) {
        console.error('Error saving data:', error);
        showToast('Error saving your data', 'error');
    }
}

/**
 * Show a specific view
 */
function showView(viewName) {
    // Hide all views using inline styles for reliability
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active');
    });
    
    // Show target view
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
        targetView.style.display = 'block';
        targetView.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    
    // Show/hide navigation header
    const showNav = ['plan', 'progress', 'settings'].includes(viewName);
    document.getElementById('mainNav').style.display = showNav ? 'flex' : 'none';
    document.getElementById('mobileNav').style.display = showNav ? 'flex' : 'none';
    
    // Special view rendering
    if (viewName === 'plan') {
        renderWeeklyPlan();
    } else if (viewName === 'progress') {
        renderProgress();
    }
    
    AppState.currentView = viewName;
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.style.display = mobileNav.style.display === 'flex' ? 'none' : 'flex';
}

/**
 * Reset onboarding form
 */
function resetOnboarding() {
    AppState.currentStep = 1;
    document.getElementById('onboardingForm').reset();
    updateProgressBar();
    showStep(1);
    
    // Also show the onboarding view
    showView('onboarding');
}

/**
 * Populate form from existing user data
 */
function populateFormFromData() {
    if (!AppState.userData) return;
    
    const data = AppState.userData;
    
    // Set form values
    Object.keys(data).forEach(key => {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = data[key];
        }
    });
}

/**
 * Show specific step
 */
function showStep(step) {
    // Hide all form steps first
    const allSteps = document.querySelectorAll('.form-step');
    allSteps.forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // Show the current step
    const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    if (stepElement) {
        stepElement.style.display = 'block';
        stepElement.classList.add('active');
    }
    
    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.style.display = step > 1 ? 'block' : 'none';
    
    if (step === AppState.totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
    
    document.getElementById('currentStep').textContent = step;
    
    // Scroll to top of form
    document.querySelector('.onboarding-container').scrollTop = 0;
}

/**
 * Update progress bar
 */
function updateProgressBar() {
    const progress = (AppState.currentStep / AppState.totalSteps) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

/**
 * Validate current step
 */
function validateCurrentStep() {
    const currentStepEl = document.querySelector(`.form-step[data-step="${AppState.currentStep}"]`);
    if (!currentStepEl) return true;
    
    const requiredInputs = currentStepEl.querySelectorAll('[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        if (!input.value) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Go to next step
 */
function nextStep() {
    if (!validateCurrentStep()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (AppState.currentStep < AppState.totalSteps) {
        AppState.currentStep++;
        showStep(AppState.currentStep);
        updateProgressBar();
    }
}

/**
 * Go to previous step
 */
function prevStep() {
    if (AppState.currentStep > 1) {
        AppState.currentStep--;
        showStep(AppState.currentStep);
        updateProgressBar();
    }
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect all form data
    const formData = new FormData(e.target);
    const userData = {};
    
    formData.forEach((value, key) => {
        userData[key] = value;
    });
    
    // Handle checkboxes
    if (formData.has('consent')) {
        userData.consent = true;
    }
    
    // Validate consent
    if (!userData.consent) {
        showToast('Please accept the disclaimer to continue', 'error');
        return;
    }
    
    // Save user data
    AppState.userData = userData;
    
    // Generate weekly plan
    try {
        AppState.weeklyPlan = VitalPlanner.generateWeeklyPlan(userData);
        
        // Initialize progress tracking
        AppState.progressData = {
            habits: {},
            workouts: {},
            startDate: new Date().toISOString(),
            currentWeek: 1
        };
        
        // Save to localStorage
        saveData();
        
        // Show success and navigate to plan
        showToast('Your personalized plan is ready!', 'success');
        showView('plan');
        
    } catch (error) {
        console.error('Error generating plan:', error);
        showToast('Error generating your plan. Please try again.', 'error');
    }
}

/**
 * Select a day to view
 */
function selectDay(dayIndex) {
    AppState.currentDay = dayIndex;
    
    // Update tab styling
    document.querySelectorAll('.day-tab').forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.day) === dayIndex);
    });
    
    renderDailyPlan(dayIndex);
}

/**
 * Render weekly plan summary
 */
function renderWeeklyPlan() {
    if (!AppState.weeklyPlan) {
        console.warn('No weekly plan to render');
        return;
    }
    
    const plan = AppState.weeklyPlan;
    
    // Update summary cards
    document.getElementById('calorieTarget').textContent = plan.nutrition.targetCalories;
    document.getElementById('macroSplit').textContent = 
        `${plan.nutrition.macroPercentages.carbs}/${plan.nutrition.macroPercentages.protein}/${plan.nutrition.macroPercentages.fat}`;
    document.getElementById('workoutDuration').textContent = 
        `${plan.days[0].exercise.totalDuration} min`;
    
    // Render weekly grid
    renderWeeklyGrid();
    
    // Render current day
    renderDailyPlan(AppState.currentDay);
    
    // Render health notes
    renderHealthNotes();
}

/**
 * Render weekly grid overview
 */
function renderWeeklyGrid() {
    const grid = document.getElementById('weeklyGrid');
    const plan = AppState.weeklyPlan;
    
    if (!grid || !plan) return;
    
    let html = '';
    
    plan.days.forEach((day, i) => {
        const exerciseType = day.exercise.isRest ? 'Rest Day' : capitalizeFirst(day.exercise.type);
        const calories = day.diet?.totalCalories || 0;
        
        html += `
            <div class="week-day-card" data-day="${i}">
                <div class="day-name">${day.day.substring(0, 3)}</div>
                <div class="workout">${exerciseType}</div>
                <div class="calories">${calories} cal</div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    // Add click handlers
    grid.querySelectorAll('.week-day-card').forEach(card => {
        card.addEventListener('click', () => {
            selectDay(parseInt(card.dataset.day));
        });
    });
}

/**
 * Render daily plan for a specific day
 */
function renderDailyPlan(dayIndex) {
    const container = document.getElementById('dailyPlan');
    const plan = AppState.weeklyPlan;
    
    if (!container || !plan) return;
    
    const day = plan.days[dayIndex];
    
    // Day type label
    const dayType = day.exercise.isRest ? 'Rest Day' : 
                    day.exercise.type === 'cardio' ? 'Cardio Day' :
                    capitalizeFirst(day.exercise.type);
    
    // Calculate daily totals
    const totalCalories = day.diet?.totalCalories || 0;
    const totalProtein = day.diet?.totalProtein || 0;
    
    container.innerHTML = `
        <div class="day-header">
            <div>
                <div class="day-title">${day.day}</div>
                <div style="font-size: 0.875rem; opacity: 0.9;">${totalCalories} calories • ${totalProtein}g protein</div>
            </div>
            <div class="day-type">${dayType}</div>
        </div>
        
        <div class="day-content">
            <!-- Meals Section -->
            <div class="section-card">
                <div class="section-header">
                    <span class="section-icon">🍽️</span>
                    <h3 class="section-title">Meals</h3>
                </div>
                <div class="section-content">
                    ${renderMeals(day.diet)}
                </div>
            </div>
            
            <!-- Exercise Section -->
            <div class="section-card">
                <div class="section-header">
                    <span class="section-icon">💪</span>
                    <h3 class="section-title">Workout</h3>
                </div>
                <div class="section-content">
                    ${renderWorkout(day.exercise)}
                </div>
            </div>
            
            <!-- Habit Section -->
            <div class="section-card">
                <div class="section-header">
                    <span class="section-icon">🎯</span>
                    <h3 class="section-title">Daily Habit</h3>
                </div>
                <div class="section-content">
                    ${renderHabit(day.habit, dayIndex)}
                </div>
            </div>
        </div>
    `;
    
    // Add habit checkbox listener
    setupHabitCheckbox(dayIndex);
}

/**
 * Render meals HTML
 */
function renderMeals(diet) {
    if (!diet) return '<p>No meal data available</p>';
    
    let html = '';
    
    const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
    const mealIcons = {
        breakfast: '🌅',
        lunch: '☀️',
        snack: '🍎',
        dinner: '🌙'
    };
    
    mealTypes.forEach(mealType => {
        const meal = diet.meals?.[mealType];
        if (!meal || !meal.items || meal.items.length === 0) return;
        
        html += `
            <div class="meal-item">
                <div class="meal-type">${mealIcons[mealType]} ${capitalizeFirst(mealType)}</div>
                <div class="meal-details">
                    ${meal.items.map(item => `
                        <div class="meal-name">${item.name}</div>
                    `).join('')}
                    <div class="meal-macros">
                        <span>${meal.calories} cal</span>
                        <span>${meal.protein}g protein</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    return html;
}

/**
 * Render workout HTML
 */
function renderWorkout(exercise) {
    if (exercise.isRest) {
        return `
            <div class="exercise-item" style="background: var(--primary-50);">
                <div style="text-align: center; padding: var(--space-lg);">
                    <div style="font-size: 2rem; margin-bottom: var(--space-sm);">🧘</div>
                    <div style="font-weight: 600; color: var(--primary-600);">Rest & Recovery</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: var(--space-sm);">
                        Take it easy today. Your body needs rest to grow stronger.
                    </div>
                </div>
            </div>
        `;
    }
    
    if (!exercise.workout) {
        return '<p>No workout data available</p>';
    }
    
    const workout = exercise.workout;
    let html = `
        <div style="margin-bottom: var(--space-md); font-size: 0.875rem; color: var(--text-muted);">
            Duration: ${workout.duration} minutes • Focus: ${capitalizeFirst(workout.focus)}
        </div>
    `;
    
    // Warmup
    if (workout.warmup && workout.warmup.length > 0) {
        html += `
            <div style="margin-bottom: var(--space-md);">
                <div style="font-weight: 500; color: var(--secondary-500); margin-bottom: var(--space-sm);">🔥 Warmup</div>
                ${workout.warmup.map(ex => `
                    <div class="exercise-item">
                        <div class="exercise-name">${ex.name}</div>
                        <div class="exercise-sets">${ex.duration}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Main workout
    if (workout.main && workout.main.length > 0) {
        html += `
            <div style="margin-bottom: var(--space-md);">
                <div style="font-weight: 500; color: var(--primary-500); margin-bottom: var(--space-sm);">💪 Main Workout</div>
                ${workout.main.map(ex => `
                    <div class="exercise-item">
                        <div class="exercise-header">
                            <span class="exercise-name">${ex.name}</span>
                            <span class="exercise-sets">${ex.sets ? `${ex.sets} sets × ${ex.reps}` : ex.duration || ''}</span>
                        </div>
                        <div class="exercise-description">${ex.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Stretching
    if (workout.stretching && workout.stretching.length > 0) {
        html += `
            <div>
                <div style="font-weight: 500; color: var(--success); margin-bottom: var(--space-sm);">🧘 Cool Down</div>
                ${workout.stretching.map(ex => `
                    <div class="exercise-item" style="background: var(--gray-50);">
                        <div class="exercise-name">${ex.name}</div>
                        <div class="exercise-sets">${ex.duration}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    return html;
}

/**
 * Render habit HTML
 */
function renderHabit(habit, dayIndex) {
    if (!habit) return '<p>No habit data available</p>';
    
    const isCompleted = AppState.progressData?.habits?.[dayIndex] || false;
    
    return `
        <div class="habit-item" id="habit-${dayIndex}">
            <div class="habit-checkbox ${isCompleted ? 'checked' : ''}" data-day="${dayIndex}"></div>
            <div class="habit-content">
                <div class="habit-name">${habit.habit?.name || 'Daily Habit'}</div>
                <div class="habit-description">${habit.habit?.description || ''}</div>
                <div class="habit-category">⏱️ ${habit.habit?.timeRequired || ''}</div>
            </div>
        </div>
    `;
}

/**
 * Set up habit checkbox interaction
 */
function setupHabitCheckbox(dayIndex) {
    const checkbox = document.querySelector(`.habit-checkbox[data-day="${dayIndex}"]`);
    if (checkbox) {
        checkbox.addEventListener('click', () => {
            toggleHabitCompletion(dayIndex);
        });
    }
}

/**
 * Toggle habit completion
 */
function toggleHabitCompletion(dayIndex) {
    if (!AppState.progressData) {
        AppState.progressData = { habits: {}, workouts: {} };
    }
    
    if (!AppState.progressData.habits) {
        AppState.progressData.habits = {};
    }
    
    AppState.progressData.habits[dayIndex] = !AppState.progressData.habits[dayIndex];
    saveData();
    
    // Update UI
    const checkbox = document.querySelector(`.habit-checkbox[data-day="${dayIndex}"]`);
    if (checkbox) {
        checkbox.classList.toggle('checked');
    }
    
    // Show completion modal
    if (AppState.progressData.habits[dayIndex]) {
        showCompletionModal();
    }
}

/**
 * Show completion modal
 */
function showCompletionModal() {
    document.getElementById('completionModal').classList.add('active');
}

/**
 * Render health notes
 */
function renderHealthNotes() {
    const container = document.getElementById('healthNotes');
    const content = document.getElementById('healthNotesContent');
    
    if (!AppState.weeklyPlan?.healthNotes || AppState.weeklyPlan.healthNotes.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    let html = '';
    AppState.weeklyPlan.healthNotes.forEach(note => {
        html += `<p><strong>${note.title}:</strong> ${note.message}</p>`;
    });
    
    content.innerHTML = html;
}

/**
 * Render progress view
 */
function renderProgress() {
    if (!AppState.progressData) return;
    
    // Calculate stats
    const habitsCompleted = Object.values(AppState.progressData.habits || {}).filter(Boolean).length;
    const workoutsCompleted = Object.values(AppState.progressData.workouts || {}).filter(Boolean).length;
    const totalPossible = 7; // 7 days
    const completionRate = Math.round(((habitsCompleted + workoutsCompleted) / (totalPossible * 2)) * 100);
    
    // Update display
    document.getElementById('habitsCompleted').textContent = `${habitsCompleted}/7`;
    document.getElementById('workoutsCompleted').textContent = `${workoutsCompleted}/5`;
    document.getElementById('completionRate').textContent = `${completionRate}%`;
    
    // Show adaptation section if week is complete
    if (habitsCompleted >= 5 || workoutsCompleted >= 4) {
        document.getElementById('adaptationSection').style.display = 'block';
    }
    
    // Render weight chart
    renderWeightChart();
}

/**
 * Render weight tracking chart
 */
function renderWeightChart() {
    const container = document.getElementById('weightChart');
    
    if (!AppState.weightLog || AppState.weightLog.length === 0) {
        container.innerHTML = '<p class="no-data">Log your weight daily to see progress here</p>';
        return;
    }
    
    // Simple text-based chart
    const recentLogs = AppState.weightLog.slice(-7);
    const startWeight = AppState.userData?.weight || recentLogs[0]?.weight;
    const currentWeight = recentLogs[recentLogs.length - 1]?.weight;
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
            <div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Start</div>
                <div style="font-weight: 600;">${startWeight} kg</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 0.75rem; color: var(--text-muted);">Current</div>
                <div style="font-weight: 600;">${currentWeight} kg</div>
            </div>
            <div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Change</div>
                <div style="font-weight: 600; color: ${currentWeight < startWeight ? 'var(--success)' : 'var(--warning)'};">
                    ${currentWeight < startWeight ? '-' : '+'}${Math.abs(currentWeight - startWeight).toFixed(1)} kg
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Log weight entry
 */
function logWeight() {
    const input = document.getElementById('currentWeight');
    const weight = parseFloat(input.value);
    
    if (!weight || weight < 20 || weight > 300) {
        showToast('Please enter a valid weight', 'error');
        return;
    }
    
    if (!AppState.weightLog) {
        AppState.weightLog = [];
    }
    
    AppState.weightLog.push({
        weight,
        date: new Date().toISOString()
    });
    
    saveData();
    input.value = '';
    renderWeightChart();
    showToast('Weight logged successfully!', 'success');
}

/**
 * Change week for progress tracking
 */
function changeWeek(direction) {
    const newWeek = AppState.currentWeek + direction;
    if (newWeek < 1 || newWeek > 8) return;
    
    AppState.currentWeek = newWeek;
    document.getElementById('currentWeekDisplay').textContent = `Week ${newWeek}`;
    
    // Reload progress for that week (simplified - would need more data structure for full implementation)
}

/**
 * Regenerate plan with adaptations
 */
function regeneratePlan(type) {
    if (!AppState.userData) return;
    
    let userData = { ...AppState.userData };
    
    switch (type) {
        case 'intensity':
            // Increase workout intensity
            userData.fitnessLevel = userData.fitnessLevel === 'beginner' ? 'intermediate' : 'advanced';
            showToast('Workout intensity increased!', 'success');
            break;
        case 'habits':
            // Already included, just regenerate
            showToast('Adding more habits to your plan!', 'success');
            break;
        case 'calories':
            // Adjust calories (simplified)
            userData.goal = 'maintain'; // Reset to maintain for balanced approach
            showToast('Calorie target adjusted!', 'success');
            break;
    }
    
    // Regenerate plan
    AppState.weeklyPlan = VitalPlanner.generateWeeklyPlan(userData);
    AppState.userData = userData;
    saveData();
    
    showView('plan');
}

/**
 * Export to PDF
 */
function exportToPdf() {
    showToast('Preparing PDF for download...', 'success');
    
    // Use browser's print functionality
    window.print();
}

/**
 * Export user data
 */
function exportUserData() {
    const exportData = {
        userProfile: AppState.userData,
        weeklyPlan: AppState.weeklyPlan,
        progress: AppState.progressData,
        weightLog: AppState.weightLog,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitalindia-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
