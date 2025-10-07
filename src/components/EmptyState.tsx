import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action, children }: EmptyStateProps) => {
  return (
    <Card className="bg-card/30 backdrop-blur border-border/50">
      <CardContent className="pt-12 pb-12 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
        {action && <div className="mb-6">{action}</div>}
        {children && <div className="mt-8">{children}</div>}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
