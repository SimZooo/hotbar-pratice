import { persisted, type Persisted } from "svelte-persisted-store";
import { writable, type Writable } from "svelte/store";

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

export let settings: Persisted<{ keybinds: object; options: object }> =
    persisted("settings", { ...default_settings });

export let stats: Persisted<{ pb_cps: number }> = persisted("stats", {
    pb_cps: 0,
});
