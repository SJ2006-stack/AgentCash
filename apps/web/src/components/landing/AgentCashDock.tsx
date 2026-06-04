"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { Activity, BookOpenIcon, MailIcon } from "lucide-react";

import { Dock, DockIcon } from "@/components/magicui/dock";
import { usePrefersReducedMotion } from "@/lib/motion";
import { buttonVariants } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "https://docs.agentcash.tech",
    label: "Docs",
    icon: BookOpenIcon,
    external: true,
  },
] as const;

const SOCIAL_ITEMS = [
  {
    name: "Waitlist",
    href: "mailto:hello@agentcash.tech?subject=AgentCash%20early%20access",
    icon: MailIcon,
    external: true,
  },
  {
    name: "Status",
    href: "https://status.agentcash.tech",
    icon: Activity,
    external: true,
  },
] as const;

const iconButtonClass = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "size-12 rounded-full text-foreground/90 transition-transform hover:bg-emerald-400/10 hover:text-emerald-300 active:scale-95",
);

function DockLink({
  href,
  label,
  icon: Icon,
  external,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  external?: boolean;
}) {
  const linkProps = {
    "aria-label": label,
    className: iconButtonClass,
    children: <Icon className="size-4" />,
  };

  return (
    <DockIcon>
      <Tooltip>
        <TooltipTrigger
          render={
            external ? (
              <a href={href} target="_blank" rel="noopener noreferrer" {...linkProps} />
            ) : (
              <Link href={href} {...linkProps} />
            )
          }
        />
        <TooltipContent side="top" className="border border-emerald-400/20 bg-[#0c1118] text-foreground">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </DockIcon>
  );
}

export function AgentCashDock() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <TooltipProvider delay={200}>
      <Dock direction="middle" disableMagnification={reduceMotion} className="mt-10">
        {NAV_ITEMS.map((item) => (
          <DockLink key={item.label} {...item} />
        ))}
        <Separator orientation="vertical" className="mx-1 h-10 bg-emerald-400/15" />
        {SOCIAL_ITEMS.map((item) => (
          <DockLink
            key={item.name}
            href={item.href}
            label={item.name}
            icon={item.icon}
            external={item.external}
          />
        ))}
      </Dock>
    </TooltipProvider>
  );
}
