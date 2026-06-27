
import { LucideIcon } from "lucide-react"

export type NavItem = {
    label?: string,
    icon?: LucideIcon
}

type TopbarProps = {
    contents: Array<NavItem>
}

export const TopBar = ({ contents }: TopbarProps) => {
    return (
        <nav className="flex flex-1 flex-row items-center gap-6 p-4 text-white w-full">
            {contents.map((item, index) => {
                const Icon = item.icon;

                const alignmentClass = index === 1 ? "ml-auto" : "";

                return (
                    <a
                        key={index}
                        className={`flex items-center gap-2 cursor-pointer ${alignmentClass}`}
                    >
                        {Icon && <Icon className="w-3 h-3" />}
                        {item.label && <span className="text-sm font-medium">{item.label}</span>}
                    </a>
                )
            })}
        </nav>
    );
}
