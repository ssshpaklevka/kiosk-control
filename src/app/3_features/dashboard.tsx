"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Advertising } from "../1_pages/advertising/ui/advertising";
import { Product } from "../1_pages/product/ui/product";
import { useAuth } from "../providers/auth-provider";
import {
  ActiveSection,
  AdminSidebar,
  AdvertisingSubSection,
  ProductSubSection,
} from "./sidebar";

export function AdminDashboard() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("advertising");
  const [activeSubSection, setActiveSubSection] = useState<
    AdvertisingSubSection | ProductSubSection
  >("home");
  const { user, logout } = useAuth();

  const handleSectionChange = (
    section: ActiveSection,
    subSection?: AdvertisingSubSection | ProductSubSection
  ) => {
    setActiveSection(section);
    if (subSection) {
      setActiveSubSection(subSection);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "advertising":
        return (
          <Advertising
            activeSubSection={activeSubSection as AdvertisingSubSection}
          />
        );
      case "product":
        return (
          <Product activeSubSection={activeSubSection as ProductSubSection} />
        );
      default:
        return (
          <Advertising
            activeSubSection={activeSubSection as AdvertisingSubSection}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        activeSection={activeSection}
        activeSubSection={activeSubSection}
        onSectionChange={handleSectionChange}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              {user && (
                <div className="text-sm text-muted-foreground">
                  <p>Магазин: {user.store.name}</p>
                  <p>Роль: {user.role}</p>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={logout}>
              Выйти
            </Button>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
