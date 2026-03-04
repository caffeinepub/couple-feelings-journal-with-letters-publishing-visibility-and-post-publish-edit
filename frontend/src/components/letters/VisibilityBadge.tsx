import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';
import { Variant_privateVisibility_publicVisibility } from '../../backend';

interface VisibilityBadgeProps {
  visibility: Variant_privateVisibility_publicVisibility;
}

export default function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const isPublic = visibility === Variant_privateVisibility_publicVisibility.publicVisibility;

  return (
    <Badge
      variant={isPublic ? 'default' : 'secondary'}
      className={`flex items-center gap-1 text-xs ${
        isPublic
          ? 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20'
          : 'bg-muted text-muted-foreground border border-border'
      }`}
    >
      {isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {isPublic ? 'Public' : 'Private'}
    </Badge>
  );
}
