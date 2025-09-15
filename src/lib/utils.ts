import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Нормализует цвет в HEX формат
 * @param color - цвет в любом формате (hex, rgb, hsl, etc.)
 * @returns HEX строка в формате #RRGGBB
 */
export function normalizeToHex(color: string): string {
  // Если уже HEX формат, возвращаем как есть
  if (color.startsWith("#")) {
    // Убираем # и проверяем длину
    const hex = color.replace("#", "");

    // Если короткий формат (#RGB), расширяем до полного (#RRGGBB)
    if (hex.length === 3) {
      const expanded = hex
        .split("")
        .map((char) => char + char)
        .join("");
      return `#${expanded.toUpperCase()}`;
    }

    // Если полный формат (#RRGGBB), возвращаем в верхнем регистре
    if (hex.length === 6) {
      return `#${hex.toUpperCase()}`;
    }
  }

  // Создаем временный элемент для конвертации
  const tempDiv = document.createElement("div");
  tempDiv.style.color = color;
  document.body.appendChild(tempDiv);

  // Получаем вычисленный цвет в RGB формате
  const computedColor = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  // Парсим RGB значения
  const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);

    // Конвертируем в HEX
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  // Если не удалось распарсить, возвращаем дефолтный цвет
  return "#000000";
}
