import { AdvertisingSubSection } from "@/app/3_features/sidebar";
import { HeaderAdvertising } from "./header-advertising/header-advertising";
import { HomeAdvertising } from "./home-advertising/home-advertising";
import { LoyalAdvertising } from "./loyal-advertising/loyal-advertising";

interface AdvertisingProps {
  activeSubSection: AdvertisingSubSection;
}

export const Advertising = ({ activeSubSection }: AdvertisingProps) => {
  const renderSubSection = () => {
    switch (activeSubSection) {
      case "home":
        return <HomeAdvertising />;
      case "loyalty":
        return <LoyalAdvertising />;
      case "product-ads":
        return (
          <div className="flex flex-col gap-6">
            <HeaderAdvertising />
            {/* <CategoryAdvertising />
            <ProductAdvertising /> */}
            {/* <ButtonMenuAdvertising /> */}
          </div>
        );
      default:
        return <HomeAdvertising />;
    }
  };

  return <div className="flex flex-col gap-6">{renderSubSection()}</div>;
};
