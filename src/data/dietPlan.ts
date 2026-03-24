export interface DietPlan {
  label: string;
  emoji: string;
}

const dietPlans: DietPlan[] = [
  { label: "Veggies + Meat", emoji: "💪" },
  { label: "Carnivore", emoji: "🥩" },
  { label: "Beast N' Bulk", emoji: "🍖" },
  { label: "Healthy", emoji: "🥗" },
  { label: "Keto", emoji: "🥑" },
];

export default dietPlans;
