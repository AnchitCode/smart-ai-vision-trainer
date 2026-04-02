import Hero from '../components/sections/Hero';
import LiveDemo from '../components/sections/LiveDemo';
import AICoach from '../components/sections/AICoach';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import ExercisesGrid from '../components/sections/ExercisesGrid';
import FinalCTA from '../components/sections/FinalCTA';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      <Hero />
      <LiveDemo />
      <AICoach />
      <FeaturesGrid />
      <ExercisesGrid />
      <FinalCTA />
    </div>
  );
}
