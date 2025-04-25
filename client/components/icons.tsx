import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  HelpCircle,
  Laptop,
  Loader2,
  type LightbulbIcon as LucideProps,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  X,
  Send,
  MessageSquare,
  Loader,
  type LucideIcon,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  logo: Command,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  google: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      ></path>
    </svg>
  ),
  gitHub: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="github"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 496 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 3.3 2.6-.7 3.6-2.6 2.9-4.6-.6-1.9-3.2-3.2-5.1-2.6-2.7.7-3.7 2.9-3 4.9zm-11.8-19.5c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.3 7.5-3.9 9.1zm62.4-15.2c-1.6 2.9-5.8 3.9-8.8 2.1-2.9-1.7-3.7-5.2-2.1-8.1 1.6-2.9 5.8-3.9 8.8-2.1 2.8 1.7 3.6 5.2 2.1 8.1zm34.7 9.5c-.7 3.6-4.2 5.8-7.8 4.9-3.6-.9-5.8-4.2-5.1-7.8.8-3.6 4.2-5.8 7.8-5 3.6.9 5.9 4.3 5.1 7.9zm32.2 1.1c0 3.7-3 6.6-6.8 6.6s-6.8-3-6.8-6.6c0-3.7 3-6.6 6.8-6.6 3.8-.1 6.8 2.9 6.8 6.6z"
      ></path>
    </svg>
  ),
  twitter: Twitter,
  check: Check,
  send: Send,
  message: MessageSquare,
  loader: Loader,
}
