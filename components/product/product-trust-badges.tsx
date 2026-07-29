export function ProductTrustBadges({
  plantable = true,
}: {
  plantable?: boolean;
}) {
  const badges = [
    { icon: "✋", text: "Ръчна изработка в София" },
    { icon: "♻️", text: "Рециклирана семенна хартия" },
    ...(plantable
      ? [{ icon: "🌱", text: "Може да бъде засадена" }]
      : []),
  ];

  return (
    <div className="mt-6 grid gap-3 border-t border-paper-border pt-6">
      {badges.map((badge) => (
        <div
          key={badge.text}
          className="flex items-center gap-3 text-sm text-paper-text"
        >
          <span className="text-lg" aria-hidden>
            {badge.icon}
          </span>
          <span>{badge.text}</span>
        </div>
      ))}
    </div>
  );
}
