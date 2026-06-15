# VitalIndia - Your Personalized Wellness Plan

![VitalIndia](https://img.shields.io/badge/VitalIndia-v1.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-GitHub%20Pages-orange)

**VitalIndia** is a mobile-first, responsive web application designed for Indian users to generate personalized weekly diet, exercise, and habit-building plans. Built entirely with vanilla HTML, CSS, and JavaScript, it requires no backend server and runs entirely in the browser.

## 🌿 Features

### Onboarding Questionnaire
- **Basic Info**: Age, gender, height, weight, target weight
- **Body Type Assessment**: Ectomorph, Mesomorph, Endomorph with plain-language explanations
- **Daily Routine**: Wake/sleep times, work type (desk, field, student, etc.)
- **Activity Preferences**: Exercise time availability, preferred workout time, equipment access
- **Diet Preferences**: Vegetarian, Non-Vegetarian, Vegan, Eggetarian, Jain
- **Regional Cuisine**: North, South, East, West Indian food preferences
- **Stress & Lifestyle**: Stress level, sleep quality, screen time
- **Health Flags**: Optional health conditions for caution notes

### Plan Generation Engine
- **BMR/TDEE Calculation**: Uses Mifflin-St Jeor equation for accurate calorie needs
- **7-Day Diet Plan**: Indian foods (dal, roti, sabzi, rice, idli, poha, etc.) adjusted for region and diet type
- **7-Day Exercise Plan**: Bodyweight, home equipment, or gym routines
- **Daily Habits**: One small, achievable habit per day
- **Rest Days**: Properly scheduled recovery
- **Health Notes**: Personalized caution notes based on health conditions

### Weekly Plan Display
- Clean calendar/table view for each day
- Detailed meals (breakfast, lunch, snacks, dinner)
- Complete workout routines with exercises, sets, and reps
- Daily habit with completion tracking
- Printable/Exportable view via browser print
- Weekly overview for quick reference

### Progress Tracking
- Mark habits and workouts as completed
- Track completion rates
- Weight logging with progress visualization
- 7-day summary with statistics
- Plan adaptation options (increase intensity, add habits, adjust calories)
- Re-take questionnaire anytime to regenerate plan

### Data Persistence
- All data stored in browser localStorage
- No backend server required
- Export/import data functionality
- Clear data option available

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in any modern web browser. The app works entirely client-side.

### Option 2: Local Server
For the best experience, run a local development server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 📁 Project Structure

```
vitalindia/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Responsive CSS styles
├── js/
│   ├── data.js         # Data loading and filtering
│   ├── planner.js      # Plan generation engine
│   └── app.js          # Main application logic
├── data/
│   ├── foods.json      # Indian foods database
│   ├── exercises.json  # Exercises database
│   └── habits.json     # Habits library
├── README.md           # This file
└── LICENSE             # MIT License
```

## 🌐 GitHub Pages Deployment

### Method 1: Direct Upload
1. Fork or clone this repository
2. Go to repository **Settings** > **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select the **main** branch and **/ (root)** folder
5. Click **Save**
6. Wait 1-2 minutes for deployment
7. Your site will be live at: `https://[username].github.io/[repo-name]/`

### Method 2: GitHub Desktop
1. Open the repository in GitHub Desktop
2. Click **Publish repository** (if not already published)
3. Enable **Keep this code private** (optional)
4. Click **Publish**
5. Follow Method 1 steps for Pages configuration

### Custom Domain (Optional)
1. In your repository Settings > Pages
2. Enter your custom domain
3. Add a CNAME record to your DNS provider pointing to `[username].github.io`
4. Wait for DNS propagation (up to 24-48 hours)

## 🔧 Customization

### Adding Foods
Edit `data/foods.json` to add more Indian foods:

```json
{
  "id": "your_food_id",
  "name": "Food Name",
  "serving": "100g",
  "calories": 150,
  "protein": 5,
  "carbs": 25,
  "fat": 3,
  "fiber": 2,
  "regions": ["north", "west"],
  "types": ["vegetarian", "vegan"]
}
```

### Adding Exercises
Edit `data/exercises.json` to expand the exercise library:

```json
{
  "id": "exercise_id",
  "name": "Exercise Name",
  "description": "How to perform the exercise",
  "sets": 3,
  "reps": "10-12",
  "rest": "60 seconds",
  "intensity": "moderate",
  "equipment": "none",
  "muscle_groups": ["chest", "triceps"],
  "difficulty": "beginner"
}
```

### Adding Habits
Edit `data/habits.json` to add more daily habits:

```json
{
  "id": "habit_id",
  "name": "Habit Name",
  "description": "How to do this habit",
  "duration": "5 minutes",
  "time_required": "5 min",
  "stress_level": "any",
  "goal_type": "all",
  "difficulty": "easy",
  "benefits": "What you'll gain"
}
```

## 📊 Data Sources & Attribution

### Nutritional Data
- **Eat Right India** (FSSAI) - https://eatrightindia.gov.in/
- **NICE Portal** - National Institute of Nutrition guidelines
- Standard nutritional databases and food composition tables
- Values are approximations and may vary based on preparation methods

### Exercise Guidance
- **ExRx.net** (Exercise Prescription) - ExRx.net
- **ACE Fitness** - American Council on Exercise
- **DAREBEE** - DAREBEE.com
- **American College of Sports Medicine** (ACSM) guidelines

### Approach Inspiration
- **HealthifyMe** - Indian-focused nutrition tracking
- **Tata Nutrikorner** - Indian nutritional guidance
- **Satvic Movement** - Holistic wellness approach

**Note**: Nutritional values in this app are approximate estimates. For precise nutritional guidance, consult a registered dietitian or use verified food databases.

## ⚠️ Disclaimer

**VitalIndia** provides general wellness guidance only. It is:

- ❌ NOT a substitute for professional medical advice
- ❌ NOT a substitute for registered dietitian/nutritionist consultation
- ❌ NOT designed to diagnose, treat, cure, or prevent any disease

Always consult qualified healthcare professionals before starting any diet or exercise program, especially if you have:
- Pre-existing medical conditions (diabetes, heart disease, etc.)
- Injuries or physical limitations
- Are pregnant or nursing
- Are taking medications that may affect diet/exercise

## 🔮 Future Enhancements

This project is designed for easy extensibility:

### Near-term
- [ ] Add jsPDF for better PDF exports
- [ ] Include more regional Indian foods
- [ ] Add fasting day options (Ekadashi, Navratri, etc.)
- [ ] Add festival-day meal suggestions
- [ ] Include more exercise video demonstrations

### Medium-term
- [ ] AI/ML integration for smarter recommendations
- [ ] User feedback loop for plan improvement
- [ ] Integration with fitness wearables
- [ ] Social features (challenges, sharing)

### Long-term
- [ ] Convert to React/Vue for better state management
- [ ] Add PWA capabilities for offline use
- [ ] Multi-language support (Hindi, regional languages)
- [ ] Backend API for expanded data (optional)

## 🛠️ Technical Details

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

### No Dependencies
This project uses:
- No build tools required
- No npm packages
- No frameworks
- No transpilation

Works directly in the browser with ES6+ JavaScript.

### Performance
- Lazy loading of data files
- CSS-based animations (no JS animation libraries)
- Mobile-first responsive design
- Print-optimized stylesheet

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- All the Indian home cooks whose recipes inspired the food database
- The open-source fitness community for exercise knowledge
- Contributors to public nutritional databases
- Users of wellness apps who shared their feedback and needs

---

**Built with ❤️ for the health-conscious Indian community**

*Remember: Your health is your wealth. Start small, stay consistent, and celebrate every progress!*
