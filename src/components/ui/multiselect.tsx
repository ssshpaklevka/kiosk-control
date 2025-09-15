import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, ChevronDown, XCircle, XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";
import { Skeleton } from "./skeleton";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default: "border-foreground/10 text-foreground bg-background",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  value?: string[];
  options: MultiSelectOption[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
  side?: "top" | "bottom";
  externalLabels?: { value: string; label: string }[];
  wrapDefaultInArray?: boolean;
  singleSelect?: boolean;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      value,
      defaultValue = [],
      onValueChange,
      variant,
      placeholder = "Выберите пункты",
      animation = 0,
      maxCount = 2,
      modalPopover = false,
      className,
      isLoading = false,
      onOpenChange,
      side,
      externalLabels,
      singleSelect = false,
      ...props
    },
    ref,
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      value || defaultValue,
    );
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(value);
      }
    }, [value]);

    const handleValueChange = (newValues: string[]) => {
      setSelectedValues(newValues);
      onValueChange?.(newValues);
    };

    const toggleOption = (option: string) => {
      if (singleSelect) {
        if (selectedValues.includes(option)) {
          const newValues = selectedValues.filter((v) => v !== option);
          const emptyArray: string[] & { fromSingleSelect?: boolean } =
            newValues;
          if (newValues.length === 0) {
            emptyArray.fromSingleSelect = true;
          }
          handleValueChange(emptyArray);
        } else {
          handleValueChange([option]);
        }
        setIsPopoverOpen(false);
      } else {
        const newValues = selectedValues.includes(option)
          ? selectedValues.filter((v) => v !== option)
          : [...selectedValues.filter((v) => v !== "0"), option];
        handleValueChange(newValues);
      }
    };

    const handleClear = () => {
      const emptyArray: string[] & { fromSingleSelect?: boolean } = [];
      if (singleSelect) {
        emptyArray.fromSingleSelect = true;
      }
      handleValueChange(emptyArray);
    };

    const clearExtraOptions = () => {
      handleValueChange(selectedValues.slice(0, maxCount));
    };

    const toggleAll = () => {
      handleValueChange(
        selectedValues.length === options.length
          ? []
          : options.map((o) => o.value),
      );
    };
    const handlePopoverOpenChange = (open: boolean) => {
      setIsPopoverOpen(open);
      onOpenChange?.(open); // Пробрасываем событие наружу
    };
    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={handlePopoverOpenChange}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            className={cn(
              "flex w-full p-1 rounded-md border min-h-10 h-auto bg-background items-center justify-between hover:border-muted-foreground hover:bg-background [&_svg]:pointer-events-auto",
              className,
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const IconComponent = options.find(
                      (o) => o.value === value,
                    )?.icon;
                    const getLabel = (val: string) =>
                      options.find((o) => o.value === val)?.label ??
                      externalLabels?.find((o) => o.value === val)?.label ??
                      val;

                    return (
                      <Badge
                        key={value}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(value);
                        }}
                        className={cn(multiSelectVariants({ variant }))}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 mr-2" />
                        )}
                        {getLabel(value)}
                        <XCircle className="ml-2 h-4 w-4 cursor-pointer" />
                      </Badge>
                    );
                  })}

                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                        multiSelectVariants({ variant }),
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedValues.length - maxCount} знач.`}
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearExtraOptions();
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="h-4 mx-2 cursor-pointer text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          {...(side && { side })}
          className="w-full p-0"
          align="start"
          onEscapeKeyDown={() => handlePopoverOpenChange(false)}
        >
          <Command>
            {!isLoading && options && options.length > 0 && (
              <CommandInput placeholder="Поиск..." autoFocus />
            )}
            <CommandList>
              {isLoading ? (
                <CommandGroup>
                  {[...Array(4)].map((_, i) => (
                    <CommandItem key={i} className="cursor-pointer">
                      <Skeleton className="mr-2 size-5 bg-muted" />
                      <Skeleton className="h-5 w-full bg-muted" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <>
                  <CommandEmpty>Ничего не найдено</CommandEmpty>
                  <CommandGroup>
                    {options && options.length > 0 && (
                      <CommandItem
                        onSelect={toggleAll}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-5 w-5 items-center justify-center rounded-sm border border-primary",
                            selectedValues.length === options.length
                              ? "bg-primary text-foreground"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <CheckIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span>Выбрать всё</span>
                      </CommandItem>
                    )}
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => toggleOption(option.value)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-5 w-5 items-center justify-center rounded-sm border border-primary",
                            selectedValues.includes(option.value)
                              ? "bg-primary text-foreground"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <CheckIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        {option.icon && (
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{option.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
            <CommandSeparator />
            <div className="flex items-center justify-between p-2">
              {selectedValues.length > 0 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 justify-center cursor-pointer"
                    onClick={handleClear}
                  >
                    Очистить
                  </Button>
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                </>
              )}
              <Button
                type="button"
                variant="ghost"
                className="flex-1 justify-center cursor-pointer"
                onClick={() => handlePopoverOpenChange(false)}
              >
                Закрыть
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
