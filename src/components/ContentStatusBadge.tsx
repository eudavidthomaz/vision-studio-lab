import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Send, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentStatusBadgeProps {
  status: string;
  onChange: (newStatus: string) => void;
}

const statusConfig = {
  draft: {
    label: "Rascunho",
    icon: FileText,
    className: "bg-gray-500 text-white hover:bg-gray-600",
  },
  approved: {
    label: "Aprovado",
    icon: CheckCircle2,
    className: "bg-green-500 text-white hover:bg-green-600",
  },
  published: {
    label: "Publicado",
    icon: Send,
    className: "bg-blue-500 text-white hover:bg-blue-600",
  },
  archived: {
    label: "Arquivado",
    icon: Archive,
    className: "bg-orange-500 text-white hover:bg-orange-600",
  },
};

export default function ContentStatusBadge({
  status,
  onChange,
}: ContentStatusBadgeProps) {
  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = currentStatus.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          className={`${currentStatus.className} cursor-pointer text-xs gap-1 transition-all`}
        >
          <Icon className="h-3 w-3" />
          {currentStatus.label}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {Object.entries(statusConfig).map(([key, config]) => {
          const StatusIcon = config.icon;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key)}
              disabled={key === status}
            >
              <StatusIcon className="h-4 w-4 mr-2" />
              {config.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
