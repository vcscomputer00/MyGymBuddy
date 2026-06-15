/**
 * VitalIndia Data Module
 * Loads and provides access to local JSON data files
 * 
 * This module handles loading of:
 * - Foods database (Indian foods with nutritional info)
 * - Exercises database (categorized exercises)
 * - Habits library (daily habit suggestions)
 */

// Data cache to avoid multiple fetches
let dataCache = {
    foods: null,
    exercises: null,
    habits: null
};

/**
 * Load all JSON data files
 * @returns {Promise<Object>} Combined data object
 */
async function loadAllData() {
    try {
        const [foods, exercises, habits] = await Promise.all([
            fetch('data/foods.json').then(res => res.json()),
            fetch('data/exercises.json').then(res => res.json()),
            fetch('data/habits.json').then(res => res.json())
        ]);

        dataCache = { foods, exercises, habits };
        return dataCache;
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data. Please refresh the page.', 'error');
        throw error;
    }
}

/**
 * Get foods data
 * @returns {Object} Foods database
 */
function getFoodsData() {
    return dataCache.foods;
}

/**
 * Get exercises data
 * @returns {Object} Exercises database
 */
function getExercisesData() {
    return dataCache.exercises;
}

/**
 * Get habits data
 * @returns {Object} Habits library
 */
function getHabitsData() {
    return dataCache.habits;
}

/**
 * Filter foods by diet type and region
 * @param {string} dietType - Diet type (vegetarian, non-vegetarian, etc.)
 * @param {string} region - Region preference (north, south, east, west, all)
 * @returns {Object} Filtered foods organized by category
 */
function getFilteredFoods(dietType, region) {
    const foodsData = getFoodsData();
    
    if (!foodsData || !foodsData.foods) {
        console.warn('Foods data not loaded');
        return null;
    }

    const filterFood = (food) => {
        // Check diet type
        if (food.types && !food.types.includes(dietType) && dietType !== 'all') {
            return false;
        }
        // Check region
        if (food.regions && !food.regions.includes(region) && region !== 'all') {
            return false;
        }
        return true;
    };

    const filteredFoods = {};
    
    // Filter each food category
    Object.keys(foodsData.foods).forEach(category => {
        if (category === 'breakfast_options') {
            // Handle breakfast options specially
            filteredFoods.breakfast_options = {};
            Object.keys(foodsData.foods.breakfast_options).forEach(regionKey => {
                if (regionKey === region || region === 'all') {
                    filteredFoods.breakfast_options[regionKey] = foodsData.foods.breakfast_options[regionKey].filter(filterFood);
                }
            });
            // If no specific region, include all
            if (Object.keys(filteredFoods.breakfast_options).length === 0) {
                filteredFoods.breakfast_options = foodsData.foods.breakfast_options;
            }
        } else {
            filteredFoods[category] = foodsData.foods[category].filter(filterFood);
        }
    });

    return filteredFoods;
}

/**
 * Get exercises by category, difficulty, and equipment
 * @param {Object} options - Filter options
 * @param {string} options.category - Muscle group category
 * @param {string} options.difficulty - Fitness level
 * @param {string} options.equipment - Equipment available
 * @returns {Array} Filtered exercises
 */
function getFilteredExercises(options) {
    const exercisesData = getExercisesData();
    
    if (!exercisesData || !exercisesData.exercises) {
        console.warn('Exercises data not loaded');
        return [];
    }

    const { category, difficulty, equipment } = options;
    
    if (category && exercisesData.exercises[category]) {
        let exercises = exercisesData.exercises[category];
        
        // Filter by equipment
        if (equipment) {
            exercises = exercises.filter(ex => {
                if (equipment === 'none') {
                    return ex.equipment === 'none';
                } else if (equipment === 'home') {
                    return ex.equipment === 'none' || ex.equipment === 'home' || 
                           ['chair', 'wall', 'bench'].includes(ex.equipment);
                } else {
                    return true; // Gym has access to all
                }
            });
        }
        
        // Filter by difficulty
        if (difficulty) {
            exercises = exercises.filter(ex => {
                if (difficulty === 'beginner') {
                    return ex.difficulty === 'beginner' || !ex.difficulty;
                } else if (difficulty === 'intermediate') {
                    return ['beginner', 'intermediate'].includes(ex.difficulty);
                } else {
                    return true; // Advanced can do all
                }
            });
        }
        
        return exercises;
    }
    
    // Return all exercises if no category specified
    return exercisesData.exercises;
}

/**
 * Get habits by category and goal type
 * @param {Object} options - Filter options
 * @param {string} options.category - Habit category
 * @param {string} options.stressLevel - User's stress level
 * @param {string} options.goalType - User's goal
 * @returns {Array} Filtered habits
 */
function getFilteredHabits(options) {
    const habitsData = getHabitsData();
    
    if (!habitsData || !habitsData.habits) {
        console.warn('Habits data not loaded');
        return [];
    }

    const { category, stressLevel, goalType } = options;
    
    if (category && habitsData.habits[category]) {
        let habits = habitsData.habits[category];
        
        // Filter by stress level if specified
        if (stressLevel && stressLevel >= 4) {
            const highStressHabits = habits.filter(h => 
                h.stress_level === 'high' || h.stress_level === 'any'
            );
            if (highStressHabits.length > 0) {
                habits = highStressHabits;
            }
        }
        
        // Filter by goal type
        if (goalType) {
            const goalHabits = habits.filter(h => 
                h.goal_type === goalType || h.goal_type === 'all'
            );
            if (goalHabits.length > 0) {
                habits = goalHabits;
            }
        }
        
        return habits;
    }
    
    return habitsData.habits;
}

/**
 * Get a random item from an array
 * @param {Array} array - Source array
 * @returns {*} Random item
 */
function getRandomItem(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get workout template by type
 * @param {string} templateType - Template type
 * @returns {Object} Workout template
 */
function getWorkoutTemplate(templateType) {
    const exercisesData = getExercisesData();
    return exercisesData?.workout_templates?.[templateType] || null;
}

// Export functions for use in other modules
window.VitalData = {
    loadAllData,
    getFoodsData,
    getExercisesData,
    getHabitsData,
    getFilteredFoods,
    getFilteredExercises,
    getFilteredHabits,
    getRandomItem,
    shuffleArray,
    getWorkoutTemplate
};
