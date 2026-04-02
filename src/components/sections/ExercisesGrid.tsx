import ScrollReveal from '../ui/ScrollReveal';
import './ExercisesGrid.css';

const EXERCISES = [
  {
    name: 'Push-ups',
    muscles: 'Chest · Triceps',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <line x1="6" y1="24" x2="14" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="14" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="22" y1="18" x2="30" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="18" cy="14" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    name: 'Squats',
    muscles: 'Quads · Glutes',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M18 10v6M14 20l4-4 4 4M14 20v6M22 20v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Bicep Curls',
    muscles: 'Biceps · Forearms',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M14 28v-8a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="20" cy="10" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    name: 'Jumping Jacks',
    muscles: 'Full Body',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
        <line x1="18" y1="10" x2="18" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="10" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="12" y1="30" x2="18" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="24" y1="30" x2="18" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Plank',
    muscles: 'Core · Shoulders',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <line x1="6" y1="22" x2="30" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="8" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
        <line x1="6" y1="26" x2="10" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="28" y1="22" x2="30" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Lunges',
    muscles: 'Legs · Glutes',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M18 10v6M14 16l-2 10M22 16l4 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function ExercisesGrid() {
  return (
    <section className="exercises" id="exercises">
      <ScrollReveal className="exercises-header" direction="up">
        <span className="section-label">Exercises</span>
        <h2 className="section-heading">
          Train <span className="text-neon">Every Muscle</span>
        </h2>
      </ScrollReveal>

      <div className="exercises-grid">
        {EXERCISES.map((ex, i) => (
          <ScrollReveal key={ex.name} delay={i * 80} direction="up">
            <div className="exercise-card">
              <div className="exercise-icon">{ex.icon}</div>
              <h4 className="exercise-name">{ex.name}</h4>
              <span className="exercise-muscles">{ex.muscles}</span>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
