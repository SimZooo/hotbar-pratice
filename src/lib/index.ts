import { persisted, type Persisted } from "svelte-persisted-store";
import { writable, type Writable } from "svelte/store";

export const VERSION_KEY = "0.12";

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

export enum GameMode {
    Navigation,
    Sorting,
}

export let current_mode: Writable<GameMode> = writable(GameMode.Navigation);

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
    },
};

export function check_updates() {
    console.log("Checking updates");
    settings.update((sets) => {
        stats.update((stats) => {
            console.log(stats.pb_correct_clicks);
            if (stats.pb_correct_clicks === undefined) {
                return { pb_correct_clicks: 0 };
            }
            return stats;
        });

        if (sets.version_key === VERSION_KEY) {
            return sets;
        }

        return default_settings;
    });
}

export let settings: Persisted<{
    version_key: string;
    keybinds: object;
    options: object;
}> = persisted("settings", { ...default_settings });

export let stats: Persisted<{ pb_correct_clicks: number }> = persisted(
    "stats",
    {
        pb_correct_clicks: 0,
    },
);

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

// Game durations
export const durations = [5, 10, 30, 60, 120];
