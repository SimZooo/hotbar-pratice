<script lang="ts">
    import { settings } from "$lib";

    let {
        editing_keybind,
        onBack,
        onKeybindEdit,
    }: {
        editing_keybind: string | null;
        onBack: () => void;
        onKeybindEdit: (key: string | null) => void;
    } = $props();

    function handleKeybindClick(setting: string) {
        onKeybindEdit(setting);
    }

    function handleOptionToggle() {
        settings.update((sets) => {
            sets.options.offhand_enabled = !sets.options.offhand_enabled;
            return sets;
        });
    }
</script>

<button
    class="right-25 top-5 absolute text-white text-2xl w-60 h-15 text-center items-center bg-[#6F6F6F] flex flex-col justify-center border-3 border-black hover:cursor-pointer text-shadow-black text-shadow-lg"
    onclick={onBack}>Back</button
>

<div
    class="absolute w-1/3 place-self-center top-10 h-full text-white flex flex-col gap-30 text-xl min-h-0 overflow-y-auto"
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
