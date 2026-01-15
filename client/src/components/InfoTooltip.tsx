import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface InfoTooltipProps {
  title: string;
  description: string;
  formula?: string;
  example?: string;
}

export default function InfoTooltip({ title, description, formula, example }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop: Hover tooltip */}
      <div className="hidden md:inline-block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-full w-4 h-4 bg-muted hover:bg-muted-foreground/20 transition-colors">
                <Info className="h-3 w-3 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs p-4 bg-popover border-border">
              <div className="space-y-2">
                <p className="font-semibold text-sm text-popover-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
                {formula && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono text-foreground">
                    {formula}
                  </div>
                )}
                {example && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    <span className="font-semibold">Exemplo:</span> {example}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Mobile: Click dialog */}
      <div className="inline-block md:hidden">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center justify-center rounded-full w-4 h-4 bg-muted hover:bg-muted-foreground/20 transition-colors">
              <Info className="h-3 w-3 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="text-left space-y-3 pt-2">
                <p>{description}</p>
                {formula && (
                  <div className="p-3 bg-muted rounded text-sm font-mono text-foreground">
                    {formula}
                  </div>
                )}
                {example && (
                  <p className="text-sm italic">
                    <span className="font-semibold not-italic">Exemplo:</span> {example}
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
