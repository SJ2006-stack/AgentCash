"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { BookOpenIcon, HomeIcon, MailIcon } from "lucide-react";

import { Dock, DockIcon } from "@/components/magicui/dock";
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
  { href: "/", label: "Home", icon: HomeIcon },
  {
    href: "https://docs.agentcash.tech",
    label: "Docs",
    icon: BookOpenIcon,
    external: true,
  },
] as const;

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  );
}

const SOCIAL_ITEMS = [
  {
    name: "GitHub",
    href: "https://github.com",
    icon: GithubIcon,
    external: true,
  },
  {
    name: "Email",
    href: "mailto:hello@agentcash.tech",
    icon: MailIcon,
    external: true,
  },
] as const;

const iconButtonClass = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "size-12 rounded-full text-foreground/90 hover:bg-emerald-400/10 hover:text-emerald-300",
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
  return (
    <TooltipProvider delay={200}>
      <Dock direction="middle" className="mt-10">
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
