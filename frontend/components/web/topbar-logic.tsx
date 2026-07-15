import { LucideIcon } from "lucide-react"
import { ModeToggle } from "./theme-toggle"
import { Button } from "../ui/button"

export type NavItem = {
    label?: string,
    icon?: LucideIcon
    component: Function,
}

type TopbarProps = {
    contents: Array<NavItem>
}

const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    return (
        <Button variant="outline" onClick={item.component()}>
            {Icon && <Icon className="w-4 h-4" />}
            {item.label && <span className="text-sm font-medium">{item.label}</span>}
        </Button>
    );
};

export const TopBar = ({ contents }: TopbarProps) => {
    const leftItems = contents.slice(0, 1);
    const rightItems = contents.slice(1);

    return (
        <nav className="flex items-center w-full gap-4 p-4 text-foreground">
            {/* Left zone */}
            <div className="flex items-center gap-6">
                {leftItems.map((item, index) => (
                    <NavLink key={index} item={item} />
                ))}
            </div>

            {/* Middle zone — badges go here later */}
            <div className="flex flex-1 items-center justify-center">
                {/* badge container placeholder */}
            </div>

            {/* Right zone */}
            <div className="flex items-center gap-6">
                {rightItems.map((item, index) => (
                    <NavLink key={index} item={item} />
                ))}
                <ModeToggle />
            </div>
        </nav>
    );
};
