/**
 * VitalIndia Plan Generation Engine
 * 
 * This module handles the core logic for generating personalized wellness plans:
 * - BMR/TDEE calculations using Mifflin-St Jeor equation
 * - Diet plan generation with Indian foods
 * - Exercise plan generation
 * - Habit suggestions
 * 
 * FUTURE UPGRADE NOTES:
 * - Currently rule-based; can be replaced with ML model for smarter recommendations
 * - Food/exercise data can be expanded with more items
 * - Could add user feedback loop for better personalization
 */

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
 * This is considered the most accurate formula for most people
 * 
 * Formula:
 * Men: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) + 5
 * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) − 161
 * 
 * @param {Object} userData - User's basic info
 * @returns {number} BMR in calories
 */
function calculateBMR(userData) {
    const { gender, weight, height, age } = userData;
    
    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    
    if (gender === 'male') {
        bmr += 5;
    } else if (gender === 'female') {
        bmr -= 161;
    } else {
        // For 'other', use average
        bmr -= 78;
    }
    
    return Math.round(bmr);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * Multiplies BMR by activity multiplier
 * 
 * Activity Multipliers:
 * - Sedentary (desk job, little exercise): 1.2
 * - Lightly active (light exercise 1-3 days/week): 1.375
 * - Moderately active (moderate exercise 3-5 days/week): 1.55
 * - Very active (hard exercise 6-7 days/week): 1.725
 * - Extra active (very hard exercise/physical job): 1.9
 * 
 * @param {number} bmr - Basal Metabolic Rate
 * @param {Object} userData - User's routine and activity data
 * @returns {number} TDEE in calories
 */
function calculateTDEE(bmr, userData) {
    const { workType, exerciseMinutes, fitnessLevel } = userData;
    
    // Determine base activity multiplier from work type
    let workMultiplier = 1.2; // Default sedentary
    
    switch (workType) {
        case 'desk':
            workMultiplier = 1.2;
            break;
        case 'student':
            workMultiplier = 1.3;
            break;
        case 'field':
            workMultiplier = 1.4;
            break;
        case 'homemaker':
            workMultiplier = 1.4;
            break;
        case 'labor':
            workMultiplier = 1.6;
            break;
        case 'retired':
            workMultiplier = 1.2;
            break;
    }
    
    // Adjust for exercise minutes and fitness level
    let exerciseAdjustment = 1.0;
    
    if (exerciseMinutes > 0) {
        // Calculate additional exercise calories
        const weeklyExerciseMinutes = exerciseMinutes * 7;
        
        if (weeklyExerciseMinutes < 150) {
            exerciseAdjustment = 1.1; // Light
        } else if (weeklyExerciseMinutes < 300) {
            exerciseAdjustment = 1.2; // Moderate
        } else {
            exerciseAdjustment = 1.3; // Heavy
        }
    }
    
    // Combine multipliers
    const activityMultiplier = workMultiplier * exerciseAdjustment;
    
    return Math.round(bmr * activityMultiplier);
}

/**
 * Calculate target daily calories based on goal
 * 
 * Goals:
 * - lose_fat: TDEE - 500 calories (deficit)
 * - gain_muscle: TDEE + 300 calories (surplus)
 * - maintain: TDEE
 * - improve_stamina: TDEE - 200 calories (moderate deficit)
 * 
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goal - User's goal
 * @returns {number} Target calories
 */
function calculateTargetCalories(tdee, goal) {
    const adjustments = {
        'lose_fat': -500,
        'gain_muscle': 300,
        'maintain': 0,
        'improve_stamina': -200
    };
    
    const adjustment = adjustments[goal] || 0;
    return Math.max(1200, tdee + adjustment); // Minimum 1200 calories
}

/**
 * Calculate macronutrient split based on goal and body type
 * 
 * Default split: 50% carbs, 20% protein, 30% fat
 * 
 * Adjustments:
 * - lose_fat: Higher protein (30%), lower carbs (40%)
 * - gain_muscle: Higher protein (30%), moderate carbs (45%)
 * - improve_stamina: Higher carbs (55%), moderate protein (20%)
 * 
 * @param {string} goal - User's goal
 * @param {string} bodyType - User's body type
 * @returns {Object} Macro percentages
 */
function calculateMacroSplit(goal, bodyType) {
    // Base split
    let macros = {
        carbs: 50,
        protein: 25,
        fat: 25
    };
    
    // Adjust based on goal
    switch (goal) {
        case 'lose_fat':
            macros = {
                carbs: 40,
                protein: 35,
                fat: 25
            };
            // Endomorphs benefit from slightly lower carbs
            if (bodyType === 'endomorph') {
                macros.carbs = 35;
                macros.protein = 40;
            }
            break;
            
        case 'gain_muscle':
            macros = {
                carbs: 45,
                protein: 35,
                fat: 20
            };
            // Ectomorphs can handle more carbs
            if (bodyType === 'ectomorph') {
                macros.carbs = 50;
                macros.protein = 30;
            }
            break;
            
        case 'improve_stamina':
            macros = {
                carbs: 55,
                protein: 25,
                fat: 20
            };
            break;
    }
    
    return macros;
}

/**
 * Calculate grams of each macro from calories and percentages
 * 
 * @param {number} calories - Daily calories
 * @param {Object} macros - Macro percentages
 * @returns {Object} Macro in grams
 */
function calculateMacroGrams(calories, macros) {
    return {
        carbs: Math.round((calories * macros.carbs / 100) / 4), // 4 cal per gram
        protein: Math.round((calories * macros.protein / 100) / 4), // 4 cal per gram
        fat: Math.round((calories * macros.fat / 100) / 9) // 9 cal per gram
    };
}

/**
 * Generate a 7-day diet plan
 * 
 * This function creates a personalized meal plan using Indian foods
 * based on calorie targets and user preferences
 * 
 * @param {Object} userData - User profile data
 * @param {Object} macros - Macro targets
 * @returns {Array} 7-day meal plan
 */
function generateDietPlan(userData, macros) {
    const { dietType, region, goal, allergies } = userData;
    const { calories } = userData;
    const filteredFoods = window.VitalData.getFilteredFoods(dietType, region);
    
    if (!filteredFoods) {
        console.error('Could not load food data');
        return [];
    }
    
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const plan = [];
    
    // Get breakfast options for the user's region (or all)
    const breakfastRegion = region === 'all' ? 'north' : region;
    const breakfastOptions = filteredFoods.breakfast_options?.[breakfastRegion] || 
                            filteredFoods.breakfast_options?.north || [];
    
    // Distribute calories across meals
    const mealCalories = {
        breakfast: Math.round(calories * 0.25),
        lunch: Math.round(calories * 0.35),
        snack: Math.round(calories * 0.10),
        dinner: Math.round(calories * 0.30)
    };
    
    for (let i = 0; i < 7; i++) {
        const dayPlan = {
            day: dayNames[i],
            dayIndex: i,
            meals: {}
        };
        
        // Generate each meal
        dayPlan.meals.breakfast = generateMeal(
            'breakfast',
            mealCalories.breakfast,
            filteredFoods,
            breakfastOptions,
            i
        );
        
        dayPlan.meals.lunch = generateMeal(
            'lunch',
            mealCalories.lunch,
            filteredFoods,
            null,
            i
        );
        
        dayPlan.meals.snack = generateMeal(
            'snack',
            mealCalories.snack,
            filteredFoods,
            null,
            i
        );
        
        dayPlan.meals.dinner = generateMeal(
            'dinner',
            mealCalories.dinner,
            filteredFoods,
            null,
            i
        );
        
        // Calculate daily totals
        dayPlan.totalCalories = 
            dayPlan.meals.breakfast.calories +
            dayPlan.meals.lunch.calories +
            dayPlan.meals.snack.calories +
            dayPlan.meals.dinner.calories;
        
        dayPlan.totalProtein = 
            dayPlan.meals.breakfast.protein +
            dayPlan.meals.lunch.protein +
            dayPlan.meals.snack.protein +
            dayPlan.meals.dinner.protein;
        
        plan.push(dayPlan);
    }
    
    return plan;
}

/**
 * Generate a single meal with multiple food items
 * 
 * @param {string} mealType - Type of meal (breakfast, lunch, snack, dinner)
 * @param {number} targetCalories - Target calories for this meal
 * @param {Object} filteredFoods - Available foods
 * @param {Array} breakfastOptions - Regional breakfast options (for breakfast meal)
 * @param {number} dayIndex - Day number (for variety)
 * @returns {Object} Meal object with items and nutrition
 */
function generateMeal(mealType, targetCalories, filteredFoods, breakfastOptions, dayIndex) {
    const items = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    // For breakfast, use regional options first
    if (mealType === 'breakfast' && breakfastOptions && breakfastOptions.length > 0) {
        // Pick one breakfast item
        const breakfastIndex = dayIndex % breakfastOptions.length;
        const breakfast = breakfastOptions[breakfastIndex];
        
        items.push({
            name: breakfast.name,
            serving: '1 serving',
            calories: breakfast.calories,
            protein: breakfast.protein
        });
        
        totalCalories += breakfast.calories;
        totalProtein += breakfast.protein;
        
        // Add complementary item
        if (totalCalories < targetCalories * 0.9) {
            const complements = filteredFoods.beverages || [];
            const complement = window.VitalData.getRandomItem(
                complements.filter(c => c.calories < 100)
            );
            
            if (complement) {
                items.push({
                    name: complement.name,
                    serving: complement.serving,
                    calories: complement.calories,
                    protein: complement.protein
                });
                totalCalories += complement.calories;
                totalProtein += complement.protein;
            }
        }
    } else {
        // For other meals, build from categories
        let categories;
        
        switch (mealType) {
            case 'lunch':
                categories = ['grains', 'proteins', 'vegetables'];
                break;
            case 'snack':
                categories = ['snacks', 'beverages'];
                break;
            case 'dinner':
                categories = ['grains', 'proteins', 'vegetables'];
                break;
            default:
                categories = ['grains', 'proteins'];
        }
        
        categories.forEach(category => {
            const foodCategory = filteredFoods[category];
            if (!foodCategory || foodCategory.length === 0) return;
            
            // Select food based on day to ensure variety
            const foodIndex = (dayIndex + items.length) % foodCategory.length;
            const food = foodCategory[foodIndex];
            
            // Add the food
            items.push({
                name: food.name,
                serving: food.serving,
                calories: food.calories,
                protein: food.protein
            });
            
            totalCalories += food.calories;
            totalProtein += food.protein || 0;
            totalCarbs += food.carbs || 0;
            totalFat += food.fat || 0;
        });
    }
    
    return {
        items,
        calories: totalCalories,
        protein: Math.round(totalProtein),
        carbs: totalCarbs,
        fat: totalFat
    };
}

/**
 * Generate a 7-day exercise plan
 * 
 * This function creates a personalized workout plan based on:
 * - Available time
 * - Equipment access
 * - Fitness level
 * - User's goals
 * 
 * Structure follows common fitness programming:
 * - Push/Pull/Legs split for intermediate+
 * - Full body for beginners
 * - Rest days and active recovery
 * 
 * @param {Object} userData - User profile data
 * @returns {Array} 7-day exercise plan
 */
function generateExercisePlan(userData) {
    const { exerciseMinutes, equipment, fitnessLevel, goal } = userData;
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // If no exercise time, return rest days
    if (exerciseMinutes === 0) {
        return dayNames.map((day, i) => ({
            day,
            dayIndex: i,
            type: 'rest',
            workout: null,
            totalDuration: 0,
            caloriesBurn: 0
        }));
    }
    
    // Determine workout split based on fitness level and time
    let workoutSplit;
    
    if (fitnessLevel === 'beginner') {
        // Beginner: Full body 3 days, rest 4 days
        workoutSplit = ['full_body', 'rest', 'full_body', 'rest', 'full_body', 'rest', 'rest'];
    } else if (exerciseMinutes <= 30) {
        // Short time: Full body 3-4 days
        workoutSplit = ['full_body', 'rest', 'full_body', 'rest', 'full_body', 'rest', 'rest'];
    } else if (fitnessLevel === 'intermediate') {
        // Intermediate: Push/Pull/Legs split
        workoutSplit = ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'];
    } else {
        // Advanced: 5-6 days with varying focus
        workoutSplit = ['push', 'pull', 'legs', 'upper', 'lower', 'cardio', 'rest'];
    }
    
    const plan = [];
    
    // Filter exercises based on equipment
    const getWorkoutExercises = (focus) => {
        const exercisesData = window.VitalData.getExercisesData();
        let exercises = [];
        
        // Get warmup exercises (common for all)
        const warmups = exercisesData.exercises.warmup.slice(0, 3);
        
        // Get main workout based on focus
        switch (focus) {
            case 'full_body':
                exercises = getFilteredExercisesForWorkout([
                    'chest', 'back', 'legs', 'core'
                ], equipment, fitnessLevel, 3);
                break;
            case 'push':
                exercises = getFilteredExercisesForWorkout([
                    'chest', 'shoulders', 'arms'
                ], equipment, fitnessLevel, 4);
                break;
            case 'pull':
                exercises = getFilteredExercisesForWorkout([
                    'back', 'arms'
                ], equipment, fitnessLevel, 4);
                break;
            case 'legs':
                exercises = getFilteredExercisesForWorkout([
                    'legs'
                ], equipment, fitnessLevel, 4);
                break;
            case 'upper':
                exercises = getFilteredExercisesForWorkout([
                    'chest', 'back', 'shoulders'
                ], equipment, fitnessLevel, 4);
                break;
            case 'lower':
                exercises = getFilteredExercisesForWorkout([
                    'legs', 'core'
                ], equipment, fitnessLevel, 4);
                break;
            case 'cardio':
                const cardioExercises = exercisesData.exercises.cardio;
                exercises = cardioExercises.slice(0, 3).map(ex => ({
                    ...ex,
                    duration: `${exerciseMinutes} minutes`
                }));
                break;
            case 'rest':
                exercises = exercisesData.exercises.stretching.slice(0, 4);
                break;
            default:
                exercises = getFilteredExercisesForWorkout([
                    'chest', 'back', 'legs', 'core'
                ], equipment, fitnessLevel, 3);
        }
        
        return { warmups, exercises };
    };
    
    // Calculate workout duration based on available time
    const getWorkoutDuration = (focus) => {
        if (focus === 'rest') {
            return exerciseMinutes >= 20 ? 20 : exerciseMinutes;
        }
        
        // Calculate warmup time (5-10 minutes)
        const warmupTime = 5;
        
        // Main workout takes remaining time
        return Math.min(exerciseMinutes - warmupTime, 45);
    };
    
    // Generate each day's workout
    workoutSplit.forEach((focus, i) => {
        const { warmups, exercises } = getWorkoutExercises(focus);
        const workoutDuration = getWorkoutDuration(focus);
        const isRest = focus === 'rest';
        
        // Calculate calories burned
        let caloriesBurn = 0;
        if (!isRest) {
            const avgCaloriesPerMin = isRest ? 3 : 6;
            caloriesBurn = workoutDuration * avgCaloriesPerMin;
        }
        
        // Get active recovery suggestions for rest days
        let workoutDetails = null;
        if (!isRest && exercises.length > 0) {
            workoutDetails = {
                focus: focus.replace('_', ' '),
                duration: workoutDuration,
                warmup: warmups,
                main: exercises,
                stretching: window.VitalData.getExercisesData()?.exercises?.stretching?.slice(0, 3) || []
            };
        }
        
        plan.push({
            day: dayNames[i],
            dayIndex: i,
            type: focus,
            isRest,
            workout: workoutDetails,
            totalDuration: isRest ? 15 : exerciseMinutes,
            caloriesBurn
        });
    });
    
    return plan;
}

/**
 * Get filtered exercises for a workout
 * 
 * @param {Array} categories - Muscle group categories
 * @param {string} equipment - Equipment level
 * @param {string} fitnessLevel - User's fitness level
 * @param {number} count - Number of exercises to select
 * @returns {Array} Selected exercises
 */
function getFilteredExercisesForWorkout(categories, equipment, fitnessLevel, count) {
    const exercisesData = window.VitalData.getExercisesData();
    let allExercises = [];
    
    // Collect exercises from each category
    categories.forEach(category => {
        const categoryExercises = exercisesData.exercises[category] || [];
        allExercises = allExercises.concat(categoryExercises);
    });
    
    // Filter by equipment
    allExercises = allExercises.filter(ex => {
        if (equipment === 'none') {
            return ex.equipment === 'none';
        } else if (equipment === 'home') {
            return ['none', 'home', 'chair', 'wall', 'bench'].includes(ex.equipment);
        }
        return true; // Gym has all
    });
    
    // Filter by difficulty
    if (fitnessLevel === 'beginner') {
        allExercises = allExercises.filter(ex => 
            ex.difficulty === 'beginner' || !ex.difficulty
        );
    } else if (fitnessLevel === 'intermediate') {
        allExercises = allExercises.filter(ex => 
            ['beginner', 'intermediate'].includes(ex.difficulty) || !ex.difficulty
        );
    }
    
    // Remove duplicates and limit count
    const uniqueExercises = [];
    const seen = new Set();
    
    allExercises.forEach(ex => {
        if (!seen.has(ex.id)) {
            seen.add(ex.id);
            uniqueExercises.push(ex);
        }
    });
    
    // Shuffle and return requested count
    return window.VitalData.shuffleArray(uniqueExercises).slice(0, count);
}

/**
 * Generate daily habit suggestions
 * 
 * This function selects one habit per day based on:
 * - The day's focus area (rotating categories)
 * - User's stress level
 * - User's goals
 * 
 * @param {Object} userData - User profile data
 * @returns {Array} 7-day habit plan
 */
function generateHabitPlan(userData) {
    const { stressLevel, goal } = userData;
    const habitsData = window.VitalData.getHabitsData();
    
    if (!habitsData || !habitsData.habits) {
        console.error('Habits data not loaded');
        return [];
    }
    
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Weekly rotation based on category mapping
    const weeklyRotation = [
        'hydration',
        'movement',
        'mindfulness',
        'nutrition',
        'sleep',
        'digital_wellness',
        'social_connection'
    ];
    
    const plan = [];
    
    weeklyRotation.forEach((category, i) => {
        const habits = habitsData.habits[category] || [];
        
        // Filter habits based on user profile
        let filteredHabits = habits.filter(h => 
            h.goal_type === 'all' || h.goal_type === goal
        );
        
        // Prioritize stress-related habits for high-stress users
        if (stressLevel >= 4) {
            const stressHabits = filteredHabits.filter(h => 
                h.stress_level === 'high' || h.stress_level === 'any'
            );
            if (stressHabits.length > 0) {
                filteredHabits = stressHabits;
            }
        }
        
        // Select one habit
        const habit = window.VitalData.getRandomItem(filteredHabits) || habits[0];
        
        if (habit) {
            plan.push({
                day: dayNames[i],
                dayIndex: i,
                category: category,
                habit: {
                    id: habit.id,
                    name: habit.name,
                    description: habit.description,
                    timeRequired: habit.time_required,
                    benefits: habit.benefits
                },
                completed: false
            });
        }
    });
    
    return plan;
}

/**
 * Generate health notes based on user conditions
 * 
 * @param {Object} userData - User profile data
 * @returns {Array} Array of health notes
 */
function generateHealthNotes(userData) {
    const notes = [];
    const conditions = (userData.healthConditions || '').toLowerCase();
    
    // Diabetes
    if (conditions.includes('diabetes') || conditions.includes('diabetic')) {
        notes.push({
            type: 'info',
            title: 'Diabetes Management',
            message: 'Focus on complex carbs (roti, brown rice over white), pair carbs with protein, avoid sugary drinks. Monitor blood sugar regularly.'
        });
    }
    
    // Blood Pressure
    if (conditions.includes('bp') || conditions.includes('blood pressure') || 
        conditions.includes('hypertension')) {
        notes.push({
            type: 'warning',
            title: 'Blood Pressure Care',
            message: 'Reduce salt intake, avoid processed foods, include potassium-rich foods (banana, coconut water), stay hydrated.'
        });
    }
    
    // Thyroid
    if (conditions.includes('thyroid')) {
        notes.push({
            type: 'info',
            title: 'Thyroid Health',
            message: 'Include selenium-rich foods (brazil nuts, fish), avoid excessive soy, maintain consistent iodine intake through iodized salt.'
        });
    }
    
    // Joint Issues
    if (conditions.includes('joint') || conditions.includes('knee') || 
        conditions.includes('arthritis') || conditions.includes('back pain')) {
        notes.push({
            type: 'warning',
            title: 'Joint Care',
            message: 'Opt for low-impact exercises (swimming, cycling instead of running), include anti-inflammatory foods (turmeric, ginger), warm up properly.'
        });
    }
    
    // General wellness notes based on goals
    if (userData.goal === 'lose_fat') {
        notes.push({
            type: 'tip',
            title: 'Fat Loss Tips',
            message: 'Stay consistent with your plan. Small sustainable changes work better than extreme restrictions. Track progress weekly.'
        });
    }
    
    if (userData.goal === 'gain_muscle') {
        notes.push({
            type: 'tip',
            title: 'Muscle Building Tips',
            message: 'Prioritize protein at every meal, get adequate sleep (7-8 hours), allow rest days for muscle recovery.'
        });
    }
    
    // Sleep quality notes
    if (userData.sleepQuality === 'poor') {
        notes.push({
            type: 'warning',
            title: 'Sleep Improvement',
            message: 'Maintain consistent sleep schedule, avoid screens 1 hour before bed, create a relaxing bedtime routine.'
        });
    }
    
    // High stress notes
    if (userData.stressLevel >= 4) {
        notes.push({
            type: 'tip',
            title: 'Stress Management',
            message: 'Include mindfulness activities, take regular breaks, ensure you have leisure time. Consider meditation or deep breathing exercises.'
        });
    }
    
    return notes;
}

/**
 * Generate complete weekly plan
 * 
 * This is the main function that orchestrates the entire plan generation
 * 
 * @param {Object} userData - Complete user profile
 * @returns {Object} Complete weekly plan
 */
function generateWeeklyPlan(userData) {
    // Step 1: Calculate BMR and TDEE
    const bmr = calculateBMR(userData);
    const tdee = calculateTDEE(bmr, userData);
    const targetCalories = calculateTargetCalories(tdee, userData);
    
    // Step 2: Calculate macros
    const macroPercentages = calculateMacroSplit(userData.goal, userData.bodyType);
    const macroGrams = calculateMacroGrams(targetCalories, macroPercentages);
    
    // Add calculated values to user data for plan generation
    const enrichedUserData = {
        ...userData,
        bmr,
        tdee,
        calories: targetCalories,
        macroPercentages,
        macroGrams
    };
    
    // Step 3: Generate individual plans
    const dietPlan = generateDietPlan(enrichedUserData, macroGrams);
    const exercisePlan = generateExercisePlan(enrichedUserData);
    const habitPlan = generateHabitPlan(enrichedUserData);
    const healthNotes = generateHealthNotes(enrichedUserData);
    
    // Step 4: Combine into weekly plan
    const weeklyPlan = {
        generatedAt: new Date().toISOString(),
        userProfile: {
            age: userData.age,
            gender: userData.gender,
            height: userData.height,
            weight: userData.weight,
            targetWeight: userData.targetWeight,
            bodyType: userData.bodyType,
            goal: userData.goal,
            dietType: userData.dietType,
            region: userData.region
        },
        nutrition: {
            bmr,
            tdee,
            targetCalories,
            macroPercentages,
            macroGrams
        },
        days: dayNames.map((dayName, i) => ({
            day: dayName,
            dayIndex: i,
            diet: dietPlan[i] || dietPlan[0],
            exercise: exercisePlan[i],
            habit: habitPlan[i]
        })),
        healthNotes,
        disclaimer: 'This plan provides general wellness guidance. Consult healthcare professionals for medical advice.'
    };
    
    return weeklyPlan;
}

// Day names constant (needed in generateWeeklyPlan)
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Export functions for use in other modules
window.VitalPlanner = {
    calculateBMR,
    calculateTDEE,
    calculateTargetCalories,
    calculateMacroSplit,
    calculateMacroGrams,
    generateDietPlan,
    generateExercisePlan,
    generateHabitPlan,
    generateHealthNotes,
    generateWeeklyPlan
};
