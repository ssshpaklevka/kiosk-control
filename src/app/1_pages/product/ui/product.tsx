import { ProductSubSection } from "@/app/3_features/sidebar";
import { CreatedProduct } from "./created-product";
import { ExtrasTableProducts } from "./extras-table-product";
import { GroupsProduct } from "./groups-product";
import { IngredientsProduct } from "./ingredients-product";
import { RenameProduct } from "./rename-product";
import { SubgroupsProduct } from "./subgroups-product";
import { TableProducts } from "./table-products";
import { TypeTableProducts } from "./type-table-products";

interface ProductProps {
  activeSubSection: ProductSubSection;
}

export const Product = ({ activeSubSection }: ProductProps) => {
  const renderSubSection = () => {
    switch (activeSubSection) {
      case "create":
        return (
          <div className="rounded-2xl border-2">
            <CreatedProduct />
          </div>
        );
      case "rename":
        return (
          <div className="rounded-2xl border-2">
            <RenameProduct />
          </div>
        );
      case "subgroups":
        return <SubgroupsProduct />;
      case "groups":
        return <GroupsProduct />;
      case "ingredients":
        return <IngredientsProduct />;
      case "products":
        return <TableProducts />;
      case "product-types":
        return <TypeTableProducts />;
      case "product-extras":
        return <ExtrasTableProducts />;
      default:
        return (
          <div className="rounded-2xl border-2">
            <CreatedProduct />
          </div>
        );
    }
  };

  return <div className="flex flex-col gap-6">{renderSubSection()}</div>;
};
