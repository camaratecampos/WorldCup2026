import { getFlagUrl } from '../../utils/flags';

interface FlagProps {
  team: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 24, md: 32, lg: 48 };

export function Flag({ team, size = 'md' }: FlagProps) {
  const url = getFlagUrl(team);
  const px = sizeMap[size];
  if (!url) return <span style={{ fontSize: px * 0.7 }}>🏳️</span>;
  return (
    <img
      src={url}
      alt={team}
      width={px}
      height={Math.round(px * 0.75)}
      style={{ objectFit: 'cover', borderRadius: 2, display: 'inline-block', flexShrink: 0 }}
    />
  );
}
