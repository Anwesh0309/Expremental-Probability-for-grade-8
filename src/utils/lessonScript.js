/* =========================================================================
   LESSON SCRIPT — single source of truth for every spoken line.
   ---------------------------------------------------------------------------
   • UI components DISPLAY these exact strings.
   • src/utils/narration.js wraps them in styled segments for playback.
   • scripts/generate_audio.js reads ALL_PHRASES to pre-generate the MP3s.
   Because all three read the same strings, on-screen text and audio can
   never drift apart (1:1 parity).

   CONTENT POLICY: only paragraphs, guidance, hints, and questions are
   narrated. Titles, headings and labels live in the components and are NEVER spoken.
   Plain ESM (no Vite-only APIs) so Node scripts can import it too.
   ========================================================================= */
import { ALL_PRACTICE_QUESTIONS } from '../mathData.js';

export const WONDER = {
  paragraph:
    "Leo flips a coin 10 times and gets heads 7 times. He shouts that his coin is magic and lands on heads 70 percent of the time! His friend Mia says a fair coin should land on heads only half the time.",
  question:
    "Who is right? How many times would Leo need to flip the coin to really find out?"
};

export const STORY = [
  {
    body: "Experimental probability is found by doing an experiment. You count how many times an event happens and divide by the total number of trials. If a coin lands on heads 7 times in 10 flips, the experimental probability of heads is 7 out of 10, or 0.7.",
    style: 'statement'
  },
  {
    body: "Theoretical probability is what we expect when every outcome is equally likely. A fair coin has 2 outcomes, so the theoretical probability of heads is 1 out of 2, or 0.5. Experimental results are often a little different from this.",
    style: 'emphasis'
  },
  {
    body: "We record results in a frequency table. The frequency is how many times each outcome happened. The relative frequency is the frequency divided by the total number of trials. All the relative frequencies always add up to 1.",
    style: 'statement'
  },
  {
    body: "The more trials you do, the closer the experimental probability usually gets to the theoretical probability. 10 flips can easily give 7 heads, but 1000 flips will almost always give close to 500 heads. This is called the law of large numbers.",
    style: 'thinking'
  },
  {
    body: "Leo's mystery is solved! He flipped the coin 1000 more times and got 507 heads. That is 0.507, very close to 0.5. His coin was fair all along. 10 flips were just too few to tell!",
    style: 'encouragement'
  },
  {
    body: "We can use experimental probability to make predictions. Mia scores 18 of her first 30 penalty kicks, which is 0.6. In her next 50 kicks, she can expect to score about 0.6 times 50, which is 30 goals.",
    style: 'statement'
  },
  {
    body: "Experiments can also reveal unfair, or biased, objects. A fair die rolled 600 times should show each number about 100 times. If six appears 180 times, the relative frequency is 0.3, much more than one sixth. That die is probably biased!",
    style: 'emphasis'
  },
  {
    body: "Brilliant! You can now find experimental probability, use frequency tables, compare results with theory, make predictions and spot biased objects. Step into the lab to run experiments, crunch real data and test for fairness!",
    style: 'celebration'
  }
];

export const SIMULATE = {
  1: "Run the experiment! Do lots of trials and watch the experimental probability settle down. Then compare it with the theoretical probability.",
  2: "Be a data scientist! Find the relative frequency of each result, then use it to make a prediction.",
  3: "Fair or biased? Compare the results with what you would expect, then give your verdict like a real investigator."
};

export const SIMULATE_GUIDANCE = {
  1: [
    {
      id: 1,
      desc: "Flip Leo's coin at least 100 times and watch the line settle. Is your experimental P(heads) within 0.05 of the theoretical value?",
      hint: "A fair coin has 2 equally likely outcomes, so the theoretical P(heads) = 1/2 = 0.5. Experimental P = heads ÷ flips."
    },
    {
      id: 2,
      desc: "Roll the die at least 120 times. Find your experimental P(six) and check whether it is within 0.05 of the theory, 1/6.",
      hint: "Theoretical P(6) = 1/6 ≈ 0.17. Experimental P = number of sixes ÷ number of rolls. You can type a fraction like 1/6."
    },
    {
      id: 3,
      desc: "3 of the spinner's 8 equal sections are gold. Spin at least 200 times. Is your experimental P(gold) within 0.05 of 3/8?",
      hint: "3 of the 8 equal sections are gold, so theoretical P(gold) = 3/8 = 0.375. Experimental P = golds ÷ spins."
    }
  ],
  2: [
    {
      id: 1,
      desc: "Emma spun a spinner 20 times. Tap every result to tally it, then find the relative frequency of BLUE and predict the blues in 100 spins.",
      hint: "Relative frequency = 7 ÷ 20. Prediction = relative frequency × 100."
    },
    {
      id: 2,
      desc: "Jack drew a marble from a bag 24 times, putting it back each time. Tally the draws, then predict how many REDS he will get in 120 draws.",
      hint: "Relative frequency = 6 ÷ 24. Prediction = relative frequency × 120."
    },
    {
      id: 3,
      desc: "Mia recorded 30 penalty kicks: Goal, Saved or Missed. Tally them, then predict how many GOALS she will score in her next 50 kicks.",
      hint: "Relative frequency = 18 ÷ 30. Prediction = relative frequency × 50."
    }
  ],
  3: [
    {
      id: 1,
      desc: "Oliver says his coin is lucky because it landed heads 104 times in 200 flips. Compare with a fair coin and give your verdict.",
      hint: "Expected = 0.5 × 200. Relative frequency = 104 ÷ 200. Is it close to 0.5?"
    },
    {
      id: 2,
      desc: "A game die was rolled 600 times. Look at how often each number came up. Is this die fair or biased?",
      hint: "Expected = 1/6 × 600. Relative frequency of six = 180 ÷ 600. Compare with 1/6 ≈ 0.17."
    },
    {
      id: 3,
      desc: "Leo spun a 4-colour spinner 8 times, got 4 reds and cried 'Biased!'. Then he spun it 800 times. Switch between the two data sets, then judge using the bigger one.",
      hint: "Use the 800-spin data. Expected = 0.25 × 800. Relative frequency = 206 ÷ 800 ≈ 0.26."
    }
  ]
};

export const REFLECT = {
  question:
    "Why can a small number of trials give a misleading experimental probability? Explain it to Robo using Leo's coin or your own experiment!"
};

export const FEEDBACK = {
  splitDone: "Awesome! Your experiment results are spot on!",
  buildDone: "Great data work! Your prediction is perfect!",
  reverseDone: "Brilliant! A true probability investigator!",
  tryAgain: "Not quite. Try again!",
  practiceCorrect: "Correct! Excellent work with experimental probability!",
  practiceWrong: "Not quite!",
  outOfHearts: "No worries! Let's practice some more. Try again to master this world!",
  lessonDone: "Outstanding reflection! Lesson complete!"
};

/** Every phrase that should exist as a pre-generated MP3, with its voice style. */
export const ALL_PHRASES = [
  { text: WONDER.paragraph, style: 'statement' },
  { text: WONDER.question, style: 'question' },
  ...STORY.map(s => ({ text: s.body, style: s.style })),
  { text: SIMULATE[1], style: 'instruction' },
  { text: SIMULATE[2], style: 'instruction' },
  { text: SIMULATE[3], style: 'question' },
  ...Object.values(SIMULATE_GUIDANCE).flat().flatMap(a => [
    { text: a.desc, style: 'instruction' },
    { text: a.hint, style: 'thinking' }
  ]),
  ...ALL_PRACTICE_QUESTIONS.flatMap(q => [
    { text: q.prompt, style: 'question' },
    { text: q.hint, style: 'thinking' }
  ]),
  { text: REFLECT.question, style: 'thinking' },
  { text: FEEDBACK.splitDone, style: 'celebration' },
  { text: FEEDBACK.buildDone, style: 'celebration' },
  { text: FEEDBACK.reverseDone, style: 'celebration' },
  { text: FEEDBACK.tryAgain, style: 'encouragement' },
  { text: FEEDBACK.practiceCorrect, style: 'celebration' },
  { text: FEEDBACK.practiceWrong, style: 'encouragement' },
  { text: FEEDBACK.outOfHearts, style: 'encouragement' },
  { text: FEEDBACK.lessonDone, style: 'celebration' }
];
