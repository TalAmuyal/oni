/**
 * Test the Markdown-preview plugin
 */

import * as assert from "assert"
import * as Oni from "oni-api"

interface IPluginManager {
    getPlugin(name: string): any
}

interface IOniWithPluginApi {
    plugins: IPluginManager
}

export async function test(typedOni: Oni.Plugin.Api) {
    const typelessOni = typedOni as any
    const oni = typelessOni as IOniWithPluginApi

    const markdownPlugin = oni.plugins.getPlugin("oni-plugin-markdown-preview")
    describe("plugin instance", () => {
        it("exists", () => {
            assert.notEqual(markdownPlugin, null)
            assert.notEqual(markdownPlugin, undefined)
        })
    })

    describe("preview pane", async () => {
        it("is initially closed", () => {
            const isOpen = markdownPlugin.getStatus("is-preview-open") as boolean
            assert.strictEqual(isOpen, false)
        })

        await typedOni.automation.waitForEditors()

        describe("open an empty markdown file", async () => {
            const testFileName = "markdown-preview-test.md"
            typedOni.automation.sendKeys(":e " + testFileName + "<enter>")
            await typedOni.automation.waitFor(
                () => typedOni.editors.activeEditor.activeBuffer.filePath === testFileName,
            )

            it("opens an empty preview pane", async () => {
                await typedOni.automation.waitFor(
                    () => markdownPlugin.getStatus("is-preview-open") === true,
                )
                assert.strictEqual(markdownPlugin.getStatus("pre-render-content").trim(), "")
            })

            describe("with Markdown title", async () => {
                typedOni.automation.sendKeys("i")
                await awaitEditorMode(typedOni, "insert")
                typedOni.automation.sendKeys("# Title 1<esc>")
                await awaitEditorMode(typedOni, "normal")

                it("has a Header element", () => {
                    const content = markdownPlugin.getStatus("rendered-content") as string
                    const contains = content.indexOf("<h1>Title 1</h>") >= 0
                    assert.equal(contains, true)
                })
            })
        })
    })
}

async function awaitEditorMode(oni: Oni.Plugin.Api, mode: string): Promise<void> {
    function condition(): boolean {
        return oni.editors.activeEditor.mode === mode
    }
    await oni.automation.waitFor(condition)
}
