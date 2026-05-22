export type LoginMotivationTone = "classic" | "ondra";

export interface LoginMotivationQuote {
  text: string;
  tone: LoginMotivationTone;
}

export const LOGIN_MOTIVATION_QUOTES: LoginMotivationQuote[] = [
  {
    text: "Someone is flashing your project while you're sitting on the mat eating a banana.",
    tone: "classic",
  },
  {
    text: "While you are resting your forearms, someone else is growing theirs.",
    tone: "classic",
  },
  {
    text: "Every minute you spend brushing the hold is a minute someone else is sending it.",
    tone: "classic",
  },
  {
    text: "The mat is comfortable, but the top-out is forever. Get up.",
    tone: "classic",
  },
  {
    text: "Someone is screaming louder than you right now.",
    tone: "ondra",
  },
  {
    text: "While you rest, someone else is dry-campusing your project in their sleep.",
    tone: "ondra",
  },
  {
    text: "Your skin is healing? Weak. Someone else is bleeding their way to victory.",
    tone: "ondra",
  },
  {
    text: "That banana isn't going to send your project for you.",
    tone: "classic",
  },
  {
    text: "Chalk is temporary. The send is eternal. Probably.",
    tone: "classic",
  },
  {
    text: "Your project doesn't care that your tendons filed a formal complaint.",
    tone: "ondra",
  },
];

export function pickLoginMotivation(): LoginMotivationQuote {
  const i = Math.floor(Math.random() * LOGIN_MOTIVATION_QUOTES.length);
  return LOGIN_MOTIVATION_QUOTES[i]!;
}
