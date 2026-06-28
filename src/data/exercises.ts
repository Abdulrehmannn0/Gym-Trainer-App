import { Exercise } from '../types';

export const SAMPLE_EXERCISES: Exercise[] = [
  // Chest
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Barbell, Bench',
    description: 'The standard bench press is a foundational upper-body strength exercise targeting the chest, shoulders, and triceps.',
    instructions: [
      'Lie flat on your back on a bench. Grip the barbell with hands slightly wider than shoulder-width apart.',
      'Unrack the bar and hold it straight over your chest with your arms locked.',
      'Inhale and lower the bar slowly to your mid-chest level.',
      'Exhale and push the bar back up powerfully to the starting position, keeping your feet planted on the floor.'
    ],
    recommendedSets: '4 sets of 8-12 reps',
    benefits: [
      'Builds upper body pushing strength',
      'Increases chest (pectoralis major) muscle mass',
      'Improves bone density in the upper skeleton'
    ]
  },
  {
    id: 'dumbbell-flyes',
    name: 'Dumbbell Flyes',
    muscleGroup: 'Chest',
    difficulty: 'Beginner',
    equipment: 'Dumbbells, Bench',
    description: 'An isolation exercise that stretches and activates the chest muscles through a wide range of motion.',
    instructions: [
      'Lie flat on a bench holding dumbbells directly above your chest with palms facing each other.',
      'Lower the weights out to your sides in a wide arc, keeping a slight bend in your elbows.',
      'Once you feel a deep stretch in your chest, reverse the movement using your chest muscles to bring the dumbbells back together.',
      'Squeeze your chest at the top of the movement.'
    ],
    recommendedSets: '3 sets of 12-15 reps',
    benefits: [
      'Isolates the pectoral muscles without triceps assistance',
      'Provides a deep muscle stretch, promoting hypertrophy',
      'Improves shoulder joint flexibility'
    ]
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Dumbbells, Incline Bench',
    description: 'Targets the upper portion of the pectoral muscles as well as the anterior deltoids.',
    instructions: [
      'Sit on an incline bench angled at 30-45 degrees, holding a dumbbell in each hand at shoulder level.',
      'Press the dumbbells straight up over your chest until your arms are fully extended.',
      'Lower the weights slowly and under control back to shoulder level.',
      'Keep your elbows at roughly a 45-degree angle to your torso.'
    ],
    recommendedSets: '4 sets of 10-12 reps',
    benefits: [
      'Targets the upper clavicular head of the chest',
      'Improves muscular balance across left and right sides',
      'Less strain on the rotator cuffs than flat bench press'
    ]
  },
  // Back
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    equipment: 'Pull-up Bar',
    description: 'A classic bodyweight exercise that is highly effective for building a wide, powerful back.',
    instructions: [
      'Grasp the pull-up bar with an overhand grip, hands slightly wider than shoulder-width.',
      'Hang with arms fully extended and core engaged.',
      'Pull yourself upward by driving your elbows down toward your ribs until your chin clears the bar.',
      'Lower yourself slowly and under control back to the starting dead-hang position.'
    ],
    recommendedSets: '3 sets of max repetitions (or 6-10 reps)',
    benefits: [
      'Develops latissimus dorsi (wing) muscles for a V-taper',
      'Builds exceptional grip and forearm strength',
      'Strengthens the core and shoulder stabilizers'
    ]
  },
  {
    id: 'bent-over-barbell-row',
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    description: 'A compound pulling exercise that builds back thickness and enhances hip hinge stability.',
    instructions: [
      'Stand with feet shoulder-width apart, holding a barbell with an overhand grip.',
      'Hinge at your hips, bending your knees slightly, keeping your back flat and almost parallel to the floor.',
      'Pull the bar up to your lower chest, squeezing your shoulder blades together at the top.',
      'Lower the bar slowly under control back to the arms-extended position.'
    ],
    recommendedSets: '4 sets of 8-10 reps',
    benefits: [
      'Improves posture and spinal alignment',
      'Builds thickness in the rhomboids, lats, and trapezius',
      'Enhances lower back and hamstring endurance'
    ]
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    equipment: 'Cable Machine',
    description: 'An excellent alternative to pull-ups that allows you to easily adjust resistance and isolate the back.',
    instructions: [
      'Sit at a lat pulldown machine and adjust the knee pad. Grip the wide bar with an overhand grip.',
      'Pull the bar down toward your upper chest while leaning back very slightly.',
      'Concentrate on drawing your shoulder blades down and together.',
      'Slowly return the bar to the starting position, fully stretching your lats.'
    ],
    recommendedSets: '3 sets of 10-12 reps',
    benefits: [
      'Easy to adjust weight for progression',
      'Excellent for lat isolation and hypertrophy',
      'Helps build baseline strength for standard pull-ups'
    ]
  },
  // Shoulders
  {
    id: 'overhead-barbell-press',
    name: 'Overhead Barbell Press',
    muscleGroup: 'Shoulders',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    description: 'The ultimate test of upper body strength, this exercise targets the entire shoulder girdle and core.',
    instructions: [
      'Set the barbell in a rack at chest height. Grip the bar with hands just wider than shoulder-width.',
      'Unrack the bar on your upper chest, squeeze your glutes and core to create a solid base.',
      'Press the bar straight overhead, moving your head back slightly to clear the bar.',
      'Push your head forward once the bar clears it, locking your arms out at the top. Lower slowly.'
    ],
    recommendedSets: '4 sets of 6-8 reps',
    benefits: [
      'Builds massive shoulder width and thickness',
      'Strengthens core stabilizers and lower back',
      'Improves vertical pushing athletic power'
    ]
  },
  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    description: 'An isolation move designed to target the lateral (side) head of the deltoids for wider shoulders.',
    instructions: [
      'Stand upright holding dumbbells at your sides, with palms facing inward.',
      'With a very slight bend in your elbows, raise the weights out to your sides in a wide arc.',
      'Stop when your arms are parallel to the floor (shoulder height), with pinkies slightly higher than thumbs.',
      'Lower the dumbbells slowly back to the starting position.'
    ],
    recommendedSets: '3 sets of 12-15 reps',
    benefits: [
      'Creates the optical illusion of a narrower waist by widening the shoulders',
      'Isolates the lateral deltoids specifically',
      'Low joint stress when performed with proper form'
    ]
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    muscleGroup: 'Shoulders',
    difficulty: 'Beginner',
    equipment: 'Cable Machine, Rope',
    description: 'Often overlooked, this exercise is crucial for rear deltoid development and shoulder health.',
    instructions: [
      'Set a cable pulley to upper chest height with a rope attachment.',
      'Hold the rope with an overhand grip and take a few steps back to create tension.',
      'Pull the rope directly toward your face, flaring your elbows and pulling the handles apart.',
      'Squeeze your shoulder blades and hold for a second before returning.'
    ],
    recommendedSets: '3 sets of 15-20 reps',
    benefits: [
      'Develops the rear deltoids and upper back muscles',
      'Corrects rounded shoulders and improves posture',
      'Enhances shoulder external rotation strength'
    ]
  },
  // Arms
  {
    id: 'barbell-bicep-curl',
    name: 'Barbell Bicep Curl',
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    equipment: 'Barbell',
    description: 'The classic biceps building exercise, focusing on maximum contraction and arm strength.',
    instructions: [
      'Stand upright holding a barbell with an underhand grip, hands shoulder-width apart.',
      'Keep your elbows close to your torso and pin them to your sides.',
      'Curl the bar upward by flexing your biceps, keeping your body static.',
      'Squeeze your biceps at the peak, then lower the bar slowly to the start.'
    ],
    recommendedSets: '3 sets of 10-12 reps',
    benefits: [
      'Maximizes bicep peak and arm thickness',
      'Builds grip and forearm strength',
      'Easy to load and track progressive overload'
    ]
  },
  {
    id: 'triceps-cable-pushdown',
    name: 'Triceps Cable Pushdown',
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    equipment: 'Cable Machine, Rope',
    description: 'An isolation exercise that places direct tension on the triceps, particularly the lateral head.',
    instructions: [
      'Attach a rope or straight bar to a high cable pulley.',
      'Grip the attachment and tuck your elbows firmly against your ribs.',
      'Push the weight downward by extending your arms and separating the rope at the bottom.',
      'Squeeze your triceps at full extension, then return slowly to the starting angle.'
    ],
    recommendedSets: '3 sets of 12-15 reps',
    benefits: [
      'Isolates the triceps with constant cable tension',
      'Reduces elbow joint strain compared to overhead extensions',
      'Supports pressing movement stability'
    ]
  },
  {
    id: 'hammer-curls',
    name: 'Hammer Curls',
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    description: 'Targets both the biceps and the brachialis, an underlying muscle that adds significant arm thickness.',
    instructions: [
      'Stand upright holding dumbbells at your sides with palms facing each other (neutral grip).',
      'Curl the dumbbells up toward your shoulders, maintaining the neutral palm position.',
      'Keep your elbows tucked and stationary throughout.',
      'Pause at the peak, then lower the dumbbells slowly.'
    ],
    recommendedSets: '3 sets of 10-12 reps',
    benefits: [
      'Builds both biceps and brachioradialis (forearm)',
      'Provides a thicker look to the arms from the front',
      'Easier on the wrists than standard barbell curls'
    ]
  },
  // Legs
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    difficulty: 'Advanced',
    equipment: 'Barbell, Squat Rack',
    description: 'The king of all leg exercises, building massive lower-body power, strength, and core stability.',
    instructions: [
      'Rest the barbell on your upper traps. Stand with feet slightly wider than shoulder-width, toes turned slightly out.',
      'Inhale, brace your core, and push your hips back to sit down as if into a chair.',
      'Lower yourself until your thighs are at least parallel to the floor, keeping your back straight.',
      'Drive through your mid-foot to return to the standing position, exhaling on the way up.'
    ],
    recommendedSets: '4 sets of 6-10 reps',
    benefits: [
      'Builds complete lower body strength (quads, hamstrings, glutes)',
      'Stimulates high levels of natural growth hormone release',
      'Improves core stability and athletic performance'
    ]
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    difficulty: 'Intermediate',
    equipment: 'Barbell or Dumbbells',
    description: 'Focuses heavily on the posterior chain, strengthening the hamstrings, glutes, and lower back.',
    instructions: [
      'Stand tall holding a barbell in front of you with an overhand grip.',
      'Hinge forward at your hips, sending your glutes backward while keeping your legs mostly straight (slight knee bend).',
      'Lower the bar down the front of your legs until you feel a deep stretch in your hamstrings.',
      'Squeeze your glutes and hamstrings to drive your hips forward and return to standing.'
    ],
    recommendedSets: '4 sets of 8-12 reps',
    benefits: [
      'Exceptional isolation of the hamstrings and glutes',
      'Builds spinal erector and lower back resilience',
      'Enhances hip extension power for jumping/running'
    ]
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Leg Press Machine',
    description: 'A machine-based exercise that allows you to safely lift heavy weights to target the quadriceps.',
    instructions: [
      'Sit in the leg press machine and place your feet shoulder-width apart on the sled platform.',
      'Lower the safety locks and slowly bend your knees to lower the sled toward your chest (stop before your lower back lifts off the seat).',
      'Push the platform away powerfully by extending your legs, but do not lock your knees out.',
      'Repeat for the desired reps.'
    ],
    recommendedSets: '3 sets of 10-12 reps',
    benefits: [
      'Safely overloads leg muscles without loading the spine',
      'Can alter foot placements to target different areas of the thigh',
      'Highly effective for quad hypertrophy'
    ]
  },
  // Core
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'Core',
    difficulty: 'Advanced',
    equipment: 'Pull-up Bar',
    description: 'An exceptional abdominal exercise that targets the lower abs and strengthens grip simultaneously.',
    instructions: [
      'Hang from a pull-up bar with arms straight and shoulders packed.',
      'Keep your legs straight and core tight.',
      'Slowly raise your legs until they are parallel to the floor (creating an L-shape).',
      'Lower your legs slowly and under control, avoiding any swinging or momentum.'
    ],
    recommendedSets: '3 sets of 10-15 reps',
    benefits: [
      'Extremely effective for targeting the lower rectus abdominis',
      'Improves hip flexor strength and flexibility',
      'Builds grip and core endurance'
    ]
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    description: 'An isometric core strength exercise that engages the entire abdominal wall, back, and shoulders.',
    instructions: [
      'Place your forearms on the floor, elbows aligned directly under your shoulders.',
      'Extend your legs straight behind you, supporting your weight on your toes.',
      'Squeeze your glutes and pull your belly button in toward your spine to maintain a straight line from head to heels.',
      'Hold this position, breathing deeply, for the target duration.'
    ],
    recommendedSets: '3 sets of 45-60 second holds',
    benefits: [
      'Improves deep core stability and spinal health',
      'Reduces chronic lower back pain',
      'Builds total-body isometric endurance'
    ]
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    muscleGroup: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight or Medicine Ball',
    description: 'An excellent rotational core exercise that targets the obliques and improves twisting mobility.',
    instructions: [
      'Sit on the floor with knees bent and feet slightly elevated.',
      'Lean back slightly so your torso is at roughly a 45-degree angle to the floor.',
      'Clasp your hands together (or hold a weight) and twist your torso slowly to the right, touching the floor.',
      'Twist back to the left, touching the floor on that side. Continue alternating.'
    ],
    recommendedSets: '3 sets of 20 reps (10 per side)',
    benefits: [
      'Strengthens the obliques and rotational power',
      'Improves balance and hip flexor stability',
      'Functional movement pattern for sports'
    ]
  },
  // Cardio
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    muscleGroup: 'Cardio',
    difficulty: 'Beginner',
    equipment: 'Jump Rope',
    description: 'An incredibly efficient aerobic workout that boosts agility, footwork, and calorie burning.',
    instructions: [
      'Stand upright holding the rope handles at hip level with elbows tucked.',
      'Flick your wrists to swing the rope over your head.',
      'Jump just high enough (about 1 inch) to let the rope pass under your feet, landing softly on the balls of your feet.',
      'Maintain a quick, steady rhythm.'
    ],
    recommendedSets: '4 sets of 1-2 minutes active jumping',
    benefits: [
      'Burns high calories in a short timeframe',
      'Builds calf, ankle, and foot tendon elasticity',
      'Significantly enhances cardiovascular endurance and hand-eye coordination'
    ]
  },
  {
    id: 'burpees',
    name: 'Burpees',
    muscleGroup: 'Cardio',
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    description: 'A full-body calisthenic that combines a squat, push-up, and jump into one high-intensity exercise.',
    instructions: [
      'From a standing position, squat down and place your hands flat on the floor in front of you.',
      'Jump your feet back to land in a push-up plank position.',
      'Perform a full push-up, touching your chest to the floor.',
      'Jump your feet back to the squat position, then jump explosively straight up, clapping hands overhead.'
    ],
    recommendedSets: '3 sets of 10-15 reps',
    benefits: [
      'Rapidly spikes heart rate for metabolic conditioning',
      'Requires zero equipment, can be done anywhere',
      'Combines cardiovascular training with full-body bodyweight resistance'
    ]
  }
];
