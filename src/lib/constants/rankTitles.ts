const FIRST_PLACE = [
  "Godfather of Pinch Strength",
  "Permanent Pump",
  "Crimp Overlord",
  "Dyno Deity",
];

const SECOND_PLACE = [
  "Vice President of Suffering",
  "Almost Sent the Project",
  "Chalk Dust Aristocrat",
];

const THIRD_PLACE = [
  "Bronze-Tape Warrior",
  "Respectable Forearm Energy",
  "Solid Session Goblin",
];

const MID_PACK = [
  "Friction Enjoyer",
  "Project-Toucher",
  "Gym Rat in Training",
  "Consistent Grinder",
];

const LAST_PLACE = [
  "Chalk-Bag Couch Potato",
  "Plastic-Allergic",
  "Professional Rest Day",
  "Couch-Curious Climber",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]!;
}

export function getWeeklyRankTitle(rank: number, total: number): string {
  if (total === 0) return "Fresh Chalk";
  if (rank === 1) return pick(FIRST_PLACE, total);
  if (rank === 2) return pick(SECOND_PLACE, total + 1);
  if (rank === 3) return pick(THIRD_PLACE, total + 2);
  if (rank === total && total > 3) return pick(LAST_PLACE, rank);
  return pick(MID_PACK, rank);
}
