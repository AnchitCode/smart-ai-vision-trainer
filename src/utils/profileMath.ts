export type WorkoutSessionRaw = {
  id: string;
  start_time: string;
  end_time: string;
  total_reps: number;
  good_reps: number;
  bad_reps: number;
};

export type ExerciseSetRaw = {
  id: string;
  session_id: string;
  exercise_type: string;
  reps: number;
};

export type TrendData = {
  value: number; 
  direction: 'up' | 'down' | 'none';
  label: string;
};

export function processProfileData(sessions: WorkoutSessionRaw[], sets: ExerciseSetRaw[]) {
  const totalSessions = sessions.length;
  
  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      totalReps: 0,
      accuracy: 0,
      duration: 0,
      bestSession: null,
      worstSession: null,
      avgAccuracy: 0,
      mostPerformedExercise: null,
      totalRepsByType: {},
      chartData: [],
      currentStreak: 0,
      longestStreak: 0,
      performanceScore: 0,
      trends: {
        accuracy: { value: 0, direction: 'none' as const, label: '0%' },
        sessions: { value: 0, direction: 'none' as const, label: '0' },
      },
      aiCoachMessage: "Welcome to your AI Fitness Hub! Complete your first workout to generate insights.",
      behavioralInsights: []
    };
  }

  /* ── 1. Group By Week (Trends Logic) ── */
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  let currentWeekSessions = 0;
  let currentWeekReps = 0;
  let currentWeekGoodReps = 0;

  let prevWeekSessions = 0;
  let prevWeekReps = 0;
  let prevWeekGoodReps = 0;

  /* ── 2. Core Stats ── */
  let totalReps = 0;
  let totalGoodReps = 0;
  let durationMs = 0;
  let bestSession: WorkoutSessionRaw | null = null;
  let worstSession: WorkoutSessionRaw | null = null;
  let highestAcc = -1;
  let lowestAcc = 101;

  // Track unique workout days for streak and activity behavior
  const workoutDaysMap = new Map<string, number>(); // dateStr -> session count
  const dayOfWeekCount: Record<string, number> = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };

  for (const session of sessions) {
    totalReps += session.total_reps;
    totalGoodReps += session.good_reps;
    
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.end_time).getTime();
    durationMs += Math.max(0, end - start);

    const sessionAcc = session.total_reps > 0 ? (session.good_reps / session.total_reps) * 100 : 0;
    
    if (sessionAcc > highestAcc) { highestAcc = sessionAcc; bestSession = session; }
    if (sessionAcc < lowestAcc) { lowestAcc = sessionAcc; worstSession = session; }
    
    // Trend splitting
    const diffMs = now - start;
    if (diffMs <= ONE_WEEK_MS) {
       currentWeekSessions++;
       currentWeekReps += session.total_reps;
       currentWeekGoodReps += session.good_reps;
    } else if (diffMs <= ONE_WEEK_MS * 2) {
       prevWeekSessions++;
       prevWeekReps += session.total_reps;
       prevWeekGoodReps += session.good_reps;
    }

    // Behavioral
    const dateObj = new Date(session.start_time);
    const dateStr = dateObj.toISOString().split('T')[0];
    workoutDaysMap.set(dateStr, (workoutDaysMap.get(dateStr) || 0) + 1);
    
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    dayOfWeekCount[weekday]++;
  }

  const accuracy = totalReps > 0 ? (totalGoodReps / totalReps) * 100 : 0;
  const duration = Math.round(durationMs / 60000);

  // Calculate Trend Deltas
  const currAcc = currentWeekReps > 0 ? (currentWeekGoodReps / currentWeekReps) * 100 : 0;
  const prevAcc = prevWeekReps > 0 ? (prevWeekGoodReps / prevWeekReps) * 100 : 0;
  
  let accDiff = 0;
  if (prevWeekSessions > 0 || currentWeekSessions > 0) accDiff = Math.round(currAcc - prevAcc);
  
  const sessDiff = currentWeekSessions - prevWeekSessions;

  const trends = {
    accuracy: {
      value: Math.abs(accDiff),
      direction: (accDiff > 0 ? 'up' : accDiff < 0 ? 'down' : 'none') as 'up' | 'down' | 'none',
      label: accDiff > 0 ? `+${Math.abs(accDiff)}%` : accDiff < 0 ? `-${Math.abs(accDiff)}%` : '0%',
    },
    sessions: {
      value: Math.abs(sessDiff),
      direction: (sessDiff > 0 ? 'up' : sessDiff < 0 ? 'down' : 'none') as 'up' | 'down' | 'none',
      label: sessDiff > 0 ? `+${Math.abs(sessDiff)}` : sessDiff < 0 ? `-${Math.abs(sessDiff)}` : '0',
    }
  };

  /* ── 3. Insights (Sets) ── */
  const totalRepsByType: Record<string, number> = {};
  for (const set of sets) {
    if (!totalRepsByType[set.exercise_type]) totalRepsByType[set.exercise_type] = 0;
    totalRepsByType[set.exercise_type] += set.reps;
  }

  let mostPerformedExercise: string | null = null;
  let maxReps = -1;
  for (const [type, reps] of Object.entries(totalRepsByType)) {
    if (reps > maxReps) { maxReps = reps; mostPerformedExercise = type; }
  }

  // Calculate if they are over-relying on one exercise (>65% volume)
  let overRelianceIssue = null;
  if (mostPerformedExercise && totalReps > 0) {
    const ratio = maxReps / totalReps;
    if (ratio > 0.65 && Object.keys(totalRepsByType).length >= 1) {
       const isPushupBase = mostPerformedExercise.toLowerCase().includes('push');
       const suggestion = isPushupBase ? 'lower body (like Squats)' : 'upper body (like Push-ups)';
       overRelianceIssue = `You are heavily relying on ${mostPerformedExercise} (${Math.round(ratio*100)}% of volume) — consider balancing with ${suggestion}.`;
    }
  }

  // Behavioral insight: Best day of week
  let bestDay = 'Monday';
  let bestDayCount = -1;
  for (const [day, count] of Object.entries(dayOfWeekCount)) {
    if (count > bestDayCount) { bestDayCount = count; bestDay = day; }
  }

  const behavioralInsights = [];
  if (bestDayCount > 0) {
    behavioralInsights.push(`You are most consistent on ${bestDay}s.`);
  }
  if (overRelianceIssue) behavioralInsights.push(overRelianceIssue);

  /* ── 4. Streaks ── */
  const sortedDays = Array.from(workoutDaysMap.keys()).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  
  if (sortedDays.includes(todayStr) || sortedDays.includes(yesterdayStr)) {
     let ptrDate = new Date(sortedDays[0]); 
     for (const day of sortedDays) {
       const d = new Date(day);
       const diffTime = Math.abs(ptrDate.getTime() - d.getTime());
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       
       if (diffDays <= 1) { currentStreak++; ptrDate = d; } else break;
     }
  }

  if (sortedDays.length > 0) {
    let ptrDate = new Date(sortedDays[sortedDays.length - 1]);
    tempStreak = 1; longestStreak = 1;
    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const d = new Date(sortedDays[i]);
      const diffTime = Math.abs(d.getTime() - ptrDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) { tempStreak++; longestStreak = Math.max(longestStreak, tempStreak); }
      else if (diffDays > 1) { tempStreak = 1; }
      ptrDate = d;
    }
  }

  /* ── 5. AI Coach Dynamics ── */
  let aiCoachMessage = "Keep up the consistent work!";
  // Edge cases handling: no prior week
  if (prevWeekSessions === 0 && currentWeekSessions > 0) {
    aiCoachMessage = "Great start to the week! Establish a baseline over your first few days.";
  } else if (sessDiff < 0) {
    if (accDiff > 0) aiCoachMessage = `Activity dropped by ${Math.abs(sessDiff)} sessions, but your form quality actually improved by ${accDiff}%!`;
    else aiCoachMessage = "You're losing momentum this week — hop in for a quick session to maintain your streak!";
  } else if (sessDiff >= 0 && accDiff > 0) {
    aiCoachMessage = `Incredible work! Your form accuracy improved by ${accDiff}% compared to last week 💪`;
  } else if (currentStreak >= 3) {
    aiCoachMessage = `You are on a ${currentStreak}-day hot streak! Don't break the chain.`;
  }

  /* ── 6. Chart Data (Last 7 Days) ── */
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDateStr = d.toISOString().split('T')[0];
    
    // Count both sessions and Good Reps to show rich tooltip data
    const daySessions = sessions.filter(s => new Date(s.start_time).toISOString().split('T')[0] === fullDateStr);
    const count = daySessions.length;
    const dayGoodReps = daySessions.reduce((acc, curr) => acc + curr.good_reps, 0);

    chartData.push({ name: label, sessions: count, reps: dayGoodReps});
  }

  /* ── 7. Defined Performance Score Formula ── */
  // Score = 60% Lifetime Accuracy + 20% Weekly Trend + 20% Consistency
  // Weekly Trend normalized: -10% drop -> 0pts, 0% -> 10pts, +10% -> 20pts
  const trendBonus = Math.max(0, Math.min(20, 10 + accDiff)); 
  const accComponent = (accuracy / 100) * 60;
  const streakComponent = Math.min(currentStreak / 5, 1) * 20; 
  
  let performanceScore = Math.round(accComponent + trendBonus + streakComponent);
  if (totalSessions < 3) {
    // Penalty for new accounts so they don't immediately hit 90+ without proving consistency
    performanceScore = Math.min(performanceScore, 65);
  }

  return {
    totalSessions,
    totalReps,
    accuracy,
    duration,
    bestSession,
    worstSession,
    avgAccuracy: accuracy,
    mostPerformedExercise,
    totalRepsByType,
    chartData,
    currentStreak,
    longestStreak,
    performanceScore,
    trends,
    aiCoachMessage,
    behavioralInsights
  };
}
