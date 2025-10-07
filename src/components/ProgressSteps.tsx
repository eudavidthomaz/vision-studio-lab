import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Step {
  label: string;
  status: "pending" | "active" | "completed";
}

interface ProgressStepsProps {
  steps: Step[];
  currentProgress: number;
}

const ProgressSteps = ({ steps, currentProgress }: ProgressStepsProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <Progress value={currentProgress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {Math.round(currentProgress)}% completo
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                {step.status === "completed" && (
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                )}
                {step.status === "active" && (
                  <Loader2 className="w-6 h-6 text-primary animate-spin flex-shrink-0" />
                )}
                {step.status === "pending" && (
                  <div className="w-6 h-6 rounded-full border-2 border-muted flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    step.status === "active"
                      ? "text-white font-semibold"
                      : step.status === "completed"
                      ? "text-muted-foreground line-through"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressSteps;
