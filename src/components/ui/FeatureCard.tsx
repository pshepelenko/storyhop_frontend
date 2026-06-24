import Image from 'next/image';
import Card from './Card';

type FeatureCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  accentClass?: string;
};

export default function FeatureCard({
  title,
  description,
  imageSrc,
  accentClass = 'bg-sh-green-soft',
}: FeatureCardProps) {
  return (
    <Card padding="sm" className="overflow-hidden">
      <div className={`relative h-28 rounded-sh overflow-hidden mb-3 ${accentClass}`}>
        <Image src={imageSrc} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-sh-muted mt-1">{description}</p>
    </Card>
  );
}
