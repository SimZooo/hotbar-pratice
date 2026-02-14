import { persisted, type Persisted } from "svelte-persisted-store";
import { writable, get, type Writable } from "svelte/store";

export const VERSION_KEY = "0.13";

export enum Page {
    Main,
    Running,
    Options,
    Tutorial,
}

export enum Item {
    None,
    Pickaxe,
    Axe,
    Waterbucket,
}

export const itemImageMap: Record<Item, string | null> = {
    [Item.None]: null,
    [Item.Pickaxe]: "./pkaxe.webp",
    [Item.Axe]: "./axe.webp",
    [Item.Waterbucket]: "./bucket.webp",
};

export enum GameMode {
    Navigation,
    Sorting,
}

export let current_mode: Writable<GameMode> = writable(GameMode.Navigation);

// Sorting mode state
export let offhand_item: Writable<Item> = writable(Item.None);
export let target_hotbar: Writable<Item[]> = writable([
    Item.None, Item.None, Item.None, Item.None, Item.None,
    Item.None, Item.None, Item.None, Item.None,
]);
export let selected_slot: Writable<number> = writable(0);

export let hotbar: Writable<Item[]> = writable([
    Item.None,
    Item.None,
    Item.None,
    Item.None,
    Item.None,
    Item.None,
    Item.None,
    Item.None,
    Item.None,
]);

export let default_settings = {
    version_key: VERSION_KEY,
    keybinds: {
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5": "5",
        "6": "6",
        "7": "7",
        "8": "8",
        "9": "9",
        offhand: "f",
    },
    options: {
        offhand_enabled: true,
        sorting_target: [Item.Pickaxe, Item.Axe, Item.Waterbucket, Item.None, Item.None, Item.None, Item.None, Item.None, Item.None] as Item[],
    },
};

export function check_updates() {
    console.log("Checking updates");
    settings.update((sets) => {
        stats.update((stats) => {
            console.log(stats.pb_correct_clicks);
            if (stats.pb_correct_clicks === undefined) {
                stats.pb_correct_clicks = 0;
            }
            if (stats.pb_navigation === undefined) {
                stats.pb_navigation = 0;
            }
            if (stats.pb_sorting === undefined) {
                stats.pb_sorting = 0;
            }
            return stats;
        });

        if (sets.version_key === VERSION_KEY) {
            return sets;
        }

        return default_settings;
    });
}

export let settings: Persisted<typeof default_settings> = persisted("settings", { ...default_settings });

export let stats: Persisted<{
    pb_correct_clicks: number;
    pb_navigation: number;
    pb_sorting: number;
}> = persisted("stats", {
    pb_correct_clicks: 0,
    pb_navigation: 0,
    pb_sorting: 0,
});

// Utility functions
export const new_slot = (ignore: number[] | null): number => {
    let r = Math.min(Math.ceil(Math.random() * 9), 8);
    if (ignore !== null) {
        while (ignore.includes(r)) {
            ((r = Math.floor(Math.random() * 9)), 8);
        }
    }
    return r;
};

export const randomise_hotbar = (currentHotbar: Item[]): Item[] => {
    let items = Object.values(Item).filter(
        (item) => typeof item === "string" && item !== Item.None.toString(),
    );

    let ignore = [];
    const newHotbar = [...currentHotbar];

    for (const _ in newHotbar) {
        let i = Math.floor(Math.random() * items.length);
        let rand_item = items[i] as Item;
        items.splice(i, 1);

        let j = new_slot(ignore);
        ignore.push(j);
        newHotbar[j] = rand_item;

        if (items.length === 0) {
            break;
        }
    }

    return newHotbar;
};

export const updateSelectedPos = (
    to_select: number,
    slots: HTMLImageElement[],
    container: HTMLDivElement,
): { left: number; top: number } => {
    const slot = slots[to_select];
    if (slot && container) {
        const containerRect = container.getBoundingClientRect();
        let slot_r = slot.getBoundingClientRect();

        return {
            left: slot_r.left - containerRect.left,
            top: slot_r.top - containerRect.top,
        };
    }
    return { left: 0, top: 0 };
};

export const formatCorrectClicks = (clicks: number): string => {
    return clicks.toString();
};

export const formatTime = (startTime: number): number => {
    return Math.floor((Date.now() - startTime) / 1000) + 1;
};

export const validateAndResetSettings = (
    currentSettings: any,
    defaultSettings: any,
): boolean => {
    return (
        currentSettings.keybinds !== undefined &&
        currentSettings.options !== undefined
    );
};

// Sorting mode functions
export const generateTargetHotbar = (layout?: Item[]): Item[] => {
    if (layout) {
        return [...layout];
    }
    const target = Array(9).fill(Item.None) as Item[];
    target[0] = Item.Pickaxe;
    target[1] = Item.Axe;
    target[2] = Item.Waterbucket;
    return target;
};

export const generateScrambledHotbar = (target: Item[]): Item[] => {
    const items = target.filter((item) => item !== Item.None);
    let scrambled: Item[];
    do {
        scrambled = Array(9).fill(Item.None) as Item[];
        const positions = Array.from({ length: 9 }, (_, i) => i);
        for (const item of items) {
            const idx = Math.floor(Math.random() * positions.length);
            scrambled[positions[idx]] = item;
            positions.splice(idx, 1);
        }
    } while (arraysEqual(scrambled, target));
    return scrambled;
};

export const arraysEqual = (a: Item[], b: Item[]): boolean => {
    return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const swapWithOffhand = (): void => {
    const slot = get(selected_slot);
    const currentHotbar = get(hotbar);
    const currentOffhand = get(offhand_item);

    const slotItem = currentHotbar[slot];
    currentHotbar[slot] = currentOffhand;
    hotbar.set([...currentHotbar]);
    offhand_item.set(slotItem);
};

export const checkSortingWin = (): boolean => {
    return arraysEqual(get(hotbar), get(target_hotbar));
};

export const startSortingRound = (layout?: Item[]): void => {
    const target = generateTargetHotbar(layout);
    target_hotbar.set(target);
    const scrambled = generateScrambledHotbar(target);
    hotbar.set(scrambled);
    offhand_item.set(Item.None);
    selected_slot.set(0);
};

// Game durations
export const durations = [5, 10, 30, 60, 120];
