/* =========================================================================
   NARRATION SCRIPTS — maps each lesson phase to its spoken segments.
   Only on-screen paragraph text, guidance, hints and questions are narrated.
   Every string comes from lessonScript.js / mathData.js, the same source the UI displays.
   ========================================================================= */
import { say, ask, think, instruct, cheer, encourage } from './audio.js';
import { WONDER, STORY, SIMULATE, SIMULATE_GUIDANCE, REFLECT, FEEDBACK } from './lessonScript.js';

export function wonderNarration() {
  return [say(WONDER.paragraph), ask(WONDER.question)];
}

export function getStoryNarration(slideIndex) {
  const slide = STORY[slideIndex];
  return slide ? [{ text: slide.body, style: slide.style }] : [];
}

export function simulateStationIntro(station) {
  if (station === 3) return [ask(SIMULATE[3])];
  return [instruct(SIMULATE[station])];
}

export function simulateActivityNarration(station, actIdx, includeStationIntro = false) {
  const act = SIMULATE_GUIDANCE[station]?.[actIdx];
  if (!act) return includeStationIntro ? simulateStationIntro(station) : [];
  return includeStationIntro
    ? [...simulateStationIntro(station), instruct(act.desc)]
    : [instruct(act.desc)];
}

export function simulateHintNarration(station, actIdx) {
  const act = SIMULATE_GUIDANCE[station]?.[actIdx];
  return act ? [think(act.hint)] : [];
}

export function practiceQuestionNarration(prompt) {
  return prompt ? [ask(prompt)] : [];
}

export function practiceHintNarration(hint) {
  return hint ? [think(hint)] : [];
}

export function reflectQuestionNarration() {
  return [think(REFLECT.question)];
}

export const feedbackNarration = {
  splitDone: () => [cheer(FEEDBACK.splitDone)],
  buildDone: () => [cheer(FEEDBACK.buildDone)],
  reverseDone: () => [cheer(FEEDBACK.reverseDone)],
  tryAgain: () => [encourage(FEEDBACK.tryAgain)],
  practiceCorrect: () => [cheer(FEEDBACK.practiceCorrect)],
  practiceWrong: () => [encourage(FEEDBACK.practiceWrong)],
  outOfHearts: () => [encourage(FEEDBACK.outOfHearts)],
  lessonDone: () => [cheer(FEEDBACK.lessonDone)]
};
