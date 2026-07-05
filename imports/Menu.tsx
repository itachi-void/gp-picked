import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/shadcn-ui/menubar";
import { CheckCircle, EllipsisVertical, Eye, MenuIcon } from "lucide-react";

function Menu() {
  return (
    <div className="w-full">
      <Menubar className="w-full">
        <MenubarMenu>
          <MenubarTrigger>
            <EllipsisVertical />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem>
                View Details
                <MenubarShortcut>
                  <Eye />
                </MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                mark as resolved
                <MenubarShortcut>
                  <CheckCircle />
                </MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup></MenubarGroup>
            <MenubarSeparator />
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
export default Menu;
