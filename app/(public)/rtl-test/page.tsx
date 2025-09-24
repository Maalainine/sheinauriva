"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useState } from "react";
import {
  IconChevronDown,
  IconSettings,
  IconUser,
  IconLogout,
  IconEdit,
  IconTrash,
  IconCopy,
} from "@tabler/icons-react";

export default function RTLTestPage() {
  const { isRtl, locale } = useLanguage();
  const [position, setPosition] = useState("item-3");
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [showURLs, setShowURLs] = useState(false);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">RTL Support Test Page</h1>
        <p className="text-lg text-muted-foreground">
          Testing dropdown, select, popover, and context menu positioning in{" "}
          {isRtl ? "RTL" : "LTR"} mode
        </p>
        <div className="flex justify-center">
          <LanguageSwitcher />
        </div>
        <Badge variant={isRtl ? "destructive" : "default"}>
          Current Direction:{" "}
          {isRtl ? "RTL (Right-to-Left)" : "LTR (Left-to-Right)"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dropdown Menu Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu Tests</CardTitle>
            <CardDescription>
              Testing various dropdown menu alignments and content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Basic Dropdown:</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Open Menu <IconChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <IconUser className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconSettings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <IconLogout className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Checkbox Items */}
            <div className="space-y-2">
              <label className="text-sm font-medium">With Checkboxes:</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">View Options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>View</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={showBookmarks}
                    onCheckedChange={setShowBookmarks}
                  >
                    Show Bookmarks Bar
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={showURLs}
                    onCheckedChange={setShowURLs}
                  >
                    Show Full URLs
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Radio Items */}
            <div className="space-y-2">
              <label className="text-sm font-medium">With Radio Buttons:</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Position</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={position}
                    onValueChange={setPosition}
                  >
                    <DropdownMenuRadioItem value="top">
                      Top
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="bottom">
                      Bottom
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="right">
                      Right
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Select Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Select Component Tests</CardTitle>
            <CardDescription>
              Testing select dropdown positioning and content alignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Basic Select:</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apple">🍎 Apple</SelectItem>
                  <SelectItem value="banana">🍌 Banana</SelectItem>
                  <SelectItem value="cherry">🍒 Cherry</SelectItem>
                  <SelectItem value="date">🌅 Date</SelectItem>
                  <SelectItem value="elderberry">🫐 Elderberry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language Select:</label>
              <Select defaultValue={locale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Popover Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Popover Tests</CardTitle>
            <CardDescription>
              Testing popover positioning and content alignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Basic Popover:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">About this feature</h4>
                    <p className="text-sm text-muted-foreground">
                      This popover should align properly in both LTR and RTL
                      layouts. The content direction should match the document
                      direction.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Got it</Button>
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Aligned End:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">End Aligned</Button>
                </PopoverTrigger>
                <PopoverContent align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium">End-aligned Popover</h4>
                    <p className="text-sm text-muted-foreground">
                      This popover is aligned to the end. In RTL mode, this
                      should align to the left side of the trigger.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Context Menu Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Context Menu Tests</CardTitle>
            <CardDescription>
              Right-click (or long-press) the areas below to test context menus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-sm">
                Right-click me for basic context menu
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit
                </ContextMenuItem>
                <ContextMenuItem>
                  <IconCopy className="mr-2 h-4 w-4" />
                  Copy
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

            <ContextMenu>
              <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-sm">
                Right-click me for checkbox context menu
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuCheckboxItem checked>
                  Show Grid
                </ContextMenuCheckboxItem>
                <ContextMenuCheckboxItem>Show Ruler</ContextMenuCheckboxItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Reset View</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">What to Test:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  Switch between languages using the language switcher above
                </li>
                <li>Observe how dropdowns position themselves in RTL vs LTR</li>
                <li>
                  Check that checkboxes and radio buttons appear on correct side
                </li>
                <li>Verify that shortcuts align to the correct side</li>
                <li>Test context menus by right-clicking the dashed areas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Expected Behavior:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  <strong>LTR:</strong> Dropdowns align left, icons on left,
                  shortcuts on right
                </li>
                <li>
                  <strong>RTL:</strong> Dropdowns align right, icons on right,
                  shortcuts on left
                </li>
                <li>Content should flow naturally in the document direction</li>
                <li>No overlapping or misaligned content</li>
                <li>Proper transform origins for animations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
