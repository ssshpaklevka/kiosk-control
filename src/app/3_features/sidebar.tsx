"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Folder,
  Heart,
  Home,
  Layers,
  Package,
  Plus,
  Salad,
  ShoppingCart,
  Tv,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../providers/auth-provider";

export type ActiveSection = "advertising" | "product" | "user";
export type AdvertisingSubSection = "home" | "loyalty" | "product-ads";
export type ProductSubSection =
  | "create"
  | "rename"
  | "subgroups"
  | "groups"
  | "ingredients"
  | "products";

interface AdminSidebarProps {
  activeSection: ActiveSection;
  activeSubSection?: AdvertisingSubSection | ProductSubSection;
  onSectionChange: (
    section: ActiveSection,
    subSection?: AdvertisingSubSection | ProductSubSection
  ) => void;
}

export function AdminSidebar({
  activeSection,
  activeSubSection,
  onSectionChange,
}: AdminSidebarProps) {
  const { user } = useAuth();
  const [isAdvertisingExpanded, setIsAdvertisingExpanded] = useState(
    activeSection === "advertising"
  );
  const [isProductExpanded, setIsProductExpanded] = useState(
    activeSection === "product"
  );

  const getMenuItems = () => {
    const allMenuItems = [
      {
        id: "advertising" as const,
        label: "Реклама",
        icon: Tv,
        hasSubItems: true,
        allowedRoles: ["admin", "manager"],
      },
      {
        id: "product" as const,
        label: "Товар",
        icon: ShoppingCart,
        hasSubItems: true,
        allowedRoles: ["admin", "product"],
      },
    ];

    return user
      ? allMenuItems.filter(
          (item) =>
            item.allowedRoles.includes(user?.role) || user?.role === "admin"
        )
      : allMenuItems;
  };

  const menuItems = getMenuItems();

  const advertisingSubItems = [
    {
      id: "home" as const,
      label: "Главный экран",
      icon: Home,
    },
    {
      id: "loyalty" as const,
      label: "Лояльность",
      icon: Heart,
    },
    {
      id: "product-ads" as const,
      label: "Реклама в каталоге",
      icon: Package,
    },
  ];

  const productSubItems = [
    {
      id: "create" as const,
      label: "Создание продукта",
      icon: Plus,
    },
    {
      id: "rename" as const,
      label: "Редактировать продукт",
      icon: Edit3,
    },
    {
      id: "subgroups" as const,
      label: "Подгруппы",
      icon: Layers,
    },
    {
      id: "groups" as const,
      label: "Группы",
      icon: Folder,
    },
    {
      id: "ingredients" as const,
      label: "Ингредиенты",
      icon: Salad,
    },
    {
      id: "products" as const,
      label: "Продукты",
      icon: Package,
    },
  ];

  const handleMainItemClick = (itemId: ActiveSection) => {
    if (itemId === "advertising") {
      setIsAdvertisingExpanded(!isAdvertisingExpanded);
      setIsProductExpanded(false);
      if (!isAdvertisingExpanded) {
        // При раскрытии автоматически выбираем первую подсекцию
        onSectionChange("advertising", "home");
      }
    } else if (itemId === "product") {
      setIsProductExpanded(!isProductExpanded);
      setIsAdvertisingExpanded(false);
      if (!isProductExpanded) {
        // При раскрытии автоматически выбираем первую подсекцию
        onSectionChange("product", "create");
      }
    } else {
      setIsAdvertisingExpanded(false);
      setIsProductExpanded(false);
      onSectionChange(itemId);
    }
  };

  const handleSubItemClick = (
    subItemId: AdvertisingSubSection | ProductSubSection,
    section: ActiveSection
  ) => {
    onSectionChange(section, subItemId);
  };

  // Проверяем доступность текущего раздела при изменении пользователя
  useEffect(() => {
    if (user && menuItems.length > 0) {
      const currentSectionAvailable = menuItems.some(
        (item) => item.id === activeSection
      );

      if (!currentSectionAvailable) {
        // Если текущий раздел недоступен, переключаемся на первый доступный
        const firstAvailableSection = menuItems[0];
        if (firstAvailableSection) {
          if (firstAvailableSection.id === "advertising") {
            onSectionChange("advertising", "home");
          } else if (firstAvailableSection.id === "product") {
            onSectionChange("product", "create");
          }
        }
      }
    }
  }, [user, menuItems, activeSection, onSectionChange]);

  return (
    <div className="w-64 border-r bg-card flex flex-col items-center">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Админ панель</h2>
      </div>
      <nav className="space-y-1 px-3 w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <div key={item.id} className="w-full">
              <Button
                variant={isActive && !item.hasSubItems ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-between gap-2",
                  isActive && !item.hasSubItems && "bg-secondary"
                )}
                onClick={() => handleMainItemClick(item.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  {item.label}
                </div>
                {item.hasSubItems &&
                  ((isAdvertisingExpanded && item.id === "advertising") ||
                  (isProductExpanded && item.id === "product") ? (
                    <ChevronDown size={16} />
                  ) : item.hasSubItems ? (
                    <ChevronRight size={16} />
                  ) : null)}
              </Button>

              {/* Подменю для рекламы */}
              {item.id === "advertising" && isAdvertisingExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {advertisingSubItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = activeSubSection === subItem.id;

                    return (
                      <Button
                        key={subItem.id}
                        variant={isSubActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start gap-2 text-sm",
                          isSubActive && "bg-secondary"
                        )}
                        onClick={() =>
                          handleSubItemClick(subItem.id, "advertising")
                        }
                      >
                        <SubIcon size={14} />
                        {subItem.label}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Подменю для продуктов */}
              {item.id === "product" && isProductExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {productSubItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = activeSubSection === subItem.id;

                    return (
                      <Button
                        key={subItem.id}
                        variant={isSubActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start gap-2 text-sm",
                          isSubActive && "bg-secondary"
                        )}
                        onClick={() =>
                          handleSubItemClick(subItem.id, "product")
                        }
                      >
                        <SubIcon size={14} />
                        {subItem.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* <Button className="mt-10" onClick={handleLogout}>
        <LogOut />
        Выйти из аккаунта
      </Button> */}
    </div>
  );
}
