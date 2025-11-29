import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

interface QualityChecklistProps {
  items: { label: string; checked?: boolean }[];
}

export function QualityChecklist({ items }: QualityChecklistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist de Qualidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <label key={item.label} className="flex items-center space-x-2 text-sm">
            <Checkbox checked={item.checked} aria-label={item.label} />
            <span>{item.label}</span>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
