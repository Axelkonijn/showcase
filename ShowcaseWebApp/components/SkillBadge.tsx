export default function SkillBadge({ name }: { name: string }) {
  return (
    <span className="
      inline-block 
      bg-accent/5 
      dark:bg-accent/10 
      text-accent 
      px-3 py-1 
      rounded-full 
      text-xs font-medium 
      border border-accent/20 
      mr-2 mb-2 
      transition-all 
      hover:bg-accent/15 
      hover:border-accent/40"
    >
      {name}
    </span>
  );
}