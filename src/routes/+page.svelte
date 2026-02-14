<script lang="ts">
    import {
        default_settings,
        hotbar,
        Page,
        settings,
        stats,
        new_slot,
        randomise_hotbar,
        updateSelectedPos,
        validateAndResetSettings,
        durations,
        current_mode,
        GameMode,
        check_updates,
        selected_slot,
        swapWithOffhand,
        checkSortingWin,
        startSortingRound,
    } from "$lib";
    import { onMount } from "svelte";
    import Options from "./Options.svelte";
    import Running from "./Running.svelte";
    import Tutorial from "./Tutorial.svelte";
    import Main from "./Main.svelte";

    let slots: HTMLImageElement[] = $state([]);
    let to_select = $state(new_slot(null));
    let start_time: number = $state(0);
    let duration: number = $state(durations[0]);
    let editing_keybind: string | null = $state(null);
    let current_clicks = $state(0);
    let current_correct_clicks: number | null = $state(null);
    let interval_id = 0;
    let now = $state(Date.now());
    let app: HTMLDivElement | null = $state(null);

    let current_page = $state(Page.Main);

    let container: HTMLDivElement;
    let selectedPos = $state({ left: 0, top: 0 });

    // Check if settings are correct (not old version)
    if (!validateAndResetSettings($settings, default_settings)) {
        settings.update((_) => {
            return default_settings;
        });
    }

    // Update selectedPos after the component mounts or when to_select changes
    function updateSelectedPosition() {
        const pos = updateSelectedPos(to_select, slots, container);
        selectedPos.left = pos.left;
        selectedPos.top = pos.top;
    }

    function reset() {
        current_clicks = 0;
        current_correct_clicks = 0;
        start_time = 0;
    }

    function start() {
        start_time = Date.now();
        current_page = Page.Running;
        current_clicks = 0;
        current_correct_clicks = 0;

        if ($current_mode === GameMode.Sorting) {
            startSortingRound($settings.options.sorting_target);
            to_select = 0;
        }

        interval_id = setInterval(() => {
            now = Date.now();
            if (Date.now() - start_time >= duration * 1000) {
                current_page = Page.Main;
                start_time = 0;

                const pb_key =
                    $current_mode === GameMode.Navigation
                        ? "pb_navigation"
                        : "pb_sorting";
                if ($stats[pb_key] < current_correct_clicks!) {
                    stats.update((stats) => {
                        stats[pb_key] = current_correct_clicks!;
                        return stats;
                    });
                }

                clearInterval(interval_id);
            }
        }, 100);
    }

    function handleDurationChange(dur: number) {
        duration = dur;
    }

    function handleKeybindEdit(key: string | null) {
        editing_keybind = key;
    }

    onMount(() => {
        check_updates();

        updateSelectedPosition();
        window.addEventListener("resize", (e) => {
            updateSelectedPosition();
        });

        history.pushState(null, "", location.href);
        window.addEventListener("popstate", () => {
            history.pushState(null, "", location.href);
        });

        app?.addEventListener("pointerdown", (e) => {
            if (current_page === Page.Options && editing_keybind !== null) {
                let button_label = "Mouse" + e.button;
                settings.update((sets) => {
                    if (!Object.values(sets.keybinds).includes(button_label)) {
                        sets.keybinds[editing_keybind] = button_label;
                    }
                    return sets;
                });
                editing_keybind = null;
            } else if (
                current_page === Page.Running &&
                $current_mode === GameMode.Sorting
            ) {
                // In sorting mode, ignore mouse clicks for navigation scoring
            } else if (
                current_page === Page.Running &&
                "Mouse" + e.button ===
                    $settings.keybinds[(to_select + 1).toString()]
            ) {
                to_select = new_slot([to_select]);
                updateSelectedPosition();
                current_correct_clicks += 1;
                current_clicks += 1;
            } else if (current_page === Page.Running) {
                current_clicks += 1;
            }
        });

        window.addEventListener("keydown", (e) => {
            if (e.repeat) {
                return;
            }
            if (current_page === Page.Options && editing_keybind !== null) {
                settings.update((sets) => {
                    if (!Object.values(sets.keybinds).includes(e.key)) {
                        sets.keybinds[editing_keybind] = e.key;
                    }
                    return sets;
                });
                editing_keybind = null;
            } else if (
                current_page === Page.Running &&
                $current_mode === GameMode.Sorting
            ) {
                // Sorting mode: number keys select slot, offhand key swaps
                for (let i = 1; i <= 9; i++) {
                    if (e.key === $settings.keybinds[i.toString()]) {
                        selected_slot.set(i - 1);
                        to_select = i - 1;
                        updateSelectedPosition();
                        return;
                    }
                }
                if (e.key === $settings.keybinds["offhand"]) {
                    swapWithOffhand();
                    if (checkSortingWin()) {
                        current_correct_clicks! += 1;
                        startSortingRound($settings.options.sorting_target);
                        to_select = 0;
                        updateSelectedPosition();
                    }
                }
            } else if (
                current_page === Page.Running &&
                e.key === $settings.keybinds[(to_select + 1).toString()]
            ) {
                current_correct_clicks += 1;
                current_clicks += 1;
                to_select = new_slot([to_select]);
                updateSelectedPosition();
            } else if (current_page === Page.Running) {
                current_clicks += 1;
            }
        });
    });

    $effect(() => {
        to_select;
        slots[to_select];

        updateSelectedPosition();
    });
</script>

<div
    bind:this={app}
    class="relative w-screen h-screen overflow-hidden"
    bind:this={container}
>
    <img
        src="./bg/background.webp"
        alt=""
        class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
    />

    {#if current_page === Page.Options}
        <Options
            {editing_keybind}
            onBack={() => (current_page = Page.Main)}
            onKeybindEdit={handleKeybindEdit}
        />
    {:else if current_page === Page.Running}
        <Running
            {slots}
            {to_select}
            {selectedPos}
            {current_correct_clicks}
            {now}
            {start_time}
            {container}
            onBack={() => {
                current_page = Page.Main;
                reset();
            }}
        />
    {:else if current_page === Page.Tutorial}
        <Tutorial
            onBack={() => {
                current_page = Page.Main;
                reset();
            }}
        />
    {:else}
        <Main
            {current_correct_clicks}
            {duration}
            onDurationChange={handleDurationChange}
            onStart={start}
            onOptions={() => (current_page = Page.Options)}
            onTutorial={() => (current_page = Page.Tutorial)}
        />
    {/if}
    <a
        href="https://buymeacoffee.com/simzooo"
        target="_black"
        class="absolute bottom-10 left-10 bg-[#FFDD00] hidden lg:flex flex-row gap-2 rounded items-center p-2"
    >
        <img
            src="https://cdn.buymeacoffee.com/widget/assets/coffee%20cup.svg"
            alt="Buy Me A Coffee"
            style="height: 36px; width: 36px; margin: 0; padding: 0;"
        />
        Support me!
    </a>
</div>

<style>
    * {
        font-family: "Minecraftia";
    }
</style>
