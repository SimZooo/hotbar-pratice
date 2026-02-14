<script lang="ts">
    import { settings, Item, itemImageMap } from "$lib";

    let {
        editing_keybind,
        onBack,
        onKeybindEdit,
    }: {
        editing_keybind: string | null;
        onBack: () => void;
        onKeybindEdit: (key: string | null) => void;
    } = $props();

    const allItems = [Item.None, Item.Pickaxe, Item.Axe, Item.Waterbucket];

    function handleKeybindClick(setting: string) {
        onKeybindEdit(setting);
    }

    function handleOptionToggle() {
        settings.update((sets) => {
            sets.options.offhand_enabled = !sets.options.offhand_enabled;
            return sets;
        });
    }

    function handleSlotClick(slotIndex: number) {
        settings.update((sets) => {
            const target = sets.options.sorting_target as Item[];
            const current = target[slotIndex];
            const currentIdx = allItems.indexOf(current);

            // Find the next item that isn't already placed in another slot
            for (let offset = 1; offset <= allItems.length; offset++) {
                const next = allItems[(currentIdx + offset) % allItems.length];
                if (next === Item.None || !target.some((item: Item, i: number) => i !== slotIndex && item === next)) {
                    target[slotIndex] = next;
                    break;
                }
            }

            sets.options.sorting_target = [...target];
            return sets;
        });
    }
</script>

<button
    class="right-25 top-5 absolute z-10 text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
    onclick={onBack}>Back</button
>

<div
    class="absolute w-full top-10 h-full text-white flex flex-col items-center gap-30 text-xl min-h-0 overflow-y-auto"
>
    <p class="text-4xl">Options</p>
    <div class="grid grid-cols-2 align-middle">
        <p class="text-start">Show Offhand Slot</p>
        <button
            class="bg-[#707070] p-2 w-50 border border-black outline-none text-center hover:cursor-pointer"
            onclick={handleOptionToggle}
        >
            {$settings.options.offhand_enabled}
        </button>
    </div>
    <p class="text-4xl">Sorting Layout</p>
    <div class="flex justify-center">
        {#each Array(9) as _, i}
            <button
                class="relative h-16 aspect-square hover:cursor-pointer"
                onclick={() => handleSlotClick(i)}
            >
                <img
                    src="./slot.png"
                    alt=""
                    class="h-full w-full"
                />
                {#if itemImageMap[$settings.options.sorting_target[i]]}
                    <img
                        src={itemImageMap[$settings.options.sorting_target[i]]}
                        alt=""
                        class="absolute inset-0 w-3/4 h-3/4 m-auto object-contain pointer-events-none z-10"
                    />
                {/if}
            </button>
        {/each}
    </div>
    <p class="text-4xl">Keybinds</p>
    <div class="grid grid-cols-2 grid-rows-auto gap-5 items-center">
        {#each Object.keys($settings.keybinds) as setting}
            <p class="text-start">Hotbar Slot {setting}</p>
            <button
                class="bg-[#707070] p-2 w-50 border border-black outline-none text-center hover:cursor-pointer"
                onclick={() => handleKeybindClick(setting)}
            >
                {#if editing_keybind === setting}
                    _
                {:else}
                    {$settings.keybinds[setting]}
                {/if}
            </button>
        {/each}
    </div>
</div>
